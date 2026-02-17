import type { Result } from '@/lib/types'

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

export async function apiGet<T>(path: string): Promise<Result<T>> {
  const response = await fetch(path, { method: 'GET', headers: JSON_HEADERS })
  const payload = (await response.json()) as { data: T | null; error: string | null }
  if (!response.ok || payload.error) {
    return { success: false, error: payload.error ?? 'Request failed' }
  }
  return { success: true, data: payload.data as T }
}

export async function apiPost<T, B>(path: string, body: B): Promise<Result<T>> {
  const response = await fetch(path, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  })
  const payload = (await response.json()) as { data: T | null; error: string | null }
  if (!response.ok || payload.error) {
    return { success: false, error: payload.error ?? 'Request failed' }
  }
  return { success: true, data: payload.data as T }
}

export async function apiPatch<T, B>(path: string, body: B): Promise<Result<T>> {
  const response = await fetch(path, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  })
  const payload = (await response.json()) as { data: T | null; error: string | null }
  if (!response.ok || payload.error) {
    return { success: false, error: payload.error ?? 'Request failed' }
  }
  return { success: true, data: payload.data as T }
}

export async function apiDelete<T, B>(path: string, body?: B): Promise<Result<T>> {
  const response = await fetch(path, {
    method: 'DELETE',
    headers: JSON_HEADERS,
    body: body ? JSON.stringify(body) : null
  })
  const payload = (await response.json()) as { data: T | null; error: string | null }
  if (!response.ok || payload.error) {
    return { success: false, error: payload.error ?? 'Request failed' }
  }
  return { success: true, data: payload.data as T }
}
