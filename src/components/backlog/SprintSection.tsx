'use client'

import { Box, Button, Chip, Divider, Typography } from '@mui/material'

import { IssueRow } from './IssueRow'

interface SprintSectionProps {
  title: string
  subtitle: string
  active?: boolean
}

const mockRows = [
  {
    issueKey: 'PROJ-052',
    summary: 'Ship member role management',
    issueType: 'task' as const,
    priority: 'high' as const,
    status: 'inprogress' as const,
    assignee: { id: 'user-4', name: 'Riley Chen' },
    storyPoints: 8
  },
  {
    issueKey: 'PROJ-060',
    summary: 'Audit notification templates',
    issueType: 'story' as const,
    priority: 'medium' as const,
    status: 'todo' as const,
    assignee: { id: 'user-5', name: 'Nova Singh' },
    storyPoints: 5
  }
]

export function SprintSection({ title, subtitle, active }: SprintSectionProps) {
  return (
    <Box
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        '&::before': active
          ? {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 2,
              padding: '1px',
              background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
              WebkitMask:
                'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none'
            }
          : undefined
      })}
    >
      <Box sx={{ backgroundColor: 'background.paper', px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {subtitle}
        </Typography>
        <Chip label="7 issues" size="small" />
        <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small">Start Sprint</Button>
          <Button variant="text" size="small">Complete</Button>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ px: 1, py: 1, display: 'grid', gap: 0.5 }}>
        {mockRows.map((row) => (
          <IssueRow key={row.issueKey} {...row} />
        ))}
      </Box>
    </Box>
  )
}
