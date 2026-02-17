import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { issueSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { logActivity } from '@/lib/services/activity'
import { createNotification } from '@/lib/services/notifications'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const sprintId = searchParams.get('sprintId')
  const status = searchParams.get('status')
  const assigneeId = searchParams.get('assigneeId')
  const query = searchParams.get('query')

  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  let queryBuilder = supabase.from('issues').select('*').order('created_at', { ascending: false })

  if (projectId) queryBuilder = queryBuilder.eq('project_id', projectId)
  if (sprintId) queryBuilder = queryBuilder.eq('sprint_id', sprintId)
  if (status) queryBuilder = queryBuilder.eq('status', status)
  if (assigneeId) queryBuilder = queryBuilder.eq('assignee_id', assigneeId)
  if (query) queryBuilder = queryBuilder.ilike('summary', `%${query}%`)

  const { data, error: fetchError } = await queryBuilder

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch issues')
    return fail('Failed to fetch issues', 500)
  }

  return ok(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = issueSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data: issue, error: insertError } = await supabase
    .from('issues')
    .insert({
      project_id: parsed.data.projectId,
      sprint_id: parsed.data.sprintId ?? null,
      parent_issue_id: parsed.data.parentIssueId ?? null,
      issue_type: parsed.data.issueType,
      summary: parsed.data.summary,
      description: parsed.data.description ?? null,
      status: parsed.data.status ?? 'todo',
      priority: parsed.data.priority ?? 'medium',
      assignee_id: parsed.data.assigneeId ?? null,
      reporter_id: parsed.data.reporterId ?? user.id,
      story_points: parsed.data.storyPoints ?? null,
      due_date: parsed.data.dueDate ?? null
    })
    .select('*')
    .single()

  if (insertError || !issue) {
    logger.error({ insertError }, 'Failed to create issue')
    return fail('Failed to create issue', 500)
  }

  await logActivity(supabase, {
    issueId: issue.id,
    userId: user.id,
    actionType: 'issue_created'
  })

  if (issue.assignee_id && issue.assignee_id !== user.id) {
    await createNotification(supabase, {
      recipientId: issue.assignee_id,
      type: 'issue_assigned',
      title: `Assigned to ${issue.issue_key}`,
      message: issue.summary,
      relatedIssueId: issue.id,
      relatedProjectId: issue.project_id
    })
  }

  return ok(issue, 201)
}
