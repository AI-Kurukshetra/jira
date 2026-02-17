import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { updateProfileSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'
import { mapProfileRow } from '@/lib/api/mappers'

export async function GET() {
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const { data, error: fetchError } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (fetchError) {
    logger.error({ fetchError }, 'Failed to fetch profile')
    return fail('Failed to fetch profile', 500)
  }

  return ok(mapProfileRow(data))
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = updateProfileSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 400)

  const { data, error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      display_name: parsed.data.displayName,
      avatar_url: parsed.data.avatarUrl,
      timezone: parsed.data.timezone,
      notification_prefs: parsed.data.notifications ?? undefined
    })
    .eq('id', user.id)
    .select('*')
    .single()

  if (updateError) {
    logger.error({ updateError }, 'Failed to update profile')
    return fail(updateError.message ?? 'Failed to update profile', 500)
  }

  return ok(mapProfileRow(data))
}
