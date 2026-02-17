'use client'

import { Box, Button, Chip, Divider, Typography } from '@mui/material'

import { IssueRow } from './IssueRow'
import type { Issue } from '@/lib/types'

interface SprintSectionProps {
  title: string
  subtitle: string
  active?: boolean
  issues: Issue[]
}

export function SprintSection({ title, subtitle, active, issues }: SprintSectionProps) {
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
        <Chip label={`${issues.length} issues`} size="small" />
        <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small">Start Sprint</Button>
          <Button variant="text" size="small">Complete</Button>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ px: 1, py: 1, display: 'grid', gap: 0.5 }}>
        {issues.map((issue) => (
          <IssueRow
            key={issue.id}
            issueKey={issue.issueKey}
            summary={issue.summary}
            issueType={issue.issueType}
            priority={issue.priority}
            status={issue.status}
            {...(issue.assigneeId ? { assignee: { id: issue.assigneeId, name: 'Assignee' } } : {})}
            {...(issue.storyPoints !== null && issue.storyPoints !== undefined
              ? { storyPoints: issue.storyPoints }
              : {})}
          />
        ))}
      </Box>
    </Box>
  )
}
