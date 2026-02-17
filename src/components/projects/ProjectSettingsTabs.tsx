'use client'

import Link from 'next/link'
import { Box, Tab, Tabs } from '@mui/material'

interface ProjectSettingsTabsProps {
  projectKey: string
  active: 'general' | 'members' | 'sprints'
}

const tabs = [
  { label: 'General', path: 'settings', value: 'general' },
  { label: 'Members', path: 'settings/members', value: 'members' },
  { label: 'Sprints Archive', path: 'settings/sprints', value: 'sprints' }
] as const

export function ProjectSettingsTabs({ projectKey, active }: ProjectSettingsTabsProps) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Tabs value={active} sx={{ alignSelf: 'flex-start' }}>
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            component={Link}
            href={`/projects/${projectKey}/${tab.path}`.replace(/\/$/, '')}
          />
        ))}
      </Tabs>
    </Box>
  )
}
