'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { Profile } from '@/lib/types'

interface MeResponse {
  user: { id: string; email?: string | null }
  profile: Profile
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const result = await apiGet<MeResponse>('/api/me')
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}
