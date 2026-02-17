'use client'

import { Box, Card, CardContent, Divider, Typography } from '@mui/material'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { AssignedIssues } from '@/components/dashboard/AssignedIssues'

export default function MyWorkPage() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader title="My Work" subtitle="Issues assigned to you across projects." />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h3">Assigned to me</Typography>
          <Divider />
          <AssignedIssues />
        </CardContent>
      </Card>
    </Box>
  )
}
