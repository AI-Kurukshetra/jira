'use client'

import CloseIcon from '@mui/icons-material/Close'
import { Box, Divider, IconButton, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useState } from 'react'

import { IssueKey } from '@/components/design/IssueKey'
import { IssueTypeIcon } from '@/components/design/IssueTypeIcon'
import { PriorityIndicator } from '@/components/design/PriorityIndicator'
import { StatusChip } from '@/components/design/StatusChip'
import { UserAvatar } from '@/components/design/UserAvatar'
import { CommentEditor } from '@/components/comments/CommentEditor'
import { CommentList } from '@/components/comments/CommentList'
import { ActivityItem } from '@/components/comments/ActivityItem'

interface IssueDetailProps {
  issueKey: string
}

const comments = [
  { id: 'c1', author: { id: 'u1', name: 'Ava Reynolds' }, body: 'We should align this with the new onboarding flow.', timestamp: '2 hours ago' }
]

const activity = [
  { id: 'a1', user: { id: 'u2', name: 'Kai Holt' }, action: 'moved the issue to In Progress', time: '1 day ago' }
]

export function IssueDetail({ issueKey }: IssueDetailProps) {
  const [tab, setTab] = useState(0)

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IssueTypeIcon type="story" />
          <IssueKey value={issueKey} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Story
          </Typography>
        </Box>
        <IconButton size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' }, gap: 3 }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <TextField
            variant="standard"
            placeholder="Issue summary"
            fullWidth
            InputProps={{
              disableUnderline: false,
              sx: { fontSize: '1.25rem', fontWeight: 600 }
            }}
          />
          <CommentEditor placeholder="Describe the issue..." />

          <Box>
            <Tabs value={tab} onChange={(_, value) => setTab(value)}>
              <Tab label="Activity" />
              <Tab label="Comments" />
            </Tabs>
            <Divider sx={{ mb: 2 }} />
            {tab === 0 && (
              <Box sx={{ display: 'grid', gap: 2 }}>
                {activity.map((item) => (
                  <ActivityItem key={item.id} user={item.user} action={item.action} time={item.time} />
                ))}
              </Box>
            )}
            {tab === 1 && (
              <Box sx={{ display: 'grid', gap: 2 }}>
                <CommentList comments={comments} />
                <CommentEditor />
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.tertiary' }}>
            Details
          </Typography>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.tertiary' }}>Status</Typography>
              <StatusChip status="inprogress" />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.tertiary' }}>Assignee</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserAvatar userId="u1" fullName="Ava Reynolds" size="xs" />
                <Typography variant="body2">Ava Reynolds</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.tertiary' }}>Priority</Typography>
              <PriorityIndicator priority="high" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
