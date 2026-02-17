import { Box } from '@mui/material'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProjectsActions } from '@/components/projects/ProjectsActions'
import { ProjectCardList } from '@/components/projects/ProjectCardList'

const mockProjects = [
  { name: 'ProjectHub Core', key: 'PROJ', description: 'Core platform workstreams' }
]

export default function ProjectsPage() {
  const hasProjects = mockProjects.length > 0

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader
        title="Projects"
        subtitle="Manage your active and archived projects."
        action={<ProjectsActions />}
      />

      {!hasProjects ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking issues and sprints."
          actionLabel="Create project"
        />
      ) : (
        <ProjectCardList projects={mockProjects} />
      )}
    </Box>
  )
}
