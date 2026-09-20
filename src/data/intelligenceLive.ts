import type { NewsIntelligenceItem } from '../types'
import { DEMO_INTELLIGENCE_NEWS } from './intelligence'
import livePack from './generated/intelligence-live.json'

interface LivePack {
  fetchedAt?: string
  disclaimer?: string
  counts?: { commercial: number; gov: number; total: number }
  feeds?: unknown[]
  items?: NewsIntelligenceItem[]
}

const pack = livePack as LivePack

/** Live-public items from last `npm run fetch:intelligence` (committed JSON). */
export const LIVE_INTELLIGENCE_NEWS: NewsIntelligenceItem[] = (pack.items ?? []).map((item) => ({
  ...item,
  trustTier: 'live-public',
  provenance: 'live-public',
}))

export const LIVE_INTEL_META = {
  fetchedAt: pack.fetchedAt ?? null,
  disclaimer: pack.disclaimer ?? null,
  counts: pack.counts ?? { commercial: 0, gov: 0, total: 0 },
} as const

/**
 * Prefer live-public headlines, then keep synthetic demo pack for desk continuity.
 * Desks stay separated by cloudDesk on each item — never mixed in selection.
 */
export function mergeIntelligenceCorpus(
  live: NewsIntelligenceItem[] = LIVE_INTELLIGENCE_NEWS,
  demo: NewsIntelligenceItem[] = DEMO_INTELLIGENCE_NEWS,
): NewsIntelligenceItem[] {
  const seen = new Set<string>()
  const out: NewsIntelligenceItem[] = []

  const push = (item: NewsIntelligenceItem) => {
    const key = (item.url ?? item.id).split('#')[0]!.replace(/\/$/, '').toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    out.push(item)
  }

  // Live first so UI ranking prefers real headlines when dates tie-break later.
  for (const item of live) push(item)
  for (const item of demo) push(item)
  return out
}

export const MERGED_INTELLIGENCE_NEWS = mergeIntelligenceCorpus()
