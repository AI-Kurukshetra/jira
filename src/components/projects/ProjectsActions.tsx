'use client'

import { Button } from '@mui/material'
import Link from 'next/link'

interface ProjectsActionsProps {
  href?: string
  label?: string
}

export function ProjectsActions({ href = '/projects/new', label = 'New Project' }: ProjectsActionsProps) {
  return (
    <Button component={Link} href={href} variant="contained" size="small">
      {label}
    </Button>
  )
}
