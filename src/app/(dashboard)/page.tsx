'use client'

import { Box, Card, CardContent, Divider, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts'
import { useMemo } from 'react'
import { format, startOfDay, subDays } from 'date-fns'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { AssignedIssues } from '@/components/dashboard/AssignedIssues'
import { useMe } from '@/lib/hooks/useMe'
import { useIssues } from '@/lib/hooks/useIssues'

export default function DashboardHomePage() {
  const { data: me } = useMe()
  const { data: issues } = useIssues(me?.user.id ? { assigneeId: me.user.id } : undefined)

  const performance = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => startOfDay(subDays(new Date(), 6 - index)))
    const labels = days.map((day) => format(day, 'MMM d'))
    const counts = days.map((day) => {
      const dayKey = format(day, 'yyyy-MM-dd')
      return (issues ?? []).filter((issue) => issue.resolvedAt && format(new Date(issue.resolvedAt), 'yyyy-MM-dd') === dayKey).length
    })
    return { labels, counts }
  }, [issues])

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
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Jira Bacancy Core</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>PROJ</Typography>
            </Card>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h3">Performance</Typography>
          <Divider />
          <LineChart
            xAxis={[{ data: performance.labels, scaleType: 'point' }]}
            series={[{ data: performance.counts, label: 'Issues Closed' }]}
            height={220}
          />
        </CardContent>
      </Card>
    </Box>
  )
}
