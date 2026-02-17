'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, TextField, Typography } from '@mui/material'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { registerSchema } from '@/lib/validations/schemas'
import type { z } from 'zod'

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register, handleSubmit, formState, watch } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' }
  })

  const bullets = useMemo(
    () => ['Invite your team in minutes', 'Create issues with context', 'Stay aligned with clear priorities'],
    []
  )

  const onSubmit = (values: RegisterValues) => {
    void values
  }

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  return (
    <AuthSplitLayout title="ProjectHub" subtitle="Ship better. Track smarter." bullets={bullets}>
      <AuthCard
        title="Create your account"
        subtitle="Join ProjectHub and organize your work." 
        footer={
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Already have an account?{' '}
            <Typography component={Link} href="/login" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Sign in
            </Typography>
          </Typography>
        }
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Full name" placeholder="Ada Lovelace" {...register('fullName')} />
          <TextField label="Email" type="email" placeholder="you@company.com" {...register('email')} />
          <TextField label="Password" type="password" placeholder="Minimum 8 characters" {...register('password')} />
          <TextField label="Confirm password" type="password" placeholder="Repeat password" {...register('confirmPassword')} />

          {formState.errors.fullName && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {formState.errors.fullName.message}
            </Typography>
          )}
          {formState.errors.email && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {formState.errors.email.message}
            </Typography>
          )}
          {formState.errors.password && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {formState.errors.password.message}
            </Typography>
          )}
          {password && confirmPassword && !passwordsMatch && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              Passwords do not match.
            </Typography>
          )}

          <Button type="submit" variant="contained" size="large">
            Create account
          </Button>
        </Box>
      </AuthCard>
    </AuthSplitLayout>
  )
}
