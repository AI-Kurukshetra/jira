import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { commentSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { logActivity } from '@/lib/services/activity'
import { createNotification } from '@/lib/services/notifications'

interface Params {
  params: Promise<{ id: string }>
}

const commentUpdateSchema = z.object({
  commentId: z.string().uuid(),
  body: z.string().min(1).max(5000)
})

const commentDeleteSchema = z.object({
  commentId: z.string().uuid()
})

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = commentSchema.safeParse({ ...payload, issueId: id })
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data, error: insertError } = await supabase
    .from('comments')
    .insert({
      issue_id: id,
      author_id: user.id,
      body: parsed.data.body
    })
    .select('*')
    .single()

  if (insertError || !data) {
    logger.error({ insertError }, 'Failed to add comment')
    return fail('Failed to add comment', 500)
  }

  await logActivity(supabase, {
    issueId: id,
    userId: user.id,
    actionType: 'comment_added'
  })

  const { data: issue } = await supabase
    .from('issues')
    .select('reporter_id, assignee_id, issue_key, project_id, summary')
    .eq('id', id)
    .single()

  const { data: watchers } = await supabase
    .from('issue_watchers')
    .select('user_id')
    .eq('issue_id', id)

  const mentioned = new Set<string>()
  const mentionMatches = parsed.data.body.match(/@([a-zA-Z0-9._-]+)/g) ?? []
  if (mentionMatches.length > 0 && issue?.project_id) {
    const tokens = mentionMatches.map((value) => value.replace('@', '').toLowerCase())
    const { data: members } = await supabase
      .from('project_members')
      .select('user_id, profiles!project_members_user_id_fkey(full_name, display_name)')
      .eq('project_id', issue.project_id)

    const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '')
    members?.forEach((member) => {
      const profile = (member as { profiles?: { full_name?: string | null; display_name?: string | null } }).profiles
      const fullName = profile?.full_name ?? ''
      const displayName = profile?.display_name ?? ''
      const normalized = normalize(displayName || fullName)
      if (normalized && tokens.some((token) => normalized.includes(token))) {
        mentioned.add(member.user_id)
      }
    })
  }

  const recipients = new Set<string>()
  ;[issue?.reporter_id, issue?.assignee_id]
    .filter((value): value is string => Boolean(value))
    .forEach((value) => recipients.add(value))
  watchers?.forEach((watcher) => {
    if (watcher.user_id) recipients.add(watcher.user_id)
  })
  recipients.delete(user.id)

  await Promise.all(
    Array.from(recipients).map((recipientId) =>
      createNotification(supabase, {
        recipientId,
        type: 'comment_added',
        title: `New comment on ${issue?.issue_key ?? 'issue'}`,
        message: issue?.summary ?? 'Comment added',
        relatedIssueId: id,
        relatedProjectId: issue?.project_id ?? null
      })
    )
  )

  await Promise.all(
    Array.from(mentioned)
      .filter((recipientId) => recipientId !== user.id)
      .map((recipientId) =>
        createNotification(supabase, {
          recipientId,
          type: 'mention',
          title: `You were mentioned on ${issue?.issue_key ?? 'issue'}`,
          message: issue?.summary ?? 'Mentioned in a comment',
          relatedIssueId: id,
          relatedProjectId: issue?.project_id ?? null
        })
      )
  )

  return ok(data, 201)
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data, error: fetchError } = await supabase
    .from('comments')
    .select('id, body, created_at, is_deleted, author:profiles!comments_author_id_fkey(id, full_name, display_name, avatar_url)')
    .eq('issue_id', id)
    .order('created_at', { ascending: true })

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch comments')
    return fail('Failed to fetch comments', 500)
  }

  const toProfile = (value: unknown) => {
    if (Array.isArray(value)) {
      return value[0] ?? null
    }
    return value ?? null
  }

  const mapped = (data ?? []).map((comment) => {
    const rawAuthor = toProfile((comment as { author?: unknown }).author)
    const author = rawAuthor as
      | { id?: string | null; full_name?: string | null; display_name?: string | null; avatar_url?: string | null }
      | null

    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.created_at,
      isDeleted: comment.is_deleted,
      author: author
        ? {
            id: author.id ?? '',
            fullName: author.full_name ?? null,
            displayName: author.display_name ?? null,
            avatarUrl: author.avatar_url ?? null
          }
        : null
    }
  })

  return ok(mapped)
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = commentUpdateSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data, error: updateError } = await supabase
    .from('comments')
    .update({ body: parsed.data.body })
    .eq('id', parsed.data.commentId)
    .eq('issue_id', id)
    .select('*')
    .single()

  if (updateError || !data) {
    logger.error({ updateError }, 'Failed to update comment')
    return fail('Failed to update comment', 500)
  }

  await logActivity(supabase, {
    issueId: id,
    userId: user.id,
    actionType: 'comment_updated'
  })

  return ok(data)
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = commentDeleteSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data, error: deleteError } = await supabase
    .from('comments')
    .update({ is_deleted: true })
    .eq('id', parsed.data.commentId)
    .eq('issue_id', id)
    .select('*')
    .single()

  if (deleteError || !data) {
    logger.error({ deleteError }, 'Failed to delete comment')
    return fail('Failed to delete comment', 500)
  }

  await logActivity(supabase, {
    issueId: id,
    userId: user.id,
    actionType: 'comment_deleted'
  })

  return ok(data)
}
