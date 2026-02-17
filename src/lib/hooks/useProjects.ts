'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { Project, ProjectStatus } from '@/lib/types'

export function useProjects(status?: ProjectStatus) {
  return useQuery({
    queryKey: ['projects', status ?? 'all'],
    queryFn: async () => {
      const query = status ? `?status=${status}` : ''
      const result = await apiGet<Project[]>(`/api/projects${query}`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}
