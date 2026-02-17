'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { Label } from '@/lib/types'

export function useLabels(projectId?: string) {
  return useQuery({
    queryKey: ['labels', projectId ?? 'none'],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const result = await apiGet<Label[]>(`/api/labels?projectId=${projectId}`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}
