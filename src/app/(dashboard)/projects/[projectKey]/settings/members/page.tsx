import { Box, Card, CardContent, Chip, Typography } from '@mui/material'

import { UserAvatar } from '@/components/design/UserAvatar'
import { SectionHeader } from '@/components/ui/SectionHeader'

const members = [
  { id: 'user-1', name: 'Ava Reynolds', email: 'ava@projecthub.dev', role: 'project_admin' },
  { id: 'user-2', name: 'Kai Holt', email: 'kai@projecthub.dev', role: 'developer' }
]

export default function ProjectMembersPage() {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Members" subtitle="Manage project access and roles." />
      <Card>
        <CardContent sx={{ display: 'grid', gap: 1.5 }}>
          {members.map((member) => (
            <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <UserAvatar userId={member.id} fullName={member.name} size="sm" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {member.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {member.email}
                </Typography>
              </Box>
              <Chip
                label={member.role.replace('_', ' ')}
                color={member.role === 'project_admin' ? 'primary' : member.role === 'developer' ? 'info' : 'default'}
                size="small"
              />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}
