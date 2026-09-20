import { WORKLOAD_CATALOG } from '../data/catalog'
import { DEMO_INTELLIGENCE_NEWS } from '../data/intelligence'
import { MERGED_INTELLIGENCE_NEWS } from '../data/intelligenceLive'
import type {
  CloudBoundaryFilter,
  CloudDesk,
  NewsIntelligenceItem,
  WorkloadFilter,
  WorkloadId,
} from '../types'

/** Gov mission clouds — never mix with commercial desk. */
export function isGovCloudFilter(cloud: CloudBoundaryFilter): boolean {
  return cloud === 'usgov' || cloud === 'il7' || cloud === 'il6'
}

/** Resolve active desk from cloud pill. all / commercial → commercial. */
export function deskForCloud(cloud: CloudBoundaryFilter): CloudDesk {
  return isGovCloudFilter(cloud) ? 'gov' : 'commercial'
}

export function deskLabel(desk: CloudDesk): string {
  return desk === 'gov' ? 'Federal / Defense / Intel' : 'Commercial industry'
}

export function deskBanner(desk: CloudDesk): string | null {
  if (desk === 'gov') {
    return 'UNCLASSIFIED — public news & advisories only. Not operational or classified intel. Live public feed ≠ mission traffic.'
  }
  return null
}

export function isLivePublic(item: NewsIntelligenceItem): boolean {
  return item.trustTier === 'live-public' || item.provenance === 'live-public'
}

export function intelligenceCorpus(
  items?: NewsIntelligenceItem[] | null,
): NewsIntelligenceItem[] {
  if (items?.length) return items
  return MERGED_INTELLIGENCE_NEWS.length ? MERGED_INTELLIGENCE_NEWS : DEMO_INTELLIGENCE_NEWS
}

function liveRank(item: NewsIntelligenceItem): number {
  return isLivePublic(item) ? 1 : 0
}

/**
 * Filter by cloud desk (strict), prefer live-public, then prioritize workload-linked items (#10).
 * Never returns the opposite desk.
 */
export function selectIntelligenceNews(
  items: NewsIntelligenceItem[] | undefined | null,
  cloud: CloudBoundaryFilter,
  workload: WorkloadFilter = 'all',
  limit = 12,
): NewsIntelligenceItem[] {
  const desk = deskForCloud(cloud)
  const corpus = intelligenceCorpus(items).filter((item) => item.cloudDesk === desk)

  const ranked = [...corpus].sort((a, b) => {
    const liveDiff = liveRank(b) - liveRank(a)
    if (liveDiff !== 0) return liveDiff
    const aLinked = workload !== 'all' && a.workloadIds.includes(workload)
    const bLinked = workload !== 'all' && b.workloadIds.includes(workload)
    if (aLinked !== bLinked) return aLinked ? -1 : 1
    return b.publishedAt.localeCompare(a.publishedAt)
  })

  return ranked.slice(0, limit)
}

export function corpusProvenanceLabel(items: NewsIntelligenceItem[]): string {
  const live = items.filter(isLivePublic).length
  const demo = items.length - live
  if (live > 0 && demo > 0) return `Live public feed · ${live} · demo ${demo}`
  if (live > 0) return `Live public feed · ${live}`
  return 'Demo corpus only'
}

export function whyStoryMatters(
  item: NewsIntelligenceItem,
  workload: WorkloadFilter,
): string | null {
  if (workload === 'all') return null
  const custom = item.whyItMatters?.[workload]
  if (custom) return custom
  if (!item.workloadIds.includes(workload)) return null
  const label = WORKLOAD_CATALOG[workload]?.shortLabel ?? workload
  return `Tagged to ${label} on the ${item.cloudDesk === 'gov' ? 'gov' : 'commercial'} desk.`
}

export function workloadLabelsFor(item: NewsIntelligenceItem): string {
  return item.workloadIds
    .map((id) => WORKLOAD_CATALOG[id as WorkloadId]?.shortLabel ?? id)
    .join(' · ')
}

export function trustLabel(tier: NewsIntelligenceItem['trustTier']): string {
  switch (tier) {
    case 'official':
      return 'Official'
    case 'trade-press':
      return 'Trade press'
    case 'community':
      return 'Community'
    case 'live-public':
      return 'Live public'
    default:
      return 'Synthetic'
  }
}

export function provenanceLabel(item: NewsIntelligenceItem): string {
  return isLivePublic(item) ? 'Live public feed' : 'Demo'
}
