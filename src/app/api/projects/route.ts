import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { projectSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const query = supabase.from('projects').select('*').order('created_at', { ascending: false })
  const { data, error: fetchError } = status ? await query.eq('status', status) : await query

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch projects')
    return fail('Failed to fetch projects', 500)
  }

  return ok(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = projectSchema.safeParse(payload)
  if (!parsed.success) {
    return fail(parsed.error.message, 400)
  }

  const { data: project, error: insertError } = await supabase
    .from('projects')
    .insert({
      name: parsed.data.name,
      key: parsed.data.key,
      description: parsed.data.description ?? null,
      project_type: parsed.data.projectType,
      lead_user_id: parsed.data.leadUserId ?? user.id,
      avatar_url: parsed.data.avatarUrl ?? null,
      start_date: parsed.data.startDate ?? null,
      end_date: parsed.data.endDate ?? null,
      created_by: user.id
    })
    .select('*')
    .single()

  if (insertError || !project) {
    logger.error({ insertError }, 'Failed to create project')
    return fail('Failed to create project', 500)
  }

  const { error: memberError } = await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: user.id,
    role: 'project_admin'
  })

  if (memberError) {
    logger.error({ memberError }, 'Failed to attach project member')
  }

  return ok(project, 201)
}
