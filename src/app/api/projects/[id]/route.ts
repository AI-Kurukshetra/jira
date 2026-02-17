import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { projectSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { mapProjectRow } from '@/lib/api/mappers'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data, error: fetchError } = await supabase.from('projects').select('*').eq('id', id).single()

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch project')
    return fail('Failed to fetch project', 500)
  }

  return ok(mapProjectRow(data))
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = projectSchema.partial().safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data, error: updateError } = await supabase
    .from('projects')
    .update({
      name: parsed.data.name,
      key: parsed.data.key,
      description: parsed.data.description,
      project_type: parsed.data.projectType,
      lead_user_id: parsed.data.leadUserId,
      avatar_url: parsed.data.avatarUrl,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate
    })
    .eq('id', id)
    .select('*')
    .single()

  if (updateError) {
    logger.error({ updateError }, 'Failed to update project')
    return fail('Failed to update project', 500)
  }

  return ok(mapProjectRow(data))
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    logger.error({ profileError }, 'Failed to verify user role')
    return fail('Failed to verify permissions', 500)
  }

  if (profile?.role !== 'system_admin') {
    return fail('Forbidden', 403)
  }

  const { error: deleteError } = await supabase
    .from('projects')
    .update({ status: 'deleted', deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (deleteError) {
    logger.error({ deleteError }, 'Failed to delete project')
    return fail('Failed to delete project', 500)
  }

  return ok({ id })
}
