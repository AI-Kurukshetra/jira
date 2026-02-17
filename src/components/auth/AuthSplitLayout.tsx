'use client'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AuthSplitLayoutProps {
  title: string
  subtitle: string
  bullets: string[]
  children: ReactNode
}

const MotionBox = motion(Box)

export function AuthSplitLayout({ title, subtitle, bullets, children }: AuthSplitLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box
        sx={(theme) => ({
          width: { xs: '100%', md: '45%' },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: 6,
          py: 8,
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden'
        })}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{
              fontSize: '3rem',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 700
            }}
          >
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
            {subtitle}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {bullets.map((bullet) => (
            <Box key={bullet} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleOutlineIcon sx={{ color: 'primary.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {bullet}
              </Typography>
            </Box>
          ))}
        </Box>

        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          sx={(theme) => ({
            position: 'absolute',
            top: -120,
            right: -80,
            width: 320,
            height: 320,
            background: `radial-gradient(circle at center, ${alpha(
              theme.palette.primary.main,
              0.4
            )} 0%, transparent 70%)`,
            filter: 'blur(30px)'
          })}
        />
      </Box>

      <Box
        sx={{
          width: { xs: '100%', md: '55%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 6
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
