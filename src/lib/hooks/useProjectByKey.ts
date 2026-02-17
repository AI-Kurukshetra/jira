'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { Project } from '@/lib/types'

export function useProjectByKey(projectKey: string) {
  return useQuery({
    queryKey: ['projects', 'key', projectKey],
    queryFn: async () => {
      const result = await apiGet<Project[]>(`/api/projects?key=${projectKey}`)
      if (!result.success) throw new Error(result.error)
      return result.data[0] ?? null
    }
  })
}
