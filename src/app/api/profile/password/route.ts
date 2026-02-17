import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/api/auth'
import { ok, fail } from '@/lib/api/response'
import { changePasswordSchema } from '@/lib/validations/schemas'
import { logger } from '@/lib/logger'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { user, error } = await requireUser(supabase)
  if (error || !user) return fail('Unauthorized', 401)

  const payload = await request.json()
  const parsed = changePasswordSchema.safeParse(payload)
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Invalid payload', 400)

  const email = user.email
  if (!email) return fail('Unable to verify user email', 400)

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.currentPassword
  })
  if (signInError) {
    return fail('Current password is incorrect', 400)
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: parsed.data.newPassword })
  if (updateError) {
    logger.error({ updateError }, 'Failed to update password')
    return fail('Failed to update password', 500)
  }

  return ok({ updated: true })
}
