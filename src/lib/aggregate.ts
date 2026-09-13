import { WORKLOAD_CATALOG } from '../data/catalog'
import type {
  CloudBoundary,
  CloudBoundaryFilter,
  DailyPoint,
  Mention,
  PulseKpis,
  ThemeDefinition,
  ThemeInsight,
  ThemePolarity,
  ThemeSignalMapping,
  WorkItem,
  WorkloadFilter,
  WorkloadId,
  WorkloadStat,
} from '../types'
import { WORKLOAD_IDS } from '../types'
import { classifyVolume, uniqueAuthorsFrom } from './evidence'

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function trendPct(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / previous) * 100
}

function midpoint(mentions: Mention[]): string | null {
  if (mentions.length === 0) return null
  const times = mentions.map((mention) => new Date(mention.createdAt).getTime()).sort((a, b) => a - b)
  const start = times[0]
  const end = times[times.length - 1]
  if (start === undefined || end === undefined) return null
  return new Date(start + (end - start) / 2).toISOString()
}

/** Effective cloud for filtering: omit / unknown ≈ commercial for the commercial pill. */
export function effectiveCloud(mention: Mention): CloudBoundary {
  return mention.cloudBoundary ?? 'commercial'
}

export function matchesCloudFilter(
  cloud: CloudBoundary | undefined,
  filter: CloudBoundaryFilter,
): boolean {
  if (filter === 'all') return true
  const effective = cloud ?? 'commercial'
  if (filter === 'commercial') {
    return effective === 'commercial' || effective === 'unknown'
  }
  return effective === filter
}

export function filterMentions(
  mentions: Mention[],
  workload: WorkloadFilter,
  theme: ThemeInsight | null,
  cloud: CloudBoundaryFilter = 'all',
  enabledSourceIds?: Set<string> | null,
): Mention[] {
  return mentions.filter((mention) => {
    if (workload !== 'all' && mention.workload !== workload) return false
    if (!matchesCloudFilter(mention.cloudBoundary, cloud)) return false
    if (theme && !theme.mentionIds.includes(mention.id)) return false
    if (enabledSourceIds && mention.sourceEntryId && !enabledSourceIds.has(mention.sourceEntryId)) {
      return false
    }
    return true
  })
}

export function filterByEnabledSources<T extends { sourceEntryId?: string }>(
  items: T[],
  enabledSourceIds: Set<string> | null | undefined,
): T[] {
  if (!enabledSourceIds) return items
  return items.filter((item) => {
    if (!item.sourceEntryId) return true
    return enabledSourceIds.has(item.sourceEntryId)
  })
}

function derivePolarity(
  definition: ThemeDefinition,
  matched: Mention[],
): ThemePolarity {
  if (definition.polarity) return definition.polarity
  const score = mean(matched.map((m) => m.sentimentScore))
  if (score >= 0.25) return 'want'
  if (score <= -0.25) return 'dont-like'
  return 'mixed'
}

function dominantCloud(matched: Mention[]): CloudBoundary | undefined {
  if (matched.length === 0) return undefined
  const counts = new Map<CloudBoundary, number>()
  for (const mention of matched) {
    const key = effectiveCloud(mention)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  let best: CloudBoundary | undefined
  let bestCount = 0
  for (const [key, count] of counts) {
    if (count > bestCount) {
      best = key
      bestCount = count
    }
  }
  return best
}

export function clusterThemes(mentions: Mention[], definitions: ThemeDefinition[]): ThemeInsight[] {
  const mid = midpoint(mentions)

  return definitions
    .map((definition) => {
      const keywords = definition.keywords.map((keyword) => keyword.toLowerCase())
      const matched = mentions.filter((mention) => {
        const haystack = mention.text.toLowerCase()
        return keywords.some((keyword) => haystack.includes(keyword))
      })

      const late = mid
        ? matched.filter((mention) => mention.createdAt >= mid)
        : matched
      const early = mid
        ? matched.filter((mention) => mention.createdAt < mid)
        : []

      const workloads = [...new Set(matched.map((mention) => mention.workload))]
      const uniqueAuthorCount = uniqueAuthorsFrom(matched)

      return {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        keywords: definition.keywords,
        mentionIds: matched.map((mention) => mention.id),
        mentionCount: matched.length,
        uniqueAuthorCount,
        volumeClass: classifyVolume(uniqueAuthorCount, matched.length),
        sentimentScore: mean(matched.map((mention) => mention.sentimentScore)),
        trend: trendPct(late.length, early.length),
        workloads,
        polarity: derivePolarity(definition, matched),
        cloudBoundary: definition.cloudBoundary ?? dominantCloud(matched),
      }
    })
    .filter((theme) => theme.mentionCount > 0)
    .sort((a, b) => b.mentionCount - a.mentionCount || b.trend - a.trend)
}

export function buildDaily(mentions: Mention[]): DailyPoint[] {
  const byDay = new Map<string, Mention[]>()
  for (const mention of mentions) {
    const day = mention.createdAt.slice(0, 10)
    const bucket = byDay.get(day) ?? []
    bucket.push(mention)
    byDay.set(day, bucket)
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayMentions]) => {
      const positive = dayMentions.filter((mention) => mention.sentiment === 'positive').length
      const neutral = dayMentions.filter((mention) => mention.sentiment === 'neutral').length
      const negative = dayMentions.filter((mention) => mention.sentiment === 'negative').length
      return {
        date,
        label: new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        }).format(new Date(`${date}T12:00:00Z`)),
        volume: dayMentions.length,
        positive,
        neutral,
        negative,
        net: mean(dayMentions.map((mention) => mention.sentimentScore)),
      }
    })
}

export function buildWorkloadStats(mentions: Mention[]): WorkloadStat[] {
  const mid = midpoint(mentions)

  return WORKLOAD_IDS.map((id: WorkloadId) => {
    const items = mentions.filter((mention) => mention.workload === id)
    const late = mid ? items.filter((mention) => mention.createdAt >= mid) : items
    const early = mid ? items.filter((mention) => mention.createdAt < mid) : []
    const meta = WORKLOAD_CATALOG[id]
    return {
      id,
      label: meta.label,
      shortLabel: meta.shortLabel,
      blurb: meta.blurb,
      volume: items.length,
      positive: items.filter((mention) => mention.sentiment === 'positive').length,
      neutral: items.filter((mention) => mention.sentiment === 'neutral').length,
      negative: items.filter((mention) => mention.sentiment === 'negative').length,
      netSentiment: mean(items.map((mention) => mention.sentimentScore)),
      trend: trendPct(late.length, early.length),
    }
  }).sort((a, b) => b.volume - a.volume)
}

export function buildKpis(mentions: Mention[], themes: ThemeInsight[]): PulseKpis {
  const volume = mentions.length
  const mid = midpoint(mentions)
  const late = mid ? mentions.filter((mention) => mention.createdAt >= mid) : mentions
  const early = mid ? mentions.filter((mention) => mention.createdAt < mid) : []
  const positive = mentions.filter((mention) => mention.sentiment === 'positive').length
  const neutral = mentions.filter((mention) => mention.sentiment === 'neutral').length
  const negative = mentions.filter((mention) => mention.sentiment === 'negative').length
  const rising = [...themes].sort((a, b) => b.trend - a.trend)[0]

  return {
    volume,
    volumeTrend: trendPct(late.length, early.length),
    positiveShare: volume === 0 ? 0 : positive / volume,
    neutralShare: volume === 0 ? 0 : neutral / volume,
    negativeShare: volume === 0 ? 0 : negative / volume,
    netSentiment: mean(mentions.map((mention) => mention.sentimentScore)),
    netSentimentTrend:
      mean(late.map((mention) => mention.sentimentScore)) -
      mean(early.map((mention) => mention.sentimentScore)),
    topRisingTheme: rising?.name ?? null,
    topRisingThemeTrend: rising?.trend ?? 0,
  }
}

export function viewFromMentions(
  mentions: Mention[],
  themeDefinitions: ThemeDefinition[],
): {
  themes: ThemeInsight[]
  daily: DailyPoint[]
  workloads: WorkloadStat[]
  kpis: PulseKpis
} {
  const themes = clusterThemes(mentions, themeDefinitions)
  return {
    themes,
    daily: buildDaily(mentions),
    workloads: buildWorkloadStats(mentions),
    kpis: buildKpis(mentions, themes),
  }
}

/** Resolve theme → mapping for a cloud/workload slice (Coverage mode). */
export function resolveThemeMapping(
  themeId: string,
  mappings: ThemeSignalMapping[],
  cloud: CloudBoundaryFilter,
  workload: WorkloadFilter,
): ThemeSignalMapping | null {
  const candidates = mappings.filter((m) => m.themeId === themeId)
  if (candidates.length === 0) return null

  const cloudMatched = candidates.filter((m) => {
    if (cloud === 'all') return true
    if (!m.cloudBoundary) return cloud === 'commercial'
    return matchesCloudFilter(m.cloudBoundary, cloud)
  })

  const pool = cloudMatched.length > 0 ? cloudMatched : candidates

  const workloadMatched =
    workload === 'all'
      ? pool
      : pool.filter((m) => !m.workload || m.workload === workload)

  const finalPool = workloadMatched.length > 0 ? workloadMatched : pool
  // Prefer exact cloud match, then gap/partial/covered order by specificity
  const exact = finalPool.find((m) => m.cloudBoundary === cloud)
  return exact ?? finalPool[0] ?? null
}

export function workItemsForMapping(
  mapping: ThemeSignalMapping | null,
  workItems: WorkItem[],
): WorkItem[] {
  if (!mapping?.workItemIds?.length) return []
  const ids = new Set(mapping.workItemIds)
  return workItems.filter((wi) => ids.has(wi.id))
}
