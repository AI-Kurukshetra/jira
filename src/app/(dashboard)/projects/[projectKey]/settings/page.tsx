'use client'

import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { use } from 'react'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { apiPatch } from '@/lib/api/client'

export default function ProjectSettingsPage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = use(params)
  const { data: project } = useProjectByKey(projectKey)

  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [projectType, setProjectType] = useState('software')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!project) return
    setName(project.name)
    setKey(project.key)
    setProjectType(project.projectType)
    setDescription(project.description ?? '')
  }, [project])

  const onSave = async () => {
    if (!project) return
    setSaving(true)
    await apiPatch(`/api/projects/${project.id}`, {
      name,
      key,
      projectType,
      description
    })
    setSaving(false)
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Project Settings" subtitle="Update project details and preferences." />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2, maxWidth: 520 }}>
          <Typography variant="h3">General</Typography>
          <TextField label="Project Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Project Key" value={key} onChange={(e) => setKey(e.target.value)} />
          <TextField select label="Project Type" value={projectType} onChange={(e) => setProjectType(e.target.value)}>
            <MenuItem value="software">Software</MenuItem>
            <MenuItem value="business">Business</MenuItem>
            <MenuItem value="ops">Ops</MenuItem>
          </TextField>
          <TextField label="Description" multiline minRows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button variant="contained" size="large" onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}
