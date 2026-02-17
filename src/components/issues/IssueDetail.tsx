'use client'

import CloseIcon from '@mui/icons-material/Close'
import { Box, Divider, IconButton, MenuItem, Select, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { IssueKey } from '@/components/design/IssueKey'
import { IssueTypeIcon } from '@/components/design/IssueTypeIcon'
import { PriorityIndicator } from '@/components/design/PriorityIndicator'
import { StatusChip } from '@/components/design/StatusChip'
import { UserAvatar } from '@/components/design/UserAvatar'
import { CommentEditor } from '@/components/comments/CommentEditor'
import { CommentList } from '@/components/comments/CommentList'
import { ActivityItem } from '@/components/comments/ActivityItem'
import { IssueAttachments } from '@/components/issues/IssueAttachments'
import { AssigneeSelect } from '@/components/issues/AssigneeSelect'
import { LabelMultiSelect } from '@/components/issues/LabelMultiSelect'
import { apiPatch } from '@/lib/api/client'
import type { IssueStatus, IssuePriority } from '@/lib/types'
import type { IssueWithAssignee } from '@/lib/hooks/useIssues'
import { useComments } from '@/lib/hooks/useComments'
import { useActivity } from '@/lib/hooks/useActivity'

interface IssueDetailProps {
  issue: IssueWithAssignee
}

const STATUS_OPTIONS: Record<IssueStatus, IssueStatus[]> = {
  todo: ['todo', 'inprogress'],
  inprogress: ['todo', 'inprogress', 'done'],
  done: ['inprogress', 'done']
}

const PRIORITY_OPTIONS: IssuePriority[] = ['highest', 'high', 'medium', 'low', 'lowest']

export function IssueDetail({ issue }: IssueDetailProps) {
  const [tab, setTab] = useState(0)
  const [summary, setSummary] = useState(issue.summary)
  const [status, setStatus] = useState<IssueStatus>(issue.status)
  const [priority, setPriority] = useState<IssuePriority>(issue.priority)
  const [assigneeId, setAssigneeId] = useState<string | null>(issue.assigneeId ?? null)
  const [labels, setLabels] = useState<string[]>([])

  const queryClient = useQueryClient()
  const { data: comments = [] } = useComments(issue.id)
  const { data: activity = [] } = useActivity(issue.id)

  useEffect(() => {
    setSummary(issue.summary)
    setStatus(issue.status)
    setPriority(issue.priority)
    setAssigneeId(issue.assigneeId ?? null)
  }, [issue])

  const updateIssue = useMutation({
    mutationFn: async (payload: Partial<IssueWithAssignee>) => {
      const result = await apiPatch<IssueWithAssignee, Partial<IssueWithAssignee>>(`/api/issues/${issue.id}`, payload)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['issue', issue.projectId, issue.issueKey], data)
    }
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      if (summary !== issue.summary) {
        updateIssue.mutate({ summary })
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [summary, issue.summary, updateIssue])

  const allowedStatuses = useMemo(() => STATUS_OPTIONS[issue.status], [issue.status])

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IssueTypeIcon type={issue.issueType} />
          <IssueKey value={issue.issueKey} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {issue.issueType}
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
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
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
                  <ActivityItem
                    key={item.id}
                    user={{ id: 'system', name: 'System' }}
                    action={`${item.actionType}${item.fieldName ? ` (${item.fieldName})` : ''}`}
                    time={new Date(item.createdAt).toLocaleString()}
                  />
                ))}
              </Box>
            )}
            {tab === 1 && (
              <Box sx={{ display: 'grid', gap: 2 }}>
                <CommentList
                  comments={comments.map((comment) => ({
                    id: comment.id,
                    author: {
                      id: comment.author?.id ?? 'user',
                      name: comment.author?.displayName ?? comment.author?.fullName ?? 'User'
                    },
                    body: comment.isDeleted ? 'This comment was deleted.' : comment.body,
                    timestamp: new Date(comment.createdAt).toLocaleString()
                  }))}
                />
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
              <Select
                size="small"
                value={status}
                onChange={(e) => {
                  const value = e.target.value as IssueStatus
                  setStatus(value)
                  updateIssue.mutate({ status: value })
                }}
              >
                {allowedStatuses.map((option) => (
                  <MenuItem key={option} value={option}>
                    <StatusChip status={option} />
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.tertiary' }}>Assignee</Typography>
              <AssigneeSelect
                projectId={issue.projectId}
                value={assigneeId}
                onChange={(value) => {
                  setAssigneeId(value)
                  updateIssue.mutate({ assigneeId: value })
                }}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.tertiary' }}>Priority</Typography>
              <Select
                size="small"
                value={priority}
                onChange={(e) => {
                  const value = e.target.value as IssuePriority
                  setPriority(value)
                  updateIssue.mutate({ priority: value })
                }}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    <PriorityIndicator priority={option} />
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 2, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.tertiary' }}>Labels</Typography>
              <LabelMultiSelect value={labels} onChange={setLabels} />
            </Box>
          </Box>
          <IssueAttachments issueId={issue.id} />
        </Box>
      </Box>
    </Box>
  )
}
