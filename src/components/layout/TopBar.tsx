'use client'

import AddIcon from '@mui/icons-material/Add'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import { Badge, Box, Breadcrumbs, Button, IconButton, Typography } from '@mui/material'

import { GlobalSearch } from './GlobalSearch'

interface TopBarProps {
  collapsed: boolean
}

export function TopBar({ collapsed }: TopBarProps) {
  return (
    <Box
      sx={(theme) => ({
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default,
        backdropFilter: 'blur(8px)'
      })}
    >
      <Breadcrumbs separator=">" sx={{ color: 'text.secondary', minWidth: 120 }}>
        <Typography variant="caption">Dashboard</Typography>
        <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
          Overview
        </Typography>
      </Breadcrumbs>

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <GlobalSearch collapsed={collapsed} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button variant="contained" size="small" startIcon={<AddIcon />}>Create</Button>
        <IconButton aria-label="Notifications">
          <Badge color="error" variant="dot" overlap="circular">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Box>
    </Box>
  )
}
