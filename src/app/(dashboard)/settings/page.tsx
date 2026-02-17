'use client'

import { Box, Button, Card, CardContent, FormControlLabel, Switch, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { useMe } from '@/lib/hooks/useMe'
import { apiPatch } from '@/lib/api/client'

export default function UserSettingsPage() {
  const { data } = useMe()
  const profile = data?.profile
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [timezone, setTimezone] = useState('UTC')
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
    setSaving(false)
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="User Settings" subtitle="Update your profile and notification preferences." />

      <Card>
        <CardContent sx={{ display: 'grid', gap: 2, maxWidth: 520 }}>
          <Typography variant="h3">Profile</Typography>
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
    </Box>
  )
}
