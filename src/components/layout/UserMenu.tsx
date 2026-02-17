'use client'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import { Box, Menu, MenuItem, Typography } from '@mui/material'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { UserAvatar } from '@/components/design/UserAvatar'
import { createClient } from '@/lib/supabase/client'
import { useMe } from '@/lib/hooks/useMe'

export function UserMenu() {
  const { data } = useMe()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const router = useRouter()

  const open = Boolean(anchorEl)
  const profileName = data?.profile?.fullName ?? data?.profile?.displayName ?? 'User'

  const onLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const onSettings = () => {
    setAnchorEl(null)
    router.push('/settings')
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
      <UserAvatar userId={data?.user.id ?? 'user'} fullName={profileName} size="xs" />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{profileName}</Typography>
      <KeyboardArrowDownIcon fontSize="small" />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{ onClick: () => setAnchorEl(null) }}
      >
        <MenuItem onClick={onSettings}>
          <SettingsIcon fontSize="small" style={{ marginRight: 8 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={onLogout}>
          <LogoutIcon fontSize="small" style={{ marginRight: 8 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  )
}
