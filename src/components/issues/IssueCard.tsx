'use client'

import { Box, Chip, Typography } from '@mui/material'

import { IssueKey } from '@/components/design/IssueKey'
import { IssueTypeIcon } from '@/components/design/IssueTypeIcon'
import { PriorityIndicator } from '@/components/design/PriorityIndicator'
import { UserAvatar } from '@/components/design/UserAvatar'
import type { IssuePriority, IssueType } from '@/lib/types'

interface IssueCardProps {
  issueKey: string
  summary: string
  issueType: IssueType
  priority: IssuePriority
  labels?: string[]
  assignee?: { id: string; name: string }
  storyPoints?: number
  highlight?: 'overdue' | 'high'
}

export function IssueCard({
  issueKey,
  summary,
  issueType,
  priority,
  labels = [],
  assignee,
  storyPoints,
  highlight
}: IssueCardProps) {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 1.5,
        display: 'grid',
        gap: 1,
        transition: 'all 0.15s ease',
        borderLeft: highlight === 'overdue' ? '2px solid #EF4444' : highlight === 'high' ? '2px solid #F97316' : undefined,
        '&:hover': {
          borderColor: theme.palette.divider,
          transform: 'translateY(-1px)'
        }
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IssueTypeIcon type={issueType} size="sm" />
        <IssueKey value={issueKey} />
      </Box>
      <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
        {summary}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PriorityIndicator priority={priority} showLabel={false} />
          {labels.map((label) => (
            <Chip key={label} label={label} size="small" />
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {storyPoints !== undefined && (
            <Chip label={`${storyPoints} pts`} size="small" variant="outlined" />
          )}
          {assignee ? <UserAvatar userId={assignee.id} fullName={assignee.name} size="xs" /> : null}
        </Box>
      </Box>
    </Box>
  )
}
