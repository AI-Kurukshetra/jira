'use client'

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import { Badge, Box, IconButton, Paper, Typography } from '@mui/material'
import { useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch, apiPost } from '@/lib/api/client'

interface NotificationItem {
  id: string
  title: string
  message: string
  created_at: string
  is_read: boolean
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const result = await apiGet<NotificationItem[]>('/api/notifications?limit=20')
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })

  const unreadCount = data?.filter((item) => !item.is_read).length ?? 0

  const markAllRead = useMutation({
    mutationFn: async () => {
      const result = await apiPost('/api/notifications/mark-all-read', {})
      if (!result.success) throw new Error(result.error)
      return true
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const previous = queryClient.getQueryData<NotificationItem[]>(['notifications'])
      queryClient.setQueryData<NotificationItem[]>(['notifications'], (current) =>
        current ? current.map((item) => ({ ...item, is_read: true })) : current
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous)
      }
    }
  })

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiPatch(`/api/notifications/${id}`, {})
      if (!result.success) throw new Error(result.error)
      return id
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const previous = queryClient.getQueryData<NotificationItem[]>(['notifications'])
      queryClient.setQueryData<NotificationItem[]>(['notifications'], (current) =>
        current ? current.map((item) => (item.id === id ? { ...item, is_read: true } : item)) : current
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous)
      }
    }
  })

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton aria-label="Notifications" onClick={() => setOpen((value) => !value)}>
        <Badge color="error" badgeContent={unreadCount} overlap="circular">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      {open && (
        <Paper
          elevation={3}
          sx={(theme) => ({
            position: 'absolute',
            top: '100%',
            right: 0,
            mt: 1,
            width: 320,
            zIndex: 1200,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 1.5
          })}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'primary.main', cursor: 'pointer' }}
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {data?.length ? (
              data.map((item) => (
                <Box
                  key={item.id}
                  onClick={() => markRead.mutate(item.id)}
                  sx={(theme) => ({
                    borderRadius: 1,
                    px: 1,
                    py: 1,
                    backgroundColor: item.is_read ? 'transparent' : theme.palette.background.default,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: theme.palette.background.default }
                  })}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {item.message}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No notifications yet.
              </Typography>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  )
}
