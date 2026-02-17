'use client'

import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { use } from 'react'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { apiDelete, apiPatch } from '@/lib/api/client'
import { ProjectSettingsTabs } from '@/components/projects/ProjectSettingsTabs'

export default function ProjectSettingsPage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = use(params)
  const { data: project } = useProjectByKey(projectKey)

  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [projectType, setProjectType] = useState('software')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

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
    setActionError(null)
    await apiPatch(`/api/projects/${project.id}`, {
      name,
      key,
      projectType,
      description
    })
    setSaving(false)
  }

  const onArchive = async () => {
    if (!project) return
    setActionError(null)
    const result = await apiPatch(`/api/projects/${project.id}/archive`, {})
    if (!result.success) {
      setActionError(result.error)
    }
    setArchiveOpen(false)
  }

  const onRestore = async () => {
    if (!project) return
    setActionError(null)
    const result = await apiPatch(`/api/projects/${project.id}/restore`, {})
    if (!result.success) {
      setActionError(result.error)
    }
    setRestoreOpen(false)
  }

  const onDelete = async () => {
    if (!project) return
    setActionError(null)
    const result = await apiDelete(`/api/projects/${project.id}`)
    if (!result.success) {
      setActionError(result.error)
    }
    setDeleteOpen(false)
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Project Settings" subtitle="Update project details and preferences." />
      <ProjectSettingsTabs projectKey={projectKey} active="general" />
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

      <Card>
        <CardContent sx={{ display: 'grid', gap: 1.5, maxWidth: 520 }}>
          <Typography variant="h3">Project Lifecycle</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Status: {project?.status ?? 'unknown'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {project?.status === 'active' && (
              <Button variant="outlined" onClick={() => setArchiveOpen(true)}>
                Archive Project
              </Button>
            )}
            {project?.status === 'archived' && (
              <Button variant="outlined" onClick={() => setRestoreOpen(true)}>
                Restore Project
              </Button>
            )}
            <Button color="error" variant="outlined" onClick={() => setDeleteOpen(true)}>
              Move to Trash
            </Button>
          </Box>
          {actionError && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {actionError}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Dialog open={archiveOpen} onClose={() => setArchiveOpen(false)}>
        <DialogTitle>Archive Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This project will become read-only and hidden from active views.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onArchive}>
            Archive
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={restoreOpen} onClose={() => setRestoreOpen(false)}>
        <DialogTitle>Restore Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2">This project will return to active status.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onRestore}>
            Restore
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Move Project to Trash</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Only system admins can delete. The project will stay in trash for 30 days.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={onDelete}>
            Move to Trash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
