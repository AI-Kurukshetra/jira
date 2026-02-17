import { Box } from '@mui/material'

import { IssueDetail } from '@/components/issues/IssueDetail'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default async function IssueDetailPage({ params }: { params: Promise<{ issueKey: string }> }) {
  const { issueKey } = await params
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Issue Detail" subtitle="Edit fields, add comments, and review history." />
      <IssueDetail issueKey={issueKey} />
    </Box>
  )
}
