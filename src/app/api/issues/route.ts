import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { issueSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { logActivity } from '@/lib/services/activity'
import { createNotification } from '@/lib/services/notifications'
import { mapIssueRow, mapIssueRowWithoutAssignee } from '@/lib/api/mappers'
import type { ProfileLite } from '@/lib/types/profile'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const sprintId = searchParams.get('sprintId')
  const status = searchParams.get('status')
  const assigneeId = searchParams.get('assigneeId')
  const query = searchParams.get('query')
  const issueKey = searchParams.get('issueKey')

  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  let queryBuilder = supabase
    .from('issues')
    .select('*, issue_labels(labels(name))')
    .order('created_at', { ascending: false })

  if (projectId) queryBuilder = queryBuilder.eq('project_id', projectId)
  if (sprintId) queryBuilder = queryBuilder.eq('sprint_id', sprintId)
  if (status) queryBuilder = queryBuilder.eq('status', status)
  if (assigneeId) queryBuilder = queryBuilder.eq('assignee_id', assigneeId)
  if (query) queryBuilder = queryBuilder.ilike('summary', `%${query}%`)
  if (issueKey) queryBuilder = queryBuilder.eq('issue_key', issueKey)

  const { data, error: fetchError } = await queryBuilder

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch issues')
    return fail(fetchError.message ?? 'Failed to fetch issues', 500)
  }

  const mapped = (data ?? []).map((issue) => mapIssueRowWithoutAssignee(issue))

  const assigneeIds = Array.from(
    new Set(
      mapped
        .map((issue) => issue.assigneeId ?? null)
        .filter((id): id is string => Boolean(id))
    )
  )

  let assigneeMap = new Map<string, ProfileLite>()
  if (assigneeIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, display_name, avatar_url')
      .in('id', assigneeIds)

    if (profileError) {
      logger.error({ profileError }, 'Failed to fetch assignees')
      return fail(profileError.message ?? 'Failed to fetch issues', 500)
    }

    assigneeMap = new Map(
      (profiles ?? []).map((profile) => [
        profile.id,
        {
          id: profile.id,
          fullName: profile.full_name,
          ...(profile.display_name ? { displayName: profile.display_name } : {}),
          ...(profile.avatar_url ? { avatarUrl: profile.avatar_url } : {})
        }
      ])
    )
  }

  const projectIds = Array.from(new Set(mapped.map((issue) => issue.projectId)))
  let projectKeyMap = new Map<string, string>()
  if (projectIds.length > 0) {
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id, key')
      .in('id', projectIds)

    if (projectError) {
      logger.error({ projectError }, 'Failed to fetch project keys')
      return fail(projectError.message ?? 'Failed to fetch issues', 500)
    }

    projectKeyMap = new Map((projects ?? []).map((project) => [project.id, project.key]))
  }

  const enriched = mapped.map((issue) => ({
    ...issue,
    ...(issue.assigneeId ? { assignee: assigneeMap.get(issue.assigneeId) ?? null } : {}),
    ...(projectKeyMap.get(issue.projectId) ? { projectKey: projectKeyMap.get(issue.projectId) } : {})
  }))

  return ok(enriched)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = issueSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? parsed.error.message, 400)

  const { data: columns, error: columnsError } = await supabase
    .from('board_columns')
    .select('id, status, position')
    .eq('project_id', parsed.data.projectId)
    .order('position', { ascending: true })

  if (columnsError) {
    logger.error({ columnsError }, 'Failed to load board columns')
    return fail('Failed to load board columns', 500)
  }

  const requestedColumn = parsed.data.columnId
    ? columns?.find((column) => column.id === parsed.data.columnId)
    : undefined

  const fallbackColumn = columns?.find((column) => column.status === (parsed.data.status ?? 'todo')) ?? columns?.[0]

  if (!requestedColumn && !fallbackColumn) {
    return fail('No board columns available for this project', 400)
  }

  const selectedColumn = requestedColumn ?? fallbackColumn!
  const selectedStatus = selectedColumn.status

  const { data: issue, error: insertError } = await supabase
    .from('issues')
    .insert({
      project_id: parsed.data.projectId,
      sprint_id: parsed.data.sprintId ?? null,
      parent_issue_id: parsed.data.parentIssueId ?? null,
      column_id: selectedColumn.id,
      issue_type: parsed.data.issueType,
      summary: parsed.data.summary,
      description: parsed.data.description ?? null,
      status: selectedStatus,
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
    return fail(insertError?.message ?? 'Failed to create issue', 500)
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

  return ok(mapIssueRow(issue), 201)
}
