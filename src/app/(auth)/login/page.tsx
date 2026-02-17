'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, FormControlLabel, Switch, TextField, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout'
import { loginSchema } from '@/lib/validations/schemas'
import { loginAction } from '@/app/(auth)/actions'
import type { z } from 'zod'

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { register, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const bullets = useMemo(
    () => ['Track projects with clarity', 'Ship work faster with sprints', 'Collaborate with context-rich issues'],
    []
  )

  const onSubmit = (values: LoginValues) => {
    setServerError(null)
    startTransition(async () => {
      const result = await loginAction(values)
      if (!result.success) {
        setServerError(result.error ?? 'Login failed')
        return
      }
      router.push('/')
    })
  }

  return (
    <AuthSplitLayout title="ProjectHub" subtitle="Ship better. Track smarter." bullets={bullets}>
      <AuthCard
        title="Welcome back"
        subtitle="Log in to continue managing your projects."
        footer={
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Don&apos;t have an account?{' '}
            <Typography component={Link} href="/register" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Create one
            </Typography>
          </Typography>
        }
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Email" type="email" placeholder="you@company.com" {...register('email')} />
          <TextField label="Password" type="password" placeholder="••••••••" {...register('password')} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <FormControlLabel control={<Switch size="small" />} label="Remember me" />
            <Typography component={Link} href="/forgot-password" sx={{ color: 'primary.main', fontSize: '0.8125rem' }}>
              Forgot password?
            </Typography>
          </Box>

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
          {serverError && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {serverError}
            </Typography>
          )}

          <Button type="submit" variant="contained" size="large" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>
      </AuthCard>
    </AuthSplitLayout>
  )
}
