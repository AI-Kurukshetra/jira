'use client'

import { Box, Card, CardContent, Typography } from '@mui/material'
import { use } from 'react'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProjectSettingsTabs } from '@/components/projects/ProjectSettingsTabs'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useSprints } from '@/lib/hooks/useSprints'

export default function SprintsArchivePage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = use(params)
  const { data: project } = useProjectByKey(projectKey)
  const { data: sprints } = useSprints(project?.id)

  const completed = (sprints ?? []).filter((sprint) => sprint.status === 'completed')

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Sprints Archive" subtitle="Review completed sprint history." />
      <ProjectSettingsTabs projectKey={projectKey} active="sprints" />
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
