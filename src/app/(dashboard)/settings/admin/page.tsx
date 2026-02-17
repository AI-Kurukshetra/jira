'use client'

import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { useAdminUsers } from '@/lib/hooks/useAdminUsers'
import { apiPatch, apiPost } from '@/lib/api/client'
import type { AdminUser } from '@/lib/types'

const ROLE_OPTIONS: AdminUser['role'][] = ['system_admin', 'project_admin', 'developer', 'viewer']

export default function AdminUsersPage() {
  const { data, isLoading, isError } = useAdminUsers()
  const queryClient = useQueryClient()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<AdminUser['role']>('developer')

  const inviteUser = useMutation({
    mutationFn: async () => {
      const result = await apiPost('/api/admin/users', {
        email: inviteEmail,
        fullName: inviteName,
        role: inviteRole
      })
      if (!result.success) throw new Error(result.error)
      return true
    },
    onSuccess: async () => {
      setInviteEmail('')
      setInviteName('')
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })

  const updateUser = useMutation({
    mutationFn: async (payload: { userId: string; role?: AdminUser['role']; isActive?: boolean }) => {
      const result = await apiPatch('/api/admin/users', payload)
      if (!result.success) throw new Error(result.error)
      return true
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })

  const sorted = useMemo(() => {
    return (data ?? []).slice().sort((a, b) => (a.email ?? '').localeCompare(b.email ?? ''))
  }, [data])

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Admin Users" subtitle="Invite users, manage roles, and control access." />

      <Card>
        <CardContent sx={{ display: 'grid', gap: 2, maxWidth: 640 }}>
          <Typography variant="h3">Invite User</Typography>
          <TextField label="Full Name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
          <TextField label="Email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          <TextField
            select
            label="Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as AdminUser['role'])}
          >
            {ROLE_OPTIONS.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            onClick={() => inviteUser.mutate()}
            disabled={inviteUser.isPending || !inviteEmail || !inviteName}
          >
            {inviteUser.isPending ? 'Inviting...' : 'Send Invite'}
          </Button>
          {inviteUser.isError && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {inviteUser.error?.message ?? 'Failed to invite user.'}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ display: 'grid', gap: 1.5 }}>
          <Typography variant="h3">Users</Typography>
          {isLoading && <Typography variant="body2">Loading users...</Typography>}
          {isError && <Typography variant="body2" sx={{ color: 'error.main' }}>Failed to load users.</Typography>}
          {!isLoading && !isError && (
            <Box sx={{ display: 'grid', gap: 1 }}>
              {sorted.map((user) => (
                <Box
                  key={user.id}
                  sx={(theme) => ({
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1fr 1fr auto',
                    gap: 2,
                    alignItems: 'center',
                    padding: 1.5,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  })}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.fullName ?? 'Unnamed'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {user.email ?? 'No email'}
                    </Typography>
                  </Box>
                  <TextField
                    select
                    size="small"
                    value={user.role}
                    onChange={(e) => updateUser.mutate({ userId: user.id, role: e.target.value as AdminUser['role'] })}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    value={user.isActive ? 'active' : 'inactive'}
                    onChange={(e) =>
                      updateUser.mutate({ userId: user.id, isActive: e.target.value === 'active' })
                    }
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </TextField>
                  <Typography variant="caption" sx={{ color: 'text.tertiary' }}>
                    {user.lastSignInAt ? `Last login ${new Date(user.lastSignInAt).toLocaleDateString()}` : 'Never'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
