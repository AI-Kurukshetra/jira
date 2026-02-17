'use client'

import AddIcon from '@mui/icons-material/Add'
import BoltIcon from '@mui/icons-material/Bolt'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import HomeIcon from '@mui/icons-material/Home'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SettingsIcon from '@mui/icons-material/Settings'
import { Box, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import Link from 'next/link'

import { UserAvatar } from '@/components/design/UserAvatar'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: HomeIcon },
  { label: 'My Work', href: '/my-work', icon: PersonOutlineIcon },
  { label: 'Projects', href: '/projects', icon: FolderOpenIcon },
  { label: 'Notifications', href: '/notifications', icon: NotificationsNoneIcon },
  { label: 'Settings', href: '/settings', icon: SettingsIcon }
]

const MotionBox = motion(Box)

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <MotionBox
      animate={{ width: collapsed ? 56 : 240 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      sx={(theme) => ({
        height: '100vh',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      })}
    >
      <Box sx={{ height: 52, display: 'flex', alignItems: 'center', px: 2, gap: 1 }}>
        <BoltIcon sx={{ color: 'primary.main', fontSize: 18 }} />
        {!collapsed && (
          <Typography variant="h6" sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}>
            ProjectHub
          </Typography>
        )}
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1 }}>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.tertiary',
            px: 1.5,
            py: 1
          }}
        >
          Navigation
        </Typography>
        <List dense disablePadding>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.href} disablePadding>
              <ListItemButton component={Link} href={item.href} sx={{ height: 34 }}>
                <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                  <item.icon fontSize="small" />
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.tertiary',
            px: 1.5,
            py: 1
          }}
        >
          Projects
        </Typography>
        <List dense disablePadding>
          <ListItem disablePadding>
            <ListItemButton href="/projects/new" component={Link} sx={{ height: 34 }}>
              <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Create Project" />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Divider />

      <Box sx={{ px: 1.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <UserAvatar userId="system" fullName="System User" size="sm" />
        {!collapsed && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              System User
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
              Admin
            </Typography>
          </Box>
        )}
        <IconButton size="small" onClick={onToggle} aria-label="Toggle sidebar">
          <BoltIcon fontSize="inherit" />
        </IconButton>
      </Box>
    </MotionBox>
  )
}
