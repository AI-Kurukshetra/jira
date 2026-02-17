'use client'

import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { apiGet, apiPatch, apiPost } from '@/lib/api/client'

interface NotificationItem {
  id: string
  title: string
  message: string
  created_at: string
  is_read: boolean
}

interface NotificationPageResponse {
  items: NotificationItem[]
  total: number
  page: number
  pageSize: number
}

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications', 'page', page],
    queryFn: async () => {
      const result = await apiGet<NotificationPageResponse>(`/api/notifications?page=${page}&pageSize=${PAGE_SIZE}`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      const result = await apiPost('/api/notifications/mark-all-read', {})
      if (!result.success) throw new Error(result.error)
      return true
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiPatch(`/api/notifications/${id}`, {})
      if (!result.success) throw new Error(result.error)
      return id
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader
        title="Notifications"
        subtitle="Review your recent activity and updates."
        action={
          <Button variant="outlined" size="small" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            Mark all read
          </Button>
        }
      />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 1 }}>
          {(data?.items ?? []).length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No notifications yet.
            </Typography>
          ) : (
            data?.items.map((item) => (
              <Box
                key={item.id}
                sx={(theme) => ({
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                  backgroundColor: item.is_read ? 'transparent' : theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'grid',
                  gap: 0.5
                })}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                  {!item.is_read && (
                    <Button size="small" variant="text" onClick={() => markRead.mutate(item.id)}>
                      Mark read
                    </Button>
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.message}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button size="small" variant="outlined" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          Previous
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </Box>
    </Box>
  )
}
