'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { BoardColumn } from '@/lib/types'

export function useBoardColumns(projectId?: string) {
  return useQuery({
    queryKey: ['board-columns', projectId ?? 'none'],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const result = await apiGet<BoardColumn[]>(`/api/projects/${projectId}/columns`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}
