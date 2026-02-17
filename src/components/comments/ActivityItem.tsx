'use client'

import { Box, Typography } from '@mui/material'

import { UserAvatar } from '@/components/design/UserAvatar'

interface ActivityItemProps {
  user: { id: string; name: string }
  action: string
  time: string
}

export function ActivityItem({ user, action, time }: ActivityItemProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      <UserAvatar userId={user.id} fullName={user.name} size="xs" />
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          <Box component="span" sx={{ fontWeight: 600 }}>{user.name}</Box> {action}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.tertiary' }}>{time}</Typography>
      </Box>
    </Box>
  )
}
