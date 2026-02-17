'use client'

import { Box } from '@mui/material'

import { BacklogView } from '@/components/backlog/BacklogView'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useSprints } from '@/lib/hooks/useSprints'
import { useIssues } from '@/lib/hooks/useIssues'

interface BacklogSectionProps {
  projectKey: string
}

export function BacklogSection({ projectKey }: BacklogSectionProps) {
  const { data: project } = useProjectByKey(projectKey)
  const { data: sprints, isLoading: sprintsLoading } = useSprints(project?.id)
  const { data: issues, isLoading: issuesLoading } = useIssues(
    project?.id ? { projectId: project.id } : undefined
  )

  if (sprintsLoading || issuesLoading) {
    return <LoadingSkeleton rows={6} height={28} />
  }

  if (!project) {
    return <EmptyState title="Project not found" description="We could not find this project." />
  }

  const activeSprint = sprints?.find((sprint) => sprint.status === 'active') ?? null
  const futureSprints = (sprints ?? []).filter((sprint) => sprint.status === 'pending')

  if (!issues || issues.length === 0) {
    return (
      <EmptyState
        title="No issues yet"
        description="Create issues to start planning your backlog."
        actionLabel="Create issue"
      />
    )
  }

  const sprintIssues: Record<string, typeof issues> = {}
  const backlogIssues = issues.filter((issue) => !issue.sprintId)

  issues.forEach((issue) => {
    if (!issue.sprintId) return
    if (!sprintIssues[issue.sprintId]) sprintIssues[issue.sprintId] = []
    sprintIssues[issue.sprintId]?.push(issue)
  })

  return (
    <BacklogView
      activeSprint={activeSprint}
      futureSprints={futureSprints}
      backlogIssues={backlogIssues}
      sprintIssues={sprintIssues}
    />
  )
}
