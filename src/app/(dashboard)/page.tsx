import { Box, Card, CardContent, Divider, Typography } from '@mui/material'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { IssueRow } from '@/components/backlog/IssueRow'
import { EmptyState } from '@/components/ui/EmptyState'

const mockAssigned = [
  {
    issueKey: 'PROJ-101',
    summary: 'Finalize project settings screen',
    issueType: 'task' as const,
    priority: 'high' as const,
    status: 'inprogress' as const,
    assignee: { id: 'user-11', name: 'You' },
    storyPoints: 5
  }
]

export default function DashboardHomePage() {
  const hasAssigned = mockAssigned.length > 0

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader title="Good morning" subtitle="Tuesday, February 17, 2026" />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, gap: 2 }}>
        <Card>
          <CardContent sx={{ display: 'grid', gap: 2 }}>
            <Typography variant="h3">Assigned to me</Typography>
            <Divider />
            {hasAssigned ? (
              <Box sx={{ display: 'grid', gap: 0.5 }}>
                {mockAssigned.map((issue) => (
                  <IssueRow key={issue.issueKey} {...issue} />
                ))}
              </Box>
            ) : (
              <EmptyState
                title="No assignments yet"
                description="You are all caught up. Create a new issue or join a sprint to get started."
                actionLabel="Create issue"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ display: 'grid', gap: 2 }}>
            <Typography variant="h3">Recent activity</Typography>
            <Divider />
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No recent activity.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h3">Your Projects</Typography>
          <Divider />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>ProjectHub Core</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>PROJ</Typography>
            </Card>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
