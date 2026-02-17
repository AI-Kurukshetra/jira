import { Box } from '@mui/material'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProjectsActions } from '@/components/projects/ProjectsActions'
import { ProjectsSection } from '@/components/projects/ProjectsSection'

export default function ProjectsPage() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <SectionHeader
        title="Projects"
        subtitle="Manage your active and archived projects."
        action={<ProjectsActions />}
      />
      <ProjectsSection />
    </Box>
  )
}
