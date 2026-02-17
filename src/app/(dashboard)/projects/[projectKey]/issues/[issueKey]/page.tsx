import { Box, Card, CardContent, Divider, Typography } from '@mui/material'

import { IssueKey } from '@/components/design/IssueKey'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default async function IssueDetailPage({ params }: { params: Promise<{ issueKey: string }> }) {
  const { issueKey } = await params
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Issue Detail" subtitle="Edit fields, add comments, and review history." />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IssueKey value={issueKey} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Story
            </Typography>
          </Box>
          <Typography variant="h3">Draft issue summary</Typography>
          <Divider />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Description editor will appear here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
