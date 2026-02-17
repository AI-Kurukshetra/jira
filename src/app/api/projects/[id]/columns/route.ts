import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { logger } from '@/lib/logger'

interface Params {
  params: Promise<{ id: string }>
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  status: z.enum(['todo', 'inprogress', 'done']),
  position: z.number().int().nonnegative().optional()
})

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['todo', 'inprogress', 'done']).optional(),
  position: z.number().int().nonnegative().optional()
})

const deleteSchema = z.object({
  id: z.string().uuid()
})

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data, error: fetchError } = await supabase
    .from('board_columns')
    .select('*')
    .eq('project_id', id)
    .order('position', { ascending: true })

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch columns')
    return fail('Failed to fetch columns', 500)
  }

  const mapped = (data ?? []).map((column) => ({
    id: column.id,
    projectId: column.project_id,
    name: column.name,
    status: column.status,
    position: column.position,
    isDefault: column.is_default,
    createdAt: column.created_at,
    updatedAt: column.updated_at
  }))

  return ok(mapped)
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = createSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data, error: insertError } = await supabase
    .from('board_columns')
    .insert({
      project_id: id,
      name: parsed.data.name,
      status: parsed.data.status,
      position: parsed.data.position ?? 0,
      is_default: false
    })
    .select('*')
    .single()

  if (insertError || !data) {
    logger.error({ insertError }, 'Failed to create column')
    return fail('Failed to create column', 500)
  }

  return ok(data, 201)
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = updateSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data, error: updateError } = await supabase
    .from('board_columns')
    .update({
      name: parsed.data.name,
      status: parsed.data.status,
      position: parsed.data.position
    })
    .eq('id', parsed.data.id)
    .eq('project_id', id)
    .select('*')
    .single()

  if (updateError || !data) {
    logger.error({ updateError }, 'Failed to update column')
    return fail('Failed to update column', 500)
  }

  return ok(data)
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = deleteSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.message, 400)

  const { data: column, error: columnError } = await supabase
    .from('board_columns')
    .select('id, status')
    .eq('id', parsed.data.id)
    .eq('project_id', id)
    .single()

  if (columnError || !column) {
    return fail('Column not found', 404)
  }

  const { data: fallback } = await supabase
    .from('board_columns')
    .select('id')
    .eq('project_id', id)
    .eq('status', column.status)
    .neq('id', parsed.data.id)
    .order('position', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!fallback) {
    return fail('Cannot delete last column in a status group', 400)
  }

  const { error: moveError } = await supabase
    .from('issues')
    .update({ column_id: fallback.id })
    .eq('column_id', parsed.data.id)

  if (moveError) {
    logger.error({ moveError }, 'Failed to move issues from column')
    return fail('Failed to move issues from column', 500)
  }

  const { error: deleteError } = await supabase
    .from('board_columns')
    .delete()
    .eq('id', parsed.data.id)
    .eq('project_id', id)

  if (deleteError) {
    logger.error({ deleteError }, 'Failed to delete column')
    return fail('Failed to delete column', 500)
  }

  return ok({ id: parsed.data.id })
}
