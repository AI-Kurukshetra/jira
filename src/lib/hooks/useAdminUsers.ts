'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/lib/api/client'
import type { AdminUser } from '@/lib/types'

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const result = await apiGet<AdminUser[]>('/api/admin/users')
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })
}
