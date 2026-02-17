'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { IssueWithAssignee } from '@/lib/hooks/useIssues'

export function useIssueByKey(projectId: string | undefined, issueKey: string) {
  return useQuery({
    queryKey: ['issue', projectId, issueKey],
    enabled: Boolean(projectId && issueKey),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (projectId) params.set('projectId', projectId)
      params.set('issueKey', issueKey)
      const result = await apiGet<IssueWithAssignee[]>(`/api/issues?${params.toString()}`)
      if (!result.success) throw new Error(result.error)
      return result.data[0] ?? null
    }
  })
}
