'use client'

import { Box, Button, Card, CardContent } from '@mui/material'
import Link from 'next/link'

interface ProjectSummary {
  name: string
  key: string
  description?: string
}

interface ProjectCardListProps {
  projects: ProjectSummary[]
}

export function ProjectCardList({ projects }: ProjectCardListProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
      {projects.map((project) => (
        <Card key={project.key} sx={{ p: 2 }}>
          <CardContent sx={{ display: 'grid', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ fontWeight: 600 }}>{project.name}</Box>
                <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{project.key}</Box>
              </Box>
              <Button size="small" component={Link} href={`/projects/${project.key}`}>
                Open
              </Button>
            </Box>
            <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{project.description}</Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
