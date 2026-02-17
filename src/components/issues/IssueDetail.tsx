'use client'

import CloseIcon from '@mui/icons-material/Close'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { Box, Button, Divider, IconButton, MenuItem, Select, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { IssueKey } from '@/components/design/IssueKey'
import { IssueTypeIcon } from '@/components/design/IssueTypeIcon'
import { PriorityIndicator } from '@/components/design/PriorityIndicator'
import { StatusChip } from '@/components/design/StatusChip'
import { CommentEditor } from '@/components/comments/CommentEditor'
import { CommentList } from '@/components/comments/CommentList'
import { ActivityItem } from '@/components/comments/ActivityItem'
import { IssueAttachments } from '@/components/issues/IssueAttachments'
import { IssueTimeTracking } from '@/components/issues/IssueTimeTracking'
import { AssigneeSelect } from '@/components/issues/AssigneeSelect'
import { LabelMultiSelect } from '@/components/issues/LabelMultiSelect'
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api/client'
import type { IssueStatus, IssuePriority } from '@/lib/types'
import type { IssueWithAssignee } from '@/lib/hooks/useIssues'
import { useComments } from '@/lib/hooks/useComments'
import { useActivity } from '@/lib/hooks/useActivity'
import { useMe } from '@/lib/hooks/useMe'

interface IssueDetailProps {
  issue: IssueWithAssignee
  projectKey?: string
}

const STATUS_OPTIONS: Record<IssueStatus, IssueStatus[]> = {
  todo: ['todo', 'inprogress'],
  inprogress: ['todo', 'inprogress', 'done'],
  done: ['inprogress', 'done']
}

const PRIORITY_OPTIONS: IssuePriority[] = ['highest', 'high', 'medium', 'low', 'lowest']

export function IssueDetail({ issue, projectKey }: IssueDetailProps) {
  const [tab, setTab] = useState(0)
  const [summary, setSummary] = useState(issue.summary)
  const [status, setStatus] = useState<IssueStatus>(issue.status)
  const [priority, setPriority] = useState<IssuePriority>(issue.priority)
  const [assigneeId, setAssigneeId] = useState<string | null>(issue.assigneeId ?? null)
  const [labels, setLabels] = useState<string[]>([])
  const [labelError, setLabelError] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: me } = useMe()
  const { data: comments = [] } = useComments(issue.id)
  const { data: activity = [] } = useActivity(issue.id)

  const { data: watchState } = useQuery({
    queryKey: ['issue-watch', issue.id],
    queryFn: async () => {
      const result = await apiGet<{ watching: boolean; count: number }>(`/api/issues/${issue.id}/watch`)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  })

  const toggleWatch = useMutation({
    mutationFn: async (nextWatching: boolean) => {
      const result = nextWatching
        ? await apiPost(`/api/issues/${issue.id}/watch`, {})
        : await apiDelete(`/api/issues/${issue.id}/watch`)
      if (!result.success) throw new Error(result.error)
      return nextWatching
    },
    onMutate: async (nextWatching) => {
      await queryClient.cancelQueries({ queryKey: ['issue-watch', issue.id] })
      const previous = queryClient.getQueryData<{ watching: boolean; count: number }>(['issue-watch', issue.id])
      if (previous) {
        queryClient.setQueryData(['issue-watch', issue.id], {
          watching: nextWatching,
          count: nextWatching ? previous.count + 1 : Math.max(0, previous.count - 1)
        })
      }
      return { previous }
    },
    onError: (_error, _nextWatching, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['issue-watch', issue.id], context.previous)
      }
    }
  })

  useEffect(() => {
    setSummary(issue.summary)
    setStatus(issue.status)
    setPriority(issue.priority)
    setAssigneeId(issue.assigneeId ?? null)
    setLabels(issue.labels ?? [])
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

  const addComment = useMutation({
    mutationFn: async (body: string) => {
      const result = await apiPost(`/api/issues/${issue.id}/comments`, { body })
      if (!result.success) throw new Error(result.error)
      return true
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comments', issue.id] })
      await queryClient.invalidateQueries({ queryKey: ['activity', issue.id] })
    }
  })

  const editComment = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: string }) => {
      const result = await apiPatch(`/api/issues/${issue.id}/comments`, { commentId: id, body })
      if (!result.success) throw new Error(result.error)
      return true
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comments', issue.id] })
      await queryClient.invalidateQueries({ queryKey: ['activity', issue.id] })
    }
  })

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiDelete(`/api/issues/${issue.id}/comments`, { commentId: id })
      if (!result.success) throw new Error(result.error)
      return true
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comments', issue.id] })
      await queryClient.invalidateQueries({ queryKey: ['activity', issue.id] })
    }
  })

  const updateLabels = useMutation({
    mutationFn: async (nextLabels: string[]) => {
      const result = await apiPost(`/api/issues/${issue.id}/labels`, { labels: nextLabels })
      if (!result.success) throw new Error(result.error)
      return nextLabels
    },
    onSuccess: (next) => {
      queryClient.setQueryData(['issue', issue.projectId, issue.issueKey], {
        ...issue,
        labels: next
      })
      setLabelError(null)
    },
    onError: (err) => {
      setLabelError(err instanceof Error ? err.message : 'Failed to update labels')
    }
  })

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={watchState?.watching ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
            onClick={() => toggleWatch.mutate(!(watchState?.watching ?? false))}
          >
            {watchState?.watching ? 'Unwatch' : 'Watch'}
            {typeof watchState?.count === 'number' ? ` (${watchState.count})` : ''}
          </Button>
          <IconButton
            size="small"
            onClick={() => {
              if (projectKey) {
                router.push(`/projects/${projectKey}/board`)
                return
              }
              router.back()
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
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
          <CommentEditor
            key={`description-${issue.id}`}
            placeholder="Describe the issue..."
            submitLabel="Save description"
            initialContent={issue.description ?? ''}
            clearOnSubmit={false}
            onSubmit={async (body) => {
              await updateIssue.mutateAsync({ description: body })
            }}
          />

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
                    timestamp: new Date(comment.createdAt).toLocaleString(),
                    isDeleted: comment.isDeleted,
                    canEdit: Boolean(me?.user.id && comment.author?.id === me.user.id)
                  }))}
                  onEdit={async (id, body) => {
                    await editComment.mutateAsync({ id, body })
                  }}
                  onDelete={async (id) => {
                    await deleteComment.mutateAsync(id)
                  }}
                />
                <CommentEditor
                  onSubmit={async (body) => {
                    await addComment.mutateAsync(body)
                  }}
                  isSubmitting={addComment.isPending}
                />
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
              <LabelMultiSelect
                projectId={issue.projectId}
                value={labels}
                onChange={(next) => {
                  setLabels(next)
                  updateLabels.mutate(next)
                }}
              />
            </Box>
            {labelError && (
              <Typography variant="caption" sx={{ color: 'error.main' }}>
                {labelError}
              </Typography>
            )}
          </Box>
          <IssueAttachments issueId={issue.id} />
          <IssueTimeTracking issueId={issue.id} />
        </Box>
      </Box>
    </Box>
  )
}
