'use client'

import { Avatar } from '@mui/material'

import { getInitials, hashColor } from '@/lib/utils'

interface UserAvatarProps {
  userId: string
  fullName: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const SIZE_MAP: Record<NonNullable<UserAvatarProps['size']>, number> = {
  xs: 24,
  sm: 28,
  md: 32,
  lg: 40
}

function getGradient(userId: string) {
  const base = hashColor(userId)
  const accent = hashColor(`${userId}-accent`)
  return `linear-gradient(135deg, ${base} 0%, ${accent} 100%)`
}

export function UserAvatar({ userId, fullName, src, size = 'sm' }: UserAvatarProps) {
  const dimension = SIZE_MAP[size]
  const avatarSrc = src ?? undefined

  return (
    <Avatar
      {...(avatarSrc ? { src: avatarSrc } : {})}
      alt={fullName}
      sx={{
        width: dimension,
        height: dimension,
        fontSize: dimension <= 28 ? '0.75rem' : '0.875rem',
        fontWeight: 600,
        color: '#F0F0FF',
        backgroundImage: getGradient(userId),
        border: '1px solid #2D1B5E'
      }}
    >
      {getInitials(fullName)}
    </Avatar>
  )
}
