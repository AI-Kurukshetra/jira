import type { Issue, IssuePriority, IssueStatus, IssueType, Profile, Project, Sprint } from '@/lib/types'
import type { ProfileLite } from '@/lib/types/profile'
import type { IssueWithAssignee } from '@/lib/hooks/useIssues'

interface DbProfileRow {
  id: string
  full_name: string
  display_name?: string | null
  avatar_url?: string | null
  timezone?: string | null
  role?: string | null
  is_active?: boolean | null
  notification_prefs?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

interface DbProjectRow {
  id: string
  name: string
  key: string
  description?: string | null
  project_type: string
  status: string
  lead_user_id?: string | null
  avatar_url?: string | null
  start_date?: string | null
  end_date?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

interface DbSprintRow {
  id: string
  project_id: string
  name: string
  goal?: string | null
  status: string
  start_date?: string | null
  end_date?: string | null
  completed_at?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

interface DbIssueRow {
  id: string
  project_id: string
  sprint_id?: string | null
  parent_issue_id?: string | null
  issue_key: string
  issue_type: string
  summary: string
  description?: string | null
  status: string
  priority: string
  assignee_id?: string | null
  reporter_id?: string | null
  story_points?: number | null
  due_date?: string | null
  board_order: number
  resolved_at?: string | null
  deleted_at?: string | null
  created_at: string
  updated_at: string
  assignee?: DbProfileLite | DbProfileLite[] | null
  issue_labels?: Array<{ labels?: { name?: string | null } | null }>
}

interface DbProfileLite {
  id?: string | null
  full_name?: string | null
  display_name?: string | null
  avatar_url?: string | null
}

const ISSUE_TYPES: IssueType[] = ['story', 'task', 'bug', 'subtask']
const ISSUE_STATUSES: IssueStatus[] = ['todo', 'inprogress', 'done']
const ISSUE_PRIORITIES: IssuePriority[] = ['highest', 'high', 'medium', 'low', 'lowest']
const PROJECT_TYPES: Project['projectType'][] = ['software', 'business', 'ops']
const PROJECT_STATUSES: Project['status'][] = ['active', 'archived', 'deleted']
const SPRINT_STATUSES: Sprint['status'][] = ['pending', 'active', 'completed']
const USER_ROLES: Profile['role'][] = ['system_admin', 'project_admin', 'developer', 'viewer']

const isIssueType = (value: string): value is IssueType => ISSUE_TYPES.includes(value as IssueType)
const isIssueStatus = (value: string): value is IssueStatus => ISSUE_STATUSES.includes(value as IssueStatus)
const isIssuePriority = (value: string): value is IssuePriority => ISSUE_PRIORITIES.includes(value as IssuePriority)
const isProjectType = (value: string): value is Project['projectType'] => PROJECT_TYPES.includes(value as Project['projectType'])
const isProjectStatus = (value: string): value is Project['status'] => PROJECT_STATUSES.includes(value as Project['status'])
const isSprintStatus = (value: string): value is Sprint['status'] => SPRINT_STATUSES.includes(value as Sprint['status'])
const isUserRole = (value: string | null | undefined): value is NonNullable<Profile['role']> =>
  Boolean(value) && USER_ROLES.includes(value as NonNullable<Profile['role']>)

const toProfileLite = (value: DbProfileLite | DbProfileLite[] | null | undefined): ProfileLite | null => {
  if (!value) return null
  const record = Array.isArray(value) ? value[0] : value
  if (!record) return null
  return {
    id: record.id ?? '',
    fullName: record.full_name ?? null,
    displayName: record.display_name ?? null,
    avatarUrl: record.avatar_url ?? null
  }
}

const toNotificationPrefs = (value: Record<string, unknown> | null | undefined): Profile['notificationPrefs'] | undefined => {
  if (!value) return undefined
  const prefs: Profile['notificationPrefs'] = {}
  if (typeof value.email === 'boolean') prefs.email = value.email
  if (typeof value.inApp === 'boolean') prefs.inApp = value.inApp
  if (typeof value.assignments === 'boolean') prefs.assignments = value.assignments
  if (typeof value.statusChanges === 'boolean') prefs.statusChanges = value.statusChanges
  if (typeof value.comments === 'boolean') prefs.comments = value.comments
  if (typeof value.mentions === 'boolean') prefs.mentions = value.mentions
  return Object.keys(prefs).length > 0 ? prefs : undefined
}

export const mapProfileRow = (row: DbProfileRow): Profile => {
  const prefs = toNotificationPrefs(row.notification_prefs)
  return {
    id: row.id,
    fullName: row.full_name,
    ...(row.display_name ? { displayName: row.display_name } : {}),
    ...(row.avatar_url ? { avatarUrl: row.avatar_url } : {}),
    ...(row.timezone ? { timezone: row.timezone } : {}),
    ...(isUserRole(row.role ?? null) ? { role: row.role as NonNullable<Profile['role']> } : {}),
    ...(row.is_active !== null && row.is_active !== undefined ? { isActive: row.is_active } : {}),
    ...(prefs ? { notificationPrefs: prefs } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export const mapProjectRow = (row: DbProjectRow): Project => ({
  id: row.id,
  name: row.name,
  key: row.key,
  ...(row.description ? { description: row.description } : {}),
  projectType: isProjectType(row.project_type) ? row.project_type : 'software',
  status: isProjectStatus(row.status) ? row.status : 'active',
  ...(row.lead_user_id ? { leadUserId: row.lead_user_id } : {}),
  ...(row.avatar_url ? { avatarUrl: row.avatar_url } : {}),
  ...(row.start_date ? { startDate: row.start_date } : {}),
  ...(row.end_date ? { endDate: row.end_date } : {}),
  ...(row.created_by ? { createdBy: row.created_by } : {}),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  ...(row.deleted_at ? { deletedAt: row.deleted_at } : {})
})

export const mapSprintRow = (row: DbSprintRow): Sprint => ({
  id: row.id,
  projectId: row.project_id,
  name: row.name,
  ...(row.goal ? { goal: row.goal } : {}),
  status: isSprintStatus(row.status) ? row.status : 'pending',
  ...(row.start_date ? { startDate: row.start_date } : {}),
  ...(row.end_date ? { endDate: row.end_date } : {}),
  ...(row.completed_at ? { completedAt: row.completed_at } : {}),
  ...(row.created_by ? { createdBy: row.created_by } : {}),
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

export const mapIssueRow = (row: DbIssueRow): IssueWithAssignee => ({
  id: row.id,
  projectId: row.project_id,
  sprintId: row.sprint_id ?? null,
  parentIssueId: row.parent_issue_id ?? null,
  issueKey: row.issue_key,
  issueType: isIssueType(row.issue_type) ? row.issue_type : 'task',
  summary: row.summary,
  description: row.description ?? null,
  status: isIssueStatus(row.status) ? row.status : 'todo',
  priority: isIssuePriority(row.priority) ? row.priority : 'medium',
  labels: (row.issue_labels ?? [])
    .map((entry) => entry.labels?.name ?? null)
    .filter((label): label is string => Boolean(label)),
  assigneeId: row.assignee_id ?? null,
  reporterId: row.reporter_id ?? null,
  storyPoints: row.story_points ?? null,
  dueDate: row.due_date ?? null,
  boardOrder: row.board_order ?? 0,
  resolvedAt: row.resolved_at ?? null,
  deletedAt: row.deleted_at ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  assignee: toProfileLite(row.assignee)
})

export const mapIssueRowWithoutAssignee = (row: DbIssueRow): Issue => {
  const mapped = mapIssueRow(row)
  return {
    id: mapped.id,
    projectId: mapped.projectId,
    ...(mapped.sprintId !== undefined ? { sprintId: mapped.sprintId } : {}),
    ...(mapped.parentIssueId !== undefined ? { parentIssueId: mapped.parentIssueId } : {}),
    issueKey: mapped.issueKey,
    issueType: mapped.issueType,
    summary: mapped.summary,
    ...(mapped.description !== undefined ? { description: mapped.description } : {}),
    status: mapped.status,
    priority: mapped.priority,
    ...(mapped.assigneeId !== undefined ? { assigneeId: mapped.assigneeId } : {}),
    ...(mapped.reporterId !== undefined ? { reporterId: mapped.reporterId } : {}),
    ...(mapped.storyPoints !== undefined ? { storyPoints: mapped.storyPoints } : {}),
    ...(mapped.dueDate !== undefined ? { dueDate: mapped.dueDate } : {}),
    boardOrder: mapped.boardOrder,
    ...(mapped.resolvedAt !== undefined ? { resolvedAt: mapped.resolvedAt } : {}),
    ...(mapped.deletedAt !== undefined ? { deletedAt: mapped.deletedAt } : {}),
    createdAt: mapped.createdAt,
    updatedAt: mapped.updatedAt
  }
}
