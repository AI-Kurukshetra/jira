'use client'

import { Box, Button, Card, CardContent, Checkbox, Divider, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
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
  const items = data?.items ?? []

  const filtered = useMemo(() => {
    if (statusFilter === 'unread') return items.filter((item) => !item.is_read)
    if (statusFilter === 'read') return items.filter((item) => item.is_read)
    return items
  }, [items, statusFilter])

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected])

  const toggleSelectAll = () => {
    if (filtered.length === 0) return
    const next: Record<string, boolean> = {}
    const shouldSelectAll = selectedIds.length !== filtered.length
    filtered.forEach((item) => {
      next[item.id] = shouldSelectAll
    })
    setSelected(next)
  }

  const markSelectedRead = useMutation({
    mutationFn: async () => {
      await Promise.all(selectedIds.map((id) => apiPatch(`/api/notifications/${id}`, {})))
      return true
    },
    onSuccess: async () => {
      setSelected({})
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                size="small"
                variant={statusFilter === 'unread' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('unread')}
              >
                Unread
              </Button>
              <Button
                size="small"
                variant={statusFilter === 'read' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('read')}
              >
                Read
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" onClick={toggleSelectAll} disabled={filtered.length === 0}>
                {selectedIds.length === filtered.length && filtered.length > 0 ? 'Clear selection' : 'Select all'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={selectedIds.length === 0 || markSelectedRead.isPending}
                onClick={() => markSelectedRead.mutate()}
              >
                Mark selected read
              </Button>
            </Box>
          </Box>
          <Divider />
          {filtered.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No notifications yet.
            </Typography>
          ) : (
            filtered.map((item) => (
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Checkbox
                    size="small"
                    checked={Boolean(selected[item.id])}
                    onChange={(event) => setSelected((current) => ({ ...current, [item.id]: event.target.checked }))}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
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
