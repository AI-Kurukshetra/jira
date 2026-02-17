import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { adminUserCreateSchema, adminUserUpdateSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import type { AdminUser } from '@/lib/types'

interface ProfileRow {
  id: string
  full_name: string
  display_name?: string | null
  avatar_url?: string | null
  role?: string | null
  is_active?: boolean | null
}

const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createAdminClient(url, key, { auth: { persistSession: false } })
}

const ensureSystemAdmin = async (supabase: SupabaseClient) => {
  const { user, error } = await requireUser(supabase)
  if (error || !user) return { ok: false as const, response: fail('Unauthorized', 401) }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    logger.error({ profileError }, 'Failed to load profile role')
    return { ok: false as const, response: fail('Failed to verify admin', 500) }
  }

  if (profile?.role !== 'system_admin') {
    return { ok: false as const, response: fail('Forbidden', 403) }
  }

  return { ok: true as const }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const gate = await ensureSystemAdmin(supabase)
  if (!gate.ok) return gate.response

  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? '1')
  const perPage = Number(searchParams.get('perPage') ?? '50')

  const admin = getAdminClient()
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
  if (error) {
    logger.error({ error }, 'Failed to list users')
    return fail('Failed to list users', 500)
  }

  const ids = data.users.map((u) => u.id)
  const { data: profiles, error: profileError } = await admin
    .from('profiles')
    .select('id, full_name, display_name, avatar_url, role, is_active')
    .in('id', ids)

  if (profileError) {
    logger.error({ profileError }, 'Failed to load profiles')
    return fail('Failed to load profiles', 500)
  }

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile as ProfileRow]))

  const mapped: AdminUser[] = data.users.map((user) => {
    const profile = profileMap.get(user.id)
    return {
      id: user.id,
      email: user.email ?? null,
      fullName: profile?.full_name ?? null,
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      role: (profile?.role ?? 'developer') as AdminUser['role'],
      isActive: profile?.is_active ?? true,
      createdAt: user.created_at ?? null,
      lastSignInAt: user.last_sign_in_at ?? null
    }
  })

  return ok(mapped)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const gate = await ensureSystemAdmin(supabase)
  if (!gate.ok) return gate.response

  const payload = await request.json()
  const parsed = adminUserCreateSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const admin = getAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: { full_name: parsed.data.fullName }
  })

  if (error || !data.user) {
    logger.error({ error }, 'Failed to invite user')
    return fail('Failed to invite user', 500)
  }

  const role = parsed.data.role ?? 'developer'
  const { error: profileError } = await admin.from('profiles').upsert({
    id: data.user.id,
    full_name: parsed.data.fullName,
    role
  })

  if (profileError) {
    logger.error({ profileError }, 'Failed to set user profile role')
  }

  return ok({ id: data.user.id }, 201)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const gate = await ensureSystemAdmin(supabase)
  if (!gate.ok) return gate.response

  const payload = await request.json()
  const parsed = adminUserUpdateSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const admin = getAdminClient()
  const updates: Record<string, unknown> = {}
  if (parsed.data.role) updates.role = parsed.data.role
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive

  if (Object.keys(updates).length > 0) {
    const { error } = await admin.from('profiles').update(updates).eq('id', parsed.data.userId)
    if (error) {
      logger.error({ error }, 'Failed to update user profile')
      return fail('Failed to update user', 500)
    }
  }

  return ok({ id: parsed.data.userId })
}
