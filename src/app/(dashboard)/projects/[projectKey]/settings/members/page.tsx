'use client'

import { Box, Card, CardContent, Chip, Typography } from '@mui/material'
import { use } from 'react'

import { UserAvatar } from '@/components/design/UserAvatar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useProjectByKey } from '@/lib/hooks/useProjectByKey'
import { useProjectMembers } from '@/lib/hooks/useProjectMembers'

export default function ProjectMembersPage({ params }: { params: Promise<{ projectKey: string }> }) {
  const { projectKey } = use(params)
  const { data: project } = useProjectByKey(projectKey)
  const { data: members } = useProjectMembers(project?.id)

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <SectionHeader title="Members" subtitle="Manage project access and roles." />
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
