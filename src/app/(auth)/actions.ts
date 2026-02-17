'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { registerSchema, loginSchema, resetPasswordSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_FAILED_LOGINS = 5
const LOCK_MINUTES = 15
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24
const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

interface ActionResult {
  success: boolean
  error?: string
}

interface AuthUserRecord {
  id: string
  emailConfirmedAt?: string | null
}

const resolveAuthUser = async (email: string): Promise<AuthUserRecord | null> => {
  const admin = createAdminClient()
  const { data, error } = await admin
    .schema('auth')
    .from('users')
    .select('id, email_confirmed_at')
    .eq('email', email)
    .maybeSingle()
  if (error || !data) {
    if (error) {
      logger.warn({ error }, 'Failed to resolve auth user')
    }
    return null
  }
  return {
    id: data.id,
    emailConfirmedAt: data.email_confirmed_at ?? null
  }
}

async function createSupabaseServerClient(cookieMaxAgeSeconds?: number) {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          for (const cookie of cookiesToSet) {
            const options = cookie.options ?? {}
            cookieStore.set(cookie.name, cookie.value, {
              ...options,
              ...(cookieMaxAgeSeconds ? { maxAge: cookieMaxAgeSeconds } : {})
            })
          }
        }
      }
    }
  )
}

export async function loginAction(values: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid credentials' }
  }

  const maxAge = parsed.data.rememberMe ? REMEMBER_ME_MAX_AGE_SECONDS : SESSION_MAX_AGE_SECONDS
  const authUser = await resolveAuthUser(parsed.data.email)
  if (authUser?.emailConfirmedAt === null) {
    return { success: false, error: 'Please confirm your email before signing in.' }
  }

  let adminProfile: { failed_login_attempts?: number | null; lock_until?: string | null; is_active?: boolean | null } | null =
    null

  if (authUser?.id) {
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('failed_login_attempts, lock_until, is_active')
      .eq('id', authUser.id)
      .maybeSingle()
    adminProfile = profile ?? null

    if (profile?.is_active === false) {
      return { success: false, error: 'Your account is deactivated. Contact your admin.' }
    }

    if (profile?.lock_until) {
      const lockUntil = new Date(profile.lock_until)
      if (lockUntil.getTime() > Date.now()) {
        return { success: false, error: `Account locked. Try again after ${lockUntil.toLocaleString()}.` }
      }
    }
  }

  const supabase = await createSupabaseServerClient(maxAge)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  })

  if (error) {
    if (authUser?.id) {
      const admin = createAdminClient()
      const attempts = (adminProfile?.failed_login_attempts ?? 0) + 1
      const lockUntil =
        attempts >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString() : null

      await admin
        .from('profiles')
        .update({
          failed_login_attempts: attempts,
          last_failed_login_at: new Date().toISOString(),
          ...(lockUntil ? { lock_until: lockUntil } : {})
        })
        .eq('id', authUser.id)
    }
    logger.warn({ error }, 'Login failed')
    return { success: false, error: error.message }
  }

  if (data.user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      logger.warn({ profileError }, 'Profile check failed')
    }

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut()
      return { success: false, error: 'Your account is deactivated. Contact your admin.' }
    }

    const admin = createAdminClient()
    await admin
      .from('profiles')
      .update({
        failed_login_attempts: 0,
        lock_until: null,
        last_login_at: new Date().toISOString()
      })
      .eq('id', data.user.id)
  }

  return { success: true }
}

export async function registerAction(values: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid registration data' }
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { success: false, error: 'Passwords do not match' }
  }

  const supabase = await createSupabaseServerClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const options = {
    ...(appUrl ? { emailRedirectTo: `${appUrl}/login?confirmed=1` } : {}),
    data: {
      full_name: parsed.data.fullName
    }
  }
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options
  })

  if (error) {
    logger.warn({ error }, 'Registration failed')
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function resetPasswordAction(values: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid email' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/login`
  })

  if (error) {
    logger.warn({ error }, 'Reset password failed')
    return { success: false, error: error.message }
  }

  return { success: true }
}
