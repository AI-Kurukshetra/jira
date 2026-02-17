import type { IssuePriority, IssueStatus, IssueType } from '@/lib/types'

export interface IssueFilters {
  query: string
  assigneeIds: string[]
  issueTypes: IssueType[]
  priorities: IssuePriority[]
  statuses: IssueStatus[]
  labels: string[]
  myOnly: boolean
}
