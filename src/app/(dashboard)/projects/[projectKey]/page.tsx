import { Box, Card, CardContent, Divider, Typography } from '@mui/material'

import { SectionHeader } from '@/components/ui/SectionHeader'

export default async function ProjectDashboardPage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = await params
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader title={`Project ${projectKey}`} subtitle="Sprint overview and key metrics." />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h3">Active Sprint</Typography>
          <Divider />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No active sprint. Start a sprint to see progress tracking.
          </Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h3">Summary Stats</Typography>
          <Divider />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {['Total Issues', 'Open', 'In Progress', 'Closed'].map((label) => (
              <Card key={label} sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
                <Typography variant="h3">0</Typography>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
