import { Box, Card, CardContent, Divider, Typography } from '@mui/material'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { AssignedIssues } from '@/components/dashboard/AssignedIssues'

export default function DashboardHomePage() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader title="Good morning" subtitle="Tuesday, February 17, 2026" />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, gap: 2 }}>
        <Card>
          <CardContent sx={{ display: 'grid', gap: 2 }}>
            <Typography variant="h3">Assigned to me</Typography>
            <Divider />
            <AssignedIssues />
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
