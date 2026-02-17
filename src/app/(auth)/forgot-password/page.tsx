'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, TextField, Typography } from '@mui/material'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { resetPasswordSchema } from '@/lib/validations/schemas'
import type { z } from 'zod'

type ResetValues = z.infer<typeof resetPasswordSchema>

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState } = useForm<ResetValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' }
  })

  const bullets = useMemo(
    () => ['Secure password recovery', 'Reset links expire in 1 hour', 'Keep your account protected'],
    []
  )

  const onSubmit = (values: ResetValues) => {
    void values
  }

  return (
    <AuthSplitLayout title="ProjectHub" subtitle="Ship better. Track smarter." bullets={bullets}>
      <AuthCard
        title="Reset your password"
        subtitle="We will email you a secure reset link." 
        footer={
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Remembered your password?{' '}
            <Typography component={Link} href="/login" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Return to login
            </Typography>
          </Typography>
        }
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Email" type="email" placeholder="you@company.com" {...register('email')} />

          {formState.errors.email && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {formState.errors.email.message}
            </Typography>
          )}

          <Button type="submit" variant="contained" size="large">
            Send reset link
          </Button>
        </Box>
      </AuthCard>
    </AuthSplitLayout>
  )
}
