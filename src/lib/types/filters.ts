import type { IssuePriority, IssueStatus, IssueType } from '@/lib/types'

export type SprintFilter = 'all' | 'active' | 'backlog' | 'specific'

export interface IssueFilters {
  query: string
  assigneeIds: string[]
  reporterIds: string[]
  issueTypes: IssueType[]
  priorities: IssuePriority[]
  statuses: IssueStatus[]
  labels: string[]
  sprintFilter: SprintFilter
  sprintId: string | undefined
  dueDateFrom: string | undefined
  dueDateTo: string | undefined
  myOnly: boolean
}
