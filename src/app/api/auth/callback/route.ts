import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { logger } from '@/lib/logger'

interface CallbackPayload {
  code: string
  redirectTo?: string
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
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

  const payload = (await request.json()) as CallbackPayload
  if (!payload?.code) {
    return NextResponse.json({ data: null, error: 'Missing auth code' }, { status: 400 })
  }

  const { error } = await supabase.auth.exchangeCodeForSession(payload.code)

  if (error) {
    logger.error({ error }, 'Auth callback failed')
    return NextResponse.json({ data: null, error: 'Auth exchange failed' }, { status: 401 })
  }

  const redirectUrl = payload.redirectTo ?? process.env.NEXT_PUBLIC_APP_URL ?? '/'
  return NextResponse.json({ data: { redirectTo: redirectUrl }, error: null })
}
