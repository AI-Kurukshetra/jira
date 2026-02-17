'use client'

import { Box, Card, CardContent, Typography } from '@mui/material'
import { use } from 'react'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProjectSettingsTabs } from '@/components/projects/ProjectSettingsTabs'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useSprints } from '@/lib/hooks/useSprints'
import { useIssues } from '@/lib/hooks/useIssues'

export default function SprintsArchivePage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = use(params)
  const { data: project } = useProjectByKey(projectKey)
  const { data: sprints } = useSprints(project?.id)
  const { data: issues } = useIssues(project?.id ? { projectId: project.id } : undefined)

  const completed = (sprints ?? []).filter((sprint) => sprint.status === 'completed')
  const completedIds = new Set(completed.map((sprint) => sprint.id))
  const completedIssues = (issues ?? []).filter((issue) => issue.sprintId && completedIds.has(issue.sprintId))
  const completedDone = completedIssues.filter((issue) => issue.status === 'done')
  const completionRate =
    completedIssues.length > 0 ? Math.round((completedDone.length / completedIssues.length) * 100) : 0

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Sprints Archive" subtitle="Review completed sprint history." />
      <ProjectSettingsTabs projectKey={projectKey} active="sprints" />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h3">Archive Stats</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Completed Sprints</Typography>
              <Typography variant="h3">{completed.length}</Typography>
            </Card>
            <Card sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Issues Completed</Typography>
              <Typography variant="h3">{completedDone.length}</Typography>
            </Card>
            <Card sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Completion Rate</Typography>
              <Typography variant="h3">{completionRate}%</Typography>
            </Card>
          </Box>
        </CardContent>
      </Card>
      {completed.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No completed sprints yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {completed.map((sprint) => (
            <Card key={sprint.id}>
              <CardContent sx={{ display: 'grid', gap: 1 }}>
                <Typography variant="h3">{sprint.name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {sprint.startDate ?? 'TBD'} → {sprint.endDate ?? 'TBD'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Issues: {completedIssues.filter((issue) => issue.sprintId === sprint.id).length}
                </Typography>
                {sprint.goal && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {sprint.goal}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
