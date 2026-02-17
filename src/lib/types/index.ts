export type Id = string

export type UserRole = 'system_admin' | 'project_admin' | 'developer' | 'viewer'
export type ProjectRole = 'project_admin' | 'developer' | 'viewer'

export type ProjectType = 'software' | 'business' | 'ops'
export type ProjectStatus = 'active' | 'archived' | 'deleted'

export type IssueType = 'story' | 'task' | 'bug' | 'subtask'
export type IssueStatus = 'todo' | 'inprogress' | 'done'
export type IssuePriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest'

export type SprintStatus = 'pending' | 'active' | 'completed'

export interface Profile {
  id: Id
  fullName: string
  displayName?: string
  avatarUrl?: string
  timezone?: string
  role?: UserRole
  isActive?: boolean
  notificationPrefs?: {
    email?: boolean
    inApp?: boolean
    assignments?: boolean
    statusChanges?: boolean
    comments?: boolean
    mentions?: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface AdminUser {
  id: Id
  email?: string | null
  fullName?: string | null
  displayName?: string | null
  avatarUrl?: string | null
  role: UserRole
  isActive: boolean
  createdAt?: string | null
  lastSignInAt?: string | null
}

export interface Project {
  id: Id
  name: string
  key: string
  description?: string
  projectType: ProjectType
  status: ProjectStatus
  leadUserId?: Id
  avatarUrl?: string
  startDate?: string
  endDate?: string
  createdBy?: Id
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface ProjectMember {
  id: Id
  projectId: Id
  userId: Id
  role: ProjectRole
  joinedAt: string
}

export interface Sprint {
  id: Id
  projectId: Id
  name: string
  goal?: string
  status: SprintStatus
  startDate?: string
  endDate?: string
  completedAt?: string
  createdBy?: Id
  createdAt: string
  updatedAt: string
}

export interface Label {
  id: Id
  projectId: Id
  name: string
  colorHex: string
  createdAt: string
}

export interface Issue {
  id: Id
  projectId: Id
  sprintId?: Id | null
  parentIssueId?: Id | null
  issueKey: string
  issueType: IssueType
  summary: string
  description?: string | null
  status: IssueStatus
  priority: IssuePriority
  labels?: string[]
  assigneeId?: Id | null
  reporterId?: Id | null
  storyPoints?: number | null
  dueDate?: string | null
  boardOrder: number
  resolvedAt?: string | null
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface IssueLabel {
  issueId: Id
  labelId: Id
}

export interface Comment {
  id: Id
  issueId: Id
  authorId: Id
  body: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface ActivityLog {
  id: Id
  issueId: Id
  userId?: Id | null
  actionType: string
  fieldName?: string | null
  oldValue?: string | null
  newValue?: string | null
  createdAt: string
}

export interface Attachment {
  id: Id
  issueId: Id
  uploaderId?: Id | null
  fileName: string
  fileSize?: number | null
  fileType?: string | null
  storagePath: string
  createdAt: string
}

export interface Notification {
  id: Id
  recipientId: Id
  type: string
  title: string
  message: string
  relatedIssueId?: Id | null
  relatedProjectId?: Id | null
  isRead: boolean
  createdAt: string
}

export interface IssueWatcher {
  issueId: Id
  userId: Id
}

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type ApiResponse<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
