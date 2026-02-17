import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { issueSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { logActivity } from '@/lib/services/activity'
import { createNotification } from '@/lib/services/notifications'
import { isValidTransition } from '@/lib/utils'

interface Params {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data, error: fetchError } = await supabase.from('issues').select('*').eq('id', params.id).single()

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch issue')
    return fail('Failed to fetch issue', 500)
  }

  return ok(data)
}

export async function PATCH(request: Request, { params }: Params) {
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = issueSchema.partial().safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data: current, error: fetchError } = await supabase
    .from('issues')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchError || !current) {
    logger.error({ fetchError }, 'Failed to fetch issue for update')
    return fail('Failed to update issue', 500)
  }

  if (parsed.data.status && !isValidTransition(current.status, parsed.data.status)) {
    return fail('Invalid status transition', 400)
  }

  const nextStatus = parsed.data.status ?? current.status
  const resolvedAt = nextStatus === 'done' && current.status !== 'done' ? new Date().toISOString() : current.resolved_at

  const { data: updated, error: updateError } = await supabase
    .from('issues')
    .update({
      sprint_id: parsed.data.sprintId ?? current.sprint_id,
      parent_issue_id: parsed.data.parentIssueId ?? current.parent_issue_id,
      issue_type: parsed.data.issueType ?? current.issue_type,
      summary: parsed.data.summary ?? current.summary,
      description: parsed.data.description ?? current.description,
      status: nextStatus,
      priority: parsed.data.priority ?? current.priority,
      assignee_id: parsed.data.assigneeId ?? current.assignee_id,
      reporter_id: parsed.data.reporterId ?? current.reporter_id,
      story_points: parsed.data.storyPoints ?? current.story_points,
      due_date: parsed.data.dueDate ?? current.due_date,
      resolved_at: resolvedAt
    })
    .eq('id', params.id)
    .select('*')
    .single()

  if (updateError || !updated) {
    logger.error({ updateError }, 'Failed to update issue')
    return fail('Failed to update issue', 500)
  }

  const changes: Array<{ field: string; before: string | null; after: string | null }> = []
  const diff = (field: string, before: unknown, after: unknown) => {
    if (before !== after) {
      changes.push({ field, before: before === undefined ? null : String(before), after: after === undefined ? null : String(after) })
    }
  }

  diff('summary', current.summary, updated.summary)
  diff('description', current.description, updated.description)
  diff('status', current.status, updated.status)
  diff('priority', current.priority, updated.priority)
  diff('assignee_id', current.assignee_id, updated.assignee_id)
  diff('reporter_id', current.reporter_id, updated.reporter_id)
  diff('sprint_id', current.sprint_id, updated.sprint_id)
  diff('story_points', current.story_points, updated.story_points)
  diff('due_date', current.due_date, updated.due_date)

  await Promise.all(
    changes.map((change) =>
      logActivity(supabase, {
        issueId: updated.id,
        userId: user.id,
        actionType: 'issue_updated',
        fieldName: change.field,
        oldValue: change.before,
        newValue: change.after
      })
    )
  )

  if (updated.assignee_id && updated.assignee_id !== current.assignee_id) {
    await createNotification(supabase, {
      recipientId: updated.assignee_id,
      type: 'issue_assigned',
      title: `Assigned to ${updated.issue_key}`,
      message: updated.summary,
      relatedIssueId: updated.id,
      relatedProjectId: updated.project_id
    })
  }

  if (updated.status !== current.status) {
    const notifyTargets = [updated.reporter_id, updated.assignee_id].filter(
      (value): value is string => Boolean(value)
    )

    await Promise.all(
      notifyTargets.map((recipientId) =>
        createNotification(supabase, {
          recipientId,
          type: 'status_changed',
          title: `Status updated: ${updated.issue_key}`,
          message: `Moved to ${updated.status}`,
          relatedIssueId: updated.id,
          relatedProjectId: updated.project_id
        })
      )
    )
  }

  return ok(updated)
}

export async function DELETE(_request: Request, { params }: Params) {
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { error: deleteError } = await supabase
    .from('issues')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', params.id)

  if (deleteError) {
    logger.error({ deleteError }, 'Failed to delete issue')
    return fail('Failed to delete issue', 500)
  }

  return ok({ id: params.id })
}
