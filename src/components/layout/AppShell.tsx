'use client'

import { Box } from '@mui/material'
import { useState, type ReactNode } from 'react'

import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <TopBar collapsed={collapsed} />
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>{children}</Box>
      </Box>
    </Box>
  )
}
