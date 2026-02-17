import clsx, { type ClassValue } from 'clsx'
import { formatDistanceToNowStrict } from 'date-fns'

import type { IssueStatus } from '@/lib/types'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const DEFAULT_RELATIVE_UNITS: Intl.RelativeTimeFormatUnit[] = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year']

const STATUS_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  todo: ['inprogress'],
  inprogress: ['todo', 'done'],
  done: ['inprogress']
}

const COLOR_HASH_SEED = 5381
const COLOR_HASH_SHIFT = 5
const COLOR_SATURATION = 62
const COLOR_LIGHTNESS = 52

const INITIALS_MAX = 2
const NAME_SPLIT_REGEX = /\s+/u

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatRelativeTime(date: Date | string) {
  const target = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNowStrict(target, { addSuffix: true })
}

export function isValidTransition(from: IssueStatus, to: IssueStatus) {
  return STATUS_TRANSITIONS[from].includes(to)
}

export function getInitials(name: string) {
  const parts = name.trim().split(NAME_SPLIT_REGEX).filter(Boolean)
  if (parts.length === 0) return ''
  const initials = parts
    .slice(0, INITIALS_MAX)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  return initials
}

export function hashColor(input: string) {
  let hash = COLOR_HASH_SEED
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << COLOR_HASH_SHIFT) + hash + input.charCodeAt(i)
  }
  const hue = Math.abs(hash) % 360
  return hslToHex(hue, COLOR_SATURATION, COLOR_LIGHTNESS)
}

function hslToHex(h: number, s: number, l: number) {
  const saturation = s / 100
  const lightness = l / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lightness - chroma / 2

  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = chroma
    g = x
  } else if (h >= 60 && h < 120) {
    r = x
    g = chroma
  } else if (h >= 120 && h < 180) {
    g = chroma
    b = x
  } else if (h >= 180 && h < 240) {
    g = x
    b = chroma
  } else if (h >= 240 && h < 300) {
    r = x
    b = chroma
  } else {
    r = chroma
    b = x
  }

  const toHex = (value: number) => {
    const channel = Math.round((value + m) * 255)
    return channel.toString(16).padStart(2, '0')
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function getRelativeUnitFromMs(ms: number) {
  const abs = Math.abs(ms)
  if (abs < HOUR_MS) return DEFAULT_RELATIVE_UNITS[0]
  if (abs < DAY_MS) return DEFAULT_RELATIVE_UNITS[2]
  return DEFAULT_RELATIVE_UNITS[3]
}

export function sanitizeFileName(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return 'file'
  const sanitized = trimmed
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/-+/g, '-')
  return sanitized || 'file'
}
