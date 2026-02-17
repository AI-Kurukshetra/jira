'use client'

import { Box } from '@mui/material'

import { IssueDetail } from '@/components/issues/IssueDetail'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useIssueByKey } from '@/lib/hooks/useIssueByKey'
import { use } from 'react'

export default function IssueDetailPage({ params }: { params: Promise<{ issueKey: string; projectKey: string }> }) {
  const { issueKey, projectKey } = use(params)
  const { data: project } = useProjectByKey(projectKey)
  const { data: issue } = useIssueByKey(project?.id, issueKey)
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Issue Detail" subtitle="Edit fields, add comments, and review history." />
      {issue ? <IssueDetail issue={issue} projectKey={projectKey} /> : <LoadingSkeleton rows={6} height={28} />}
    </Box>
  )
}
