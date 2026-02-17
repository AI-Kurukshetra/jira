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

  const recipients = [issue?.reporter_id, issue?.assignee_id].filter(
    (value): value is string => Boolean(value) && value !== user.id
  )

  await Promise.all(
    recipients.map((recipientId) =>
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

  return ok(data, 201)
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
