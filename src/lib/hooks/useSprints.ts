'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { Sprint } from '@/lib/types'

export function useSprints(projectId?: string) {
  const queryString = projectId ? `?projectId=${projectId}` : ''

  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const result = await apiGet<Sprint[]>(`/api/sprints${queryString}`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}
