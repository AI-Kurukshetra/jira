import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { projectSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { mapProjectRow } from '@/lib/api/mappers'

const TRASH_RETENTION_DAYS = 30
const DEFAULT_BOARD_COLUMNS = [
  { name: 'To Do', status: 'todo', position: 0 },
  { name: 'In Progress', status: 'inprogress', position: 1 },
  { name: 'Done', status: 'done', position: 2 }
] as const

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const key = searchParams.get('key')

  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  let query = supabase.from('projects').select('*').order('created_at', { ascending: false })
  if (status) {
    query = query.eq('status', status)
    if (status === 'deleted') {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - TRASH_RETENTION_DAYS)
      query = query.gte('deleted_at', cutoff.toISOString())
    }
  }
  if (key) query = query.eq('key', key)
  const { data, error: fetchError } = await query

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch projects')
    return fail('Failed to fetch projects', 500)
  }

  const mapped = (data ?? []).map((project) => mapProjectRow(project))
  return ok(mapped)
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

  const { error: columnsError } = await supabase.from('board_columns').insert(
    DEFAULT_BOARD_COLUMNS.map((column) => ({
      project_id: project.id,
      name: column.name,
      status: column.status,
      position: column.position,
      is_default: true
    }))
  )

  if (columnsError) {
    logger.error({ columnsError }, 'Failed to initialize board columns')
  }

  return ok(mapProjectRow(project), 201)
}
