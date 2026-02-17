'use client'

import { Box, Button } from '@mui/material'
import { useMemo, useState } from 'react'

import { BoardColumnsDialog } from '@/components/board/BoardColumnsDialog'
import { KanbanBoard } from '@/components/board/KanbanBoard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { useIssues } from '@/lib/hooks/useIssues'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useSprints } from '@/lib/hooks/useSprints'
import { IssueFiltersBar } from '@/components/issues/IssueFiltersBar'
import { useIssueFilters } from '@/lib/store/issueFilters'
import { applyIssueFilters } from '@/lib/filters'
import { useMe } from '@/lib/hooks/useMe'
import { useCreateIssue } from '@/components/issues/CreateIssueProvider'
import { useBoardColumns } from '@/lib/hooks/useBoardColumns'
import { use } from 'react'

export default function BoardPage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = use(params)
  const { data: project } = useProjectByKey(projectKey)
  const { data: me } = useMe()
  const { openCreateIssue } = useCreateIssue()
  const { data: sprints } = useSprints(project?.id)
  const { data: columns = [] } = useBoardColumns(project?.id)
  const [columnsOpen, setColumnsOpen] = useState(false)
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
      <SectionHeader
        title="Board"
        subtitle="Drag issues across your workflow."
        action={
          project?.id ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" onClick={() => setColumnsOpen(true)}>
                Manage Columns
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => openCreateIssue(project.id, activeSprint?.id)}
              >
                Create Issue
              </Button>
            </Box>
          ) : null
        }
      />
      {project?.id && <IssueFiltersBar projectId={project.id} />}
      {project?.id && columns.length === 0 ? (
        <EmptyState
          title="No columns yet"
          description="Create your first board columns to start tracking issues."
          actionLabel="Add columns"
          onAction={() => setColumnsOpen(true)}
        />
      ) : (
        <KanbanBoard
          initialIssues={filteredIssues}
          columns={columns}
          onAddIssue={(columnId) => {
            if (!project?.id) return
            openCreateIssue(project.id, activeSprint?.id, columnId)
          }}
        />
      )}
      {project?.id && (
        <BoardColumnsDialog
          open={columnsOpen}
          onClose={() => setColumnsOpen(false)}
          projectId={project.id}
          columns={columns}
        />
      )}
    </Box>
  )
}
