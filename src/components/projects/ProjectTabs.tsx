'use client'

import Link from 'next/link'
import { Box, Tab, Tabs } from '@mui/material'

interface ProjectTabsProps {
  projectKey: string
}

const tabs = [
  { label: 'Overview', path: '' },
  { label: 'Board', path: 'board' },
  { label: 'Backlog', path: 'backlog' },
  { label: 'Settings', path: 'settings' }
]

export function ProjectTabs({ projectKey }: ProjectTabsProps) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Tabs value={false} sx={{ alignSelf: 'flex-start' }}>
        {tabs.map((tab) => (
          <Tab
            key={tab.label}
            label={tab.label}
            component={Link}
            href={`/projects/${projectKey}/${tab.path}`.replace(/\/$/, '')}
          />
        ))}
      </Tabs>
    </Box>
  )
}
