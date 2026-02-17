'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'

interface ActivityItemDto {
  id: string
  actionType: string
  fieldName?: string | null
  oldValue?: string | null
  newValue?: string | null
  createdAt: string
}

export function useActivity(issueId?: string) {
  return useQuery({
    queryKey: ['activity', issueId],
    enabled: Boolean(issueId),
    queryFn: async () => {
      if (!issueId) return []
      const result = await apiGet<ActivityItemDto[]>(`/api/issues/${issueId}/activity`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}
