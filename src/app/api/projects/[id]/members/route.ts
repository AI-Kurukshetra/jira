import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { projectMemberSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data, error: fetchError } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', id)

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch project members')
    return fail('Failed to fetch project members', 500)
  }

  return ok(data ?? [])
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = projectMemberSchema.safeParse({ ...payload, projectId: id })
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data, error: insertError } = await supabase
    .from('project_members')
    .insert({
      project_id: id,
      user_id: parsed.data.userId,
      role: parsed.data.role
    })
    .select('*')
    .single()

  if (insertError) {
    logger.error({ insertError }, 'Failed to add project member')
    return fail('Failed to add project member', 500)
  }

  return ok(data, 201)
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = projectMemberSchema.partial().safeParse({ ...payload, projectId: id })
  if (!parsed.success) return fail(parsed.error.message, 400)

  if (!parsed.data.userId) return fail('Missing userId', 400)

  const { data, error: updateError } = await supabase
    .from('project_members')
    .update({ role: parsed.data.role })
    .eq('project_id', id)
    .eq('user_id', parsed.data.userId)
    .select('*')
    .single()

  if (updateError) {
    logger.error({ updateError }, 'Failed to update project member')
    return fail('Failed to update project member', 500)
  }

  return ok(data)
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = projectMemberSchema.partial().safeParse({ ...payload, projectId: id })
  if (!parsed.success) return fail(parsed.error.message, 400)

  if (!parsed.data.userId) return fail('Missing userId', 400)

  const { error: deleteError } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', id)
    .eq('user_id', parsed.data.userId)

  if (deleteError) {
    logger.error({ deleteError }, 'Failed to remove project member')
    return fail('Failed to remove project member', 500)
  }

  return ok({ userId: parsed.data.userId })
}
