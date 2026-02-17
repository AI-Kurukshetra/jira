'use client'

import { Box } from '@mui/material'
import { useMemo } from 'react'

import { KanbanBoard } from '@/components/board/KanbanBoard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useIssues } from '@/lib/hooks/useIssues'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useSprints } from '@/lib/hooks/useSprints'
import { IssueFiltersBar } from '@/components/issues/IssueFiltersBar'
import { useIssueFilters } from '@/lib/store/issueFilters'
import { applyIssueFilters } from '@/lib/filters'
import { useMe } from '@/lib/hooks/useMe'
import { use } from 'react'

export default function BoardPage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = use(params)
  const { data: project } = useProjectByKey(projectKey)
  const { data: me } = useMe()
  const { data: sprints } = useSprints(project?.id)
  const activeSprint = sprints?.find((sprint) => sprint.status === 'active')
  const issuesParams =
    project?.id && activeSprint?.id
      ? { projectId: project.id, sprintId: activeSprint.id }
      : project?.id
        ? { projectId: project.id }
        : undefined
  const { data } = useIssues(issuesParams)
  const { filters } = useIssueFilters(project?.id ?? 'unknown')

  const filteredIssues = useMemo(() => {
    if (!data) return []
    return applyIssueFilters(data, filters, me?.user.id)
  }, [data, filters, me?.user.id])

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Board" subtitle="Drag issues across your workflow." />
      {project?.id && <IssueFiltersBar projectId={project.id} />}
      <KanbanBoard initialIssues={filteredIssues} />
    </Box>
  )
}
