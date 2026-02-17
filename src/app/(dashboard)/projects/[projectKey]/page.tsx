'use client'

import { Box, Card, CardContent, Divider, LinearProgress, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { BarChart, LineChart } from '@mui/x-charts'
import { eachDayOfInterval, format, startOfDay } from 'date-fns'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useSprints } from '@/lib/hooks/useSprints'
import { useIssues } from '@/lib/hooks/useIssues'

export default function ProjectDashboardPage() {
  const params = useParams<{ projectKey: string }>()
  const projectKey = params?.projectKey ?? ''
  const { data: project } = useProjectByKey(projectKey)
  const { data: sprints } = useSprints(project?.id)
  const { data: issues } = useIssues(project?.id ? { projectId: project.id } : undefined)

  const activeSprint = sprints?.find((sprint) => sprint.status === 'active') ?? null
  const activeSprintIssues = useMemo(
    () => (issues ?? []).filter((issue) => issue.sprintId && issue.sprintId === activeSprint?.id),
    [issues, activeSprint?.id]
  )

  const totals = useMemo(() => {
    const total = issues?.length ?? 0
    const open = (issues ?? []).filter((issue) => issue.status === 'todo').length
    const inProgress = (issues ?? []).filter((issue) => issue.status === 'inprogress').length
    const done = (issues ?? []).filter((issue) => issue.status === 'done').length
    return { total, open, inProgress, done }
  }, [issues])

  const velocity = useMemo(() => {
    const completed = (sprints ?? []).filter((sprint) => sprint.status === 'completed')
    return completed.map((sprint) => {
      const sprintIssues = (issues ?? []).filter((issue) => issue.sprintId === sprint.id)
      const points = sprintIssues.reduce((acc, issue) => acc + (issue.storyPoints ?? 0), 0)
      return { label: sprint.name, points }
    })
  }, [issues, sprints])

  const burndown = useMemo(() => {
    if (!activeSprint?.startDate || !activeSprint?.endDate) return null
    const sprintIssues = (issues ?? []).filter((issue) => issue.sprintId === activeSprint.id)
    const totalPoints = sprintIssues.reduce((acc, issue) => acc + (issue.storyPoints ?? 0), 0)
    const start = startOfDay(new Date(activeSprint.startDate))
    const end = startOfDay(new Date(activeSprint.endDate))
    const days = eachDayOfInterval({ start, end })

    const doneByDate = new Map<string, number>()
    sprintIssues.forEach((issue) => {
      if (!issue.resolvedAt) return
      const resolved = startOfDay(new Date(issue.resolvedAt))
      const key = format(resolved, 'yyyy-MM-dd')
      doneByDate.set(key, (doneByDate.get(key) ?? 0) + (issue.storyPoints ?? 0))
    })

    let cumulativeDone = 0
    const remainingSeries = days.map((day) => {
      const key = format(day, 'yyyy-MM-dd')
      cumulativeDone += doneByDate.get(key) ?? 0
      return Math.max(totalPoints - cumulativeDone, 0)
    })

    const idealSeries = days.map((_, index) => {
      if (days.length <= 1) return totalPoints
      const slope = totalPoints / (days.length - 1)
      return Math.max(totalPoints - slope * index, 0)
    })

    return {
      labels: days.map((day) => format(day, 'MMM d')),
      remainingSeries,
      idealSeries,
      totalPoints
    }
  }, [activeSprint?.startDate, activeSprint?.endDate, activeSprint?.id, issues])

  const sprintDone = activeSprintIssues.filter((issue) => issue.status === 'done').length
  const sprintProgress = activeSprintIssues.length > 0 ? (sprintDone / activeSprintIssues.length) * 100 : 0

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader title={project?.name ?? `Project ${projectKey}`} subtitle="Sprint overview and key metrics." />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h3">Active Sprint</Typography>
          <Divider />
          {activeSprint ? (
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {activeSprint.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {activeSprint.startDate ?? 'TBD'} → {activeSprint.endDate ?? 'TBD'}
              </Typography>
              <LinearProgress variant="determinate" value={sprintProgress} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {sprintDone} of {activeSprintIssues.length} issues completed
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No active sprint. Start a sprint to see progress tracking.
            </Typography>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h3">Summary Stats</Typography>
          <Divider />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {[
              { label: 'Total Issues', value: totals.total },
              { label: 'Open', value: totals.open },
              { label: 'In Progress', value: totals.inProgress },
              { label: 'Closed', value: totals.done }
            ].map((stat) => (
              <Card key={stat.label} sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {stat.label}
                </Typography>
                <Typography variant="h3">{stat.value}</Typography>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h3">Velocity</Typography>
          <Divider />
          {velocity.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Complete a sprint to see velocity.
            </Typography>
          ) : (
            <BarChart
              xAxis={[{ data: velocity.map((item) => item.label), scaleType: 'band' }]}
              series={[{ data: velocity.map((item) => item.points), label: 'Story points' }]}
              height={240}
            />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h3">Burndown</Typography>
          <Divider />
          {!burndown ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Start an active sprint with dates to see burndown.
            </Typography>
          ) : (
            <LineChart
              xAxis={[{ data: burndown.labels, scaleType: 'point' }]}
              series={[
                { data: burndown.remainingSeries, label: 'Remaining' },
                { data: burndown.idealSeries, label: 'Ideal' }
              ]}
              height={240}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
