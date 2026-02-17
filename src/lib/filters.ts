import type { IssueWithAssignee } from '@/lib/hooks/useIssues'
import type { IssueFilters } from '@/lib/types/filters'

const SEARCH_MIN = 2

export function applyIssueFilters(
  issues: IssueWithAssignee[],
  filters: IssueFilters,
  currentUserId?: string | null,
  activeSprintId?: string | null
) {
  const query = filters.query.trim().toLowerCase()
  return issues.filter((issue) => {
    if (filters.myOnly && currentUserId && issue.assigneeId !== currentUserId) return false

    if (filters.assigneeIds.length > 0) {
      const unassigned = filters.assigneeIds.includes('unassigned')
      const matches = issue.assigneeId ? filters.assigneeIds.includes(issue.assigneeId) : false
      if (!matches && !(unassigned && !issue.assigneeId)) return false
    }

    if (filters.reporterIds.length > 0) {
      const matches = issue.reporterId ? filters.reporterIds.includes(issue.reporterId) : false
      if (!matches) return false
    }

    if (filters.issueTypes.length > 0 && !filters.issueTypes.includes(issue.issueType)) return false
    if (filters.priorities.length > 0 && !filters.priorities.includes(issue.priority)) return false
    if (filters.statuses.length > 0 && !filters.statuses.includes(issue.status)) return false

    if (filters.sprintFilter === 'backlog' && issue.sprintId) return false
    if (filters.sprintFilter === 'active') {
      if (!activeSprintId) return false
      if (issue.sprintId !== activeSprintId) return false
    }
    if (filters.sprintFilter === 'specific') {
      if (!filters.sprintId) return false
      if (issue.sprintId !== filters.sprintId) return false
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      if (!issue.dueDate) return false
      const dueDate = new Date(issue.dueDate)
      if (filters.dueDateFrom) {
        const fromDate = new Date(filters.dueDateFrom)
        if (dueDate < fromDate) return false
      }
      if (filters.dueDateTo) {
        const toDate = new Date(filters.dueDateTo)
        if (dueDate > toDate) return false
      }
    }

    if (filters.labels.length > 0) {
      const labels = issue.labels ?? []
      const hasLabel = labels.some((label) => filters.labels.includes(label))
      if (!hasLabel) return false
    }

    if (query.length >= SEARCH_MIN) {
      const inKey = issue.issueKey.toLowerCase().includes(query)
      const inSummary = issue.summary.toLowerCase().includes(query)
      if (!inKey && !inSummary) return false
    }

    return true
  })
}
