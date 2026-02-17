'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { ProjectMember } from '@/lib/types'
import type { ProfileLite } from '@/lib/types/profile'

export interface ProjectMemberWithProfile extends ProjectMember {
  profile?: ProfileLite | null
}

export function useProjectMembers(projectId?: string) {
  return useQuery({
    queryKey: ['project-members', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      if (!projectId) return []
      const result = await apiGet<ProjectMemberWithProfile[]>(`/api/projects/${projectId}/members`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}
