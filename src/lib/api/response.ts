import { NextResponse } from 'next/server'

export function ok<T>(data: T, init?: number | ResponseInit) {
  if (typeof init === 'number') {
    return NextResponse.json({ data, error: null }, { status: init })
  }
  return NextResponse.json({ data, error: null }, init)
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ data: null, error: message }, { status })
}
