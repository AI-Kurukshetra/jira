import type { ReactNode } from 'react'
import { Box } from '@mui/material'

import { ProjectTabs } from '@/components/projects/ProjectTabs'

interface ProjectLayoutProps {
  children: ReactNode
  params: Promise<{ projectKey: string }>
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { projectKey } = await params
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <ProjectTabs projectKey={projectKey} />
      {children}
    </Box>
  )
}
