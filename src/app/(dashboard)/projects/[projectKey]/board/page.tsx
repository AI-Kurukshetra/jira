'use client'

import { Box } from '@mui/material'

import { KanbanBoard } from '@/components/board/KanbanBoard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useIssues } from '@/lib/hooks/useIssues'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useSprints } from '@/lib/hooks/useSprints'
import { use } from 'react'

export default function BoardPage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = use(params)
  const { data: project } = useProjectByKey(projectKey)
  const { data: sprints } = useSprints(project?.id)
  const activeSprint = sprints?.find((sprint) => sprint.status === 'active')
  const issuesParams =
    project?.id && activeSprint?.id
      ? { projectId: project.id, sprintId: activeSprint.id }
      : project?.id
        ? { projectId: project.id }
        : undefined
  const { data } = useIssues(issuesParams)

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Board" subtitle="Drag issues across your workflow." />
      <KanbanBoard initialIssues={data ?? []} />
    </Box>
  )
}
