'use client'

import { Box } from '@mui/material'

import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { IssueRow } from '@/components/backlog/IssueRow'
import { useIssues } from '@/lib/hooks/useIssues'
import { useMe } from '@/lib/hooks/useMe'
import { useCreateIssue } from '@/components/issues/CreateIssueProvider'

export function AssignedIssues() {
  const { data: me } = useMe()
  const { openCreateIssue } = useCreateIssue()
  const { data, isLoading, isError } = useIssues(
    me?.user.id ? { assigneeId: me.user.id } : undefined
  )

  if (isLoading) {
    return <LoadingSkeleton rows={4} height={28} />
  }

  if (isError) {
    return <Box sx={{ color: 'error.main' }}>Failed to load issues.</Box>
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No assignments yet"
        description="You are all caught up. Create a new issue or join a sprint to get started."
        actionLabel="Create issue"
        onAction={() => openCreateIssue()}
      />
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      {data.map((issue) => (
        <IssueRow
          key={issue.id}
          issueKey={issue.issueKey}
          summary={issue.summary}
          issueType={issue.issueType}
          priority={issue.priority}
          status={issue.status}
          {...(issue.assignee
            ? {
                assignee: {
                  id: issue.assigneeId ?? issue.id,
                  name: issue.assignee.displayName ?? issue.assignee.fullName ?? 'Assignee'
                }
              }
            : {})}
          {...(issue.storyPoints !== null && issue.storyPoints !== undefined
            ? { storyPoints: issue.storyPoints }
            : {})}
        />
      ))}
    </Box>
  )
}
