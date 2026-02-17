'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { Issue } from '@/lib/types'
import type { ProfileLite } from '@/lib/types/profile'

interface UseIssuesParams {
  projectId?: string
  sprintId?: string
  status?: string
  assigneeId?: string
  query?: string
}

export interface IssueWithAssignee extends Issue {
  assignee?: ProfileLite | null
}

export function useIssues(params?: UseIssuesParams) {
  const search = new URLSearchParams()
  if (params?.projectId) search.set('projectId', params.projectId)
  if (params?.sprintId) search.set('sprintId', params.sprintId)
  if (params?.status) search.set('status', params.status)
  if (params?.assigneeId) search.set('assigneeId', params.assigneeId)
  if (params?.query) search.set('query', params.query)

  const queryString = search.toString()

  return useQuery({
    queryKey: ['issues', queryString],
    queryFn: async () => {
      const result = await apiGet<IssueWithAssignee[]>(`/api/issues${queryString ? `?${queryString}` : ''}`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}
