'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { Project } from '@/lib/types'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await apiGet<Project[]>('/api/projects')
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}
