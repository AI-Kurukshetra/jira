'use client'

import { Box, Typography } from '@mui/material'

import { IssueKey } from '@/components/design/IssueKey'
import { IssueTypeIcon } from '@/components/design/IssueTypeIcon'
import { PriorityIndicator } from '@/components/design/PriorityIndicator'
import { StatusChip } from '@/components/design/StatusChip'
import { UserAvatar } from '@/components/design/UserAvatar'
import type { IssuePriority, IssueStatus, IssueType } from '@/lib/types'

interface IssueRowProps {
  issueKey: string
  summary: string
  issueType: IssueType
  priority: IssuePriority
  status: IssueStatus
  assignee?: { id: string; name: string }
  storyPoints?: number
}

export function IssueRow({
  issueKey,
  summary,
  issueType,
  priority,
  status,
  assignee,
  storyPoints
}: IssueRowProps) {
  return (
    <Box
      sx={(theme) => ({
        height: 36,
        display: 'grid',
        gridTemplateColumns: '24px 90px 1fr 120px 90px 90px 70px',
        alignItems: 'center',
        px: 1,
        borderRadius: 1,
        '&:hover': { backgroundColor: theme.palette.background.default }
      })}
    >
      <IssueTypeIcon type={issueType} size="sm" />
      <IssueKey value={issueKey} />
      <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
        {summary}
      </Typography>
      <PriorityIndicator priority={priority} />
      {assignee ? <UserAvatar userId={assignee.id} fullName={assignee.name} size="xs" /> : null}
      <StatusChip status={status} />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {storyPoints ?? '--'}
      </Typography>
    </Box>
  )
}
