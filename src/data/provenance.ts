import type { Mention, NewsItem, SourceRegistryEntry } from '../types'
import { DEMO_SOURCE_REGISTRY } from './sources'

/**
 * Deterministic hash for stable source assignment across reloads.
 */
function hashId(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Weighted demo mix — MVP sources dominate; deferred sources get a thin slice. */
const SOURCE_BUCKETS: { id: string; weight: number }[] = [
  { id: 'reddit-microsoft-fabric', weight: 38 },
  { id: 'github-fabric-cicd-issues', weight: 28 },
  { id: 'rss-fabric-updates', weight: 22 },
  { id: 'x-api-fabric', weight: 6 },
  { id: 'stackexchange-fabric', weight: 4 },
  { id: 'gdelt-fabric-news', weight: 2 },
]

function pickSourceId(mentionId: string): string {
  const total = SOURCE_BUCKETS.reduce((s, b) => s + b.weight, 0)
  let r = hashId(mentionId) % total
  for (const bucket of SOURCE_BUCKETS) {
    r -= bucket.weight
    if (r < 0) return bucket.id
  }
  return SOURCE_BUCKETS[0]!.id
}

function syntheticPermalink(sourceId: string, externalId: string): string {
  switch (sourceId) {
    case 'reddit-microsoft-fabric':
      return `https://www.reddit.com/r/MicrosoftFabric/comments/${externalId}/`
    case 'github-fabric-cicd-issues':
      return `https://github.com/microsoft/fabric-cicd/issues/${externalId}`
    case 'rss-fabric-updates':
      return `https://blog.fabric.microsoft.com/en-us/blog/#comment-${externalId}`
    case 'x-api-fabric':
      return `https://x.com/i/web/status/${externalId}`
    case 'stackexchange-fabric':
      return `https://stackoverflow.com/q/${externalId}`
    case 'gdelt-fabric-news':
      return `https://api.gdeltproject.org/api/v2/doc/doc?query=fabric&id=${externalId}`
    default:
      return `https://example.invalid/pulse/${sourceId}/${externalId}`
  }
}

function externalIdFor(sourceId: string, mentionId: string): string {
  const n = (hashId(mentionId) % 900000) + 100000
  if (sourceId === 'github-fabric-cicd-issues') return String((hashId(mentionId) % 4000) + 120)
  if (sourceId === 'reddit-microsoft-fabric') {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let s = ''
    let x = hashId(mentionId)
    for (let i = 0; i < 7; i++) {
      s += alphabet[x % alphabet.length]
      x = Math.imul(x, 1664525) + 1013904223
    }
    return s
  }
  return String(n)
}

/** Enrich corpus mentions with source registry provenance (synthetic permalinks). */
export function enrichMentionsWithProvenance(mentions: Mention[]): Mention[] {
  return mentions.map((m) => {
    if (m.sourceEntryId && m.permalink) return m
    const sourceEntryId = m.sourceEntryId ?? pickSourceId(m.id)
    const externalId = m.externalId ?? externalIdFor(sourceEntryId, m.id)
    const permalink = m.permalink ?? syntheticPermalink(sourceEntryId, externalId)
    return { ...m, sourceEntryId, externalId, permalink }
  })
}

export function enrichNewsWithProvenance(news: NewsItem[]): NewsItem[] {
  return news.map((item) => {
    if (item.sourceEntryId) return item
    // Official blog → RSS; press → GDELT; community → Reddit-ish
    const sourceEntryId =
      item.sourceType === 'official'
        ? 'rss-fabric-updates'
        : item.sourceType === 'press'
          ? 'gdelt-fabric-news'
          : 'reddit-microsoft-fabric'
    return { ...item, sourceEntryId }
  })
}

export function registryWithLastRefresh(
  registry: SourceRegistryEntry[] = DEMO_SOURCE_REGISTRY,
): SourceRegistryEntry[] {
  return registry.map((e) => ({ ...e }))
}
