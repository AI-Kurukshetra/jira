'use client'

import { Box } from '@mui/material'

import { EmptyState } from '@/components/ui/EmptyState'
import { ProjectCardList } from '@/components/projects/ProjectCardList'
import { useProjects } from '@/lib/hooks/useProjects'

export function ProjectsSection() {
  const { data, isLoading, isError } = useProjects()

  if (isLoading) {
    return <Box sx={{ color: 'text.secondary' }}>Loading projects...</Box>
  }

  if (isError) {
    return <Box sx={{ color: 'error.main' }}>Failed to load projects.</Box>
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Create your first project to start tracking issues and sprints."
        actionLabel="Create project"
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
