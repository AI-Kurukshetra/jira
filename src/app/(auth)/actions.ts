'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { registerSchema, loginSchema, resetPasswordSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'

interface ActionResult {
  success: boolean
  error?: string
}

async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          for (const cookie of cookiesToSet) {
            cookieStore.set(cookie.name, cookie.value, cookie.options)
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

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  })

  if (error) {
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
