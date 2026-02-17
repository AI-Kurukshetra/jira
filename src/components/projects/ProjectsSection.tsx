'use client'

import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'

import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { ProjectCardList } from '@/components/projects/ProjectCardList'
import { useProjects } from '@/lib/hooks/useProjects'
import type { ProjectStatus } from '@/lib/types'

interface ProjectsSectionProps {
  status?: ProjectStatus
}

export function ProjectsSection({ status = 'active' }: ProjectsSectionProps) {
  const router = useRouter()
  const { data, isLoading, isError } = useProjects(status)

  if (isLoading) {
    return <LoadingSkeleton rows={4} height={32} />
  }

  if (isError) {
    return <Box sx={{ color: 'error.main' }}>Failed to load projects.</Box>
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={status === 'archived' ? 'No archived projects' : status === 'deleted' ? 'Trash is empty' : 'No projects yet'}
        description={
          status === 'archived'
            ? 'Archived projects will appear here.'
            : status === 'deleted'
              ? 'Deleted projects are kept for 30 days.'
              : 'Create your first project to start tracking issues and sprints.'
        }
        {...(status === 'active'
          ? {
              actionLabel: 'Create project',
              onAction: () => router.push('/projects/new')
            }
          : {})}
      />
    )
  }

  const projects = data.map((project) => ({
    name: project.name,
    key: project.key,
    description: project.description ?? ''
  }))

  return <ProjectCardList projects={projects} />
}
