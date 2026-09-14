import type { CloudBoundary, CloudBoundaryFilter, SentimentLabel } from '../types'

export function formatPct(value: number, digits = 0): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

export function formatNet(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

export function formatShare(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function sentimentWord(score: number): SentimentLabel {
  if (score >= 0.15) return 'positive'
  if (score <= -0.15) return 'negative'
  return 'neutral'
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(iso))
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))
}

export function relativeFrom(iso: string, nowIso: string): string {
  const diffMs = new Date(nowIso).getTime() - new Date(iso).getTime()
  const hours = Math.round(diffMs / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}


/** Display label for cloud boundary ids (and legacy usnat/ussec). */
export function formatCloudBoundary(
  boundary: CloudBoundary | CloudBoundaryFilter | string | undefined,
): string {
  const id = normalizeCloudId(boundary)
  switch (id) {
    case 'usgov':
      return 'USGov'
    case 'il7':
      return 'IL7'
    case 'il6':
      return 'IL6'
    case 'commercial':
      return 'Commercial'
    case 'all':
      return 'All clouds'
    default:
      return 'Commercial'
  }
}

/** Map legacy usnat→il7, ussec→il6; pass through known ids. */
export function normalizeCloudId(
  id: string | undefined | null,
): CloudBoundary | CloudBoundaryFilter | 'unknown' | string {
  if (!id) return 'unknown'
  if (id === 'usnat') return 'il7'
  if (id === 'ussec') return 'il6'
  return id
}

export function normalizeCloudFilter(id: string | undefined | null): CloudBoundaryFilter {
  const mapped = normalizeCloudId(id)
  if (
    mapped === 'all' ||
    mapped === 'commercial' ||
    mapped === 'usgov' ||
    mapped === 'il7' ||
    mapped === 'il6'
  ) {
    return mapped
  }
  return 'all'
}
