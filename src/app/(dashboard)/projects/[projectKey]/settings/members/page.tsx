'use client'

import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { use } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { UserAvatar } from '@/components/design/UserAvatar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useProjectMembers } from '@/lib/hooks/useProjectMembers'
import { apiDelete, apiPatch, apiPost } from '@/lib/api/client'
import { ProjectSettingsTabs } from '@/components/projects/ProjectSettingsTabs'

export default function ProjectMembersPage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = use(params)
  const { data: project } = useProjectByKey(projectKey)
  const { data: members } = useProjectMembers(project?.id)
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('developer')
  const [error, setError] = useState<string | null>(null)

  const addMember = useMutation({
    mutationFn: async () => {
      if (!project?.id) throw new Error('Missing project')
      const result = await apiPost(`/api/projects/${project.id}/members`, {
        email: email.trim(),
        role
      })
      if (!result.success) throw new Error(result.error)
      return true
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-members', project?.id] })
      setEmail('')
      setRole('developer')
      setError(null)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to add member.')
    }
  })

  const updateMember = useMutation({
    mutationFn: async (payload: { userId: string; role: string }) => {
      if (!project?.id) throw new Error('Missing project')
      const result = await apiPatch(`/api/projects/${project.id}/members`, payload)
      if (!result.success) throw new Error(result.error)
      return true
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-members', project?.id] })
    }
  })

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      if (!project?.id) throw new Error('Missing project')
      const result = await apiDelete(`/api/projects/${project.id}/members`, { userId })
      if (!result.success) throw new Error(result.error)
      return true
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project-members', project?.id] })
    }
  })

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Members" subtitle="Manage project access and roles." />
      <ProjectSettingsTabs projectKey={projectKey} active="members" />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 2, maxWidth: 520 }}>
          <Typography variant="h3">Add Member</Typography>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@company.com"
          />
          <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
            <MenuItem value="project_admin">Project Admin</MenuItem>
            <MenuItem value="developer">Developer</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </TextField>
          {error && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            size="small"
            onClick={() => addMember.mutate()}
            disabled={!email.trim() || addMember.isPending}
          >
            {addMember.isPending ? 'Adding...' : 'Add member'}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ display: 'grid', gap: 1.5 }}>
          {members?.map((member) => (
            <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <UserAvatar
                userId={member.userId}
                fullName={member.profile?.displayName ?? member.profile?.fullName ?? 'Member'}
                size="sm"
                {...(member.profile?.avatarUrl ? { src: member.profile.avatarUrl } : {})}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {member.profile?.displayName ?? member.profile?.fullName ?? member.userId}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Role: {member.role}
                </Typography>
              </Box>
              <TextField
                select
                size="small"
                value={member.role}
                onChange={(event) => updateMember.mutate({ userId: member.userId, role: event.target.value })}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="project_admin">Project Admin</MenuItem>
                <MenuItem value="developer">Developer</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </TextField>
              <Button
                variant="text"
                size="small"
                onClick={() => removeMember.mutate(member.userId)}
                sx={{ color: 'error.main' }}
              >
                Remove
              </Button>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}
