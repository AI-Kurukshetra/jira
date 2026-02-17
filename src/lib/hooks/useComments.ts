'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { ProfileLite } from '@/lib/types/profile'

interface CommentDto {
  id: string
  body: string
  createdAt: string
  isDeleted: boolean
  author: ProfileLite | null
}

export function useComments(issueId?: string) {
  return useQuery({
    queryKey: ['comments', issueId],
    enabled: Boolean(issueId),
    queryFn: async () => {
      if (!issueId) return []
      const result = await apiGet<CommentDto[]>(`/api/issues/${issueId}/comments`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}
