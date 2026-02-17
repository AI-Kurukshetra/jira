'use client'

import { Box, Button, Card, CardContent, FormControlLabel, Switch, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { useMe } from '@/lib/hooks/useMe'
import { apiPatch } from '@/lib/api/client'
import Link from 'next/link'
import { UserAvatar } from '@/components/design/UserAvatar'
import { createClient } from '@/lib/supabase/client'
import { ALLOWED_AVATAR_TYPES, AVATARS_BUCKET, MAX_AVATAR_BYTES } from '@/config/constants'

export default function UserSettingsPage() {
  const { data } = useMe()
  const profile = data?.profile
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [prefs, setPrefs] = useState({
    email: true,
    inApp: true,
    assignments: true,
    statusChanges: true,
    comments: true,
    mentions: true
  })

  useEffect(() => {
    if (!profile) return
    setFullName(profile.fullName ?? '')
    setDisplayName(profile.displayName ?? '')
    setTimezone(profile.timezone ?? 'UTC')
    setPrefs({
      email: profile.notificationPrefs?.email ?? true,
      inApp: profile.notificationPrefs?.inApp ?? true,
      assignments: profile.notificationPrefs?.assignments ?? true,
      statusChanges: profile.notificationPrefs?.statusChanges ?? true,
      comments: profile.notificationPrefs?.comments ?? true,
      mentions: profile.notificationPrefs?.mentions ?? true
    })
  }, [profile])

  const onSave = async () => {
    setSaving(true)
    setError(null)
    const result = await apiPatch('/api/profile', {
      fullName,
      displayName,
      timezone,
      notifications: prefs
    })
    if (!result.success) {
      setError(result.error)
    }
    await queryClient.invalidateQueries({ queryKey: ['me'] })
    setSaving(false)
  }

  const onAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !data?.user.id) return
    setAvatarError(null)

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Only PNG or JPG images are allowed.')
      return
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(`Avatar must be under ${Math.round(MAX_AVATAR_BYTES / (1024 * 1024))}MB.`)
      return
    }

    setAvatarUploading(true)
    const supabase = createClient()
    const storagePath = `${data.user.id}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage.from(AVATARS_BUCKET).upload(storagePath, file, {
      upsert: true
    })
    if (uploadError) {
      setAvatarError(uploadError.message)
      setAvatarUploading(false)
      return
    }

    const { data: publicData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(storagePath)
    const result = await apiPatch('/api/profile', { avatarUrl: publicData.publicUrl })
    if (!result.success) {
      setAvatarError(result.error)
      setAvatarUploading(false)
      return
    }

    await queryClient.invalidateQueries({ queryKey: ['me'] })
    setAvatarUploading(false)
  }

  const onChangePassword = async () => {
    setPasswordSaving(true)
    setPasswordError(null)
    const result = await apiPatch('/api/profile/password', {
      currentPassword,
      newPassword,
      confirmPassword
    })
    if (!result.success) {
      setPasswordError(result.error)
      setPasswordSaving(false)
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordSaving(false)
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="User Settings" subtitle="Update your profile and notification preferences." />

      <Card>
        <CardContent sx={{ display: 'grid', gap: 2, maxWidth: 520 }}>
          <Typography variant="h3">Profile</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <UserAvatar
              userId={data?.user.id ?? 'user'}
              fullName={profile?.displayName ?? profile?.fullName ?? 'User'}
              size="lg"
              {...(profile?.avatarUrl ? { src: profile.avatarUrl } : {})}
            />
            <Box sx={{ display: 'grid', gap: 0.5 }}>
              <Button component="label" variant="outlined" size="small" disabled={avatarUploading}>
                {avatarUploading ? 'Uploading...' : 'Upload Avatar'}
                <input type="file" hidden onChange={onAvatarChange} />
              </Button>
              {avatarError && (
                <Typography variant="caption" sx={{ color: 'error.main' }}>
                  {avatarError}
                </Typography>
              )}
            </Box>
          </Box>
          <TextField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <TextField label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <TextField label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ display: 'grid', gap: 1.5, maxWidth: 520 }}>
          <Typography variant="h3">Notification Preferences</Typography>
          <FormControlLabel
            control={<Switch checked={prefs.inApp} onChange={(e) => setPrefs((p) => ({ ...p, inApp: e.target.checked }))} />}
            label="In-app notifications"
          />
          <FormControlLabel
            control={<Switch checked={prefs.email} onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.checked }))} />}
            label="Email notifications"
          />
          <FormControlLabel
            control={<Switch checked={prefs.assignments} onChange={(e) => setPrefs((p) => ({ ...p, assignments: e.target.checked }))} />}
            label="Issue assignments"
          />
          <FormControlLabel
            control={<Switch checked={prefs.statusChanges} onChange={(e) => setPrefs((p) => ({ ...p, statusChanges: e.target.checked }))} />}
            label="Status changes"
          />
          <FormControlLabel
            control={<Switch checked={prefs.comments} onChange={(e) => setPrefs((p) => ({ ...p, comments: e.target.checked }))} />}
            label="Comments"
          />
          <FormControlLabel
            control={<Switch checked={prefs.mentions} onChange={(e) => setPrefs((p) => ({ ...p, mentions: e.target.checked }))} />}
            label="Mentions"
          />
        </CardContent>
      </Card>

      {error && (
        <Typography variant="caption" sx={{ color: 'error.main' }}>
          {error}
        </Typography>
      )}

      <Box>
        <Button variant="contained" size="large" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ display: 'grid', gap: 2, maxWidth: 520 }}>
          <Typography variant="h3">Change Password</Typography>
          <TextField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {passwordError}
            </Typography>
          )}
          <Box>
            <Button variant="outlined" size="small" onClick={onChangePassword} disabled={passwordSaving}>
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {profile?.role === 'system_admin' && (
        <Card>
          <CardContent sx={{ display: 'grid', gap: 1 }}>
            <Typography variant="h3">Admin</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage users, roles, and account status.
            </Typography>
            <Button component={Link} href="/settings/admin" variant="outlined" size="small" sx={{ width: 'fit-content' }}>
              Open Admin Users
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
