import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) return fail('Missing projectId', 400)

  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data, error: fetchError } = await supabase
    .from('labels')
    .select('id, name, color_hex')
    .eq('project_id', projectId)
    .order('name', { ascending: true })

  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch labels')
    return fail('Failed to fetch labels', 500)
  }

  const mapped = (data ?? []).map((label) => ({
    id: label.id,
    name: label.name,
    colorHex: label.color_hex
  }))

  return ok(mapped)
}
