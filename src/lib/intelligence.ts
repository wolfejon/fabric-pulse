import { WORKLOAD_CATALOG } from '../data/catalog'
import { DEMO_INTELLIGENCE_NEWS } from '../data/intelligence'
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
    return 'UNCLASSIFIED / DEMO — synthetic mission-cloud digest. Not operational intel.'
  }
  return null
}

export function intelligenceCorpus(
  items?: NewsIntelligenceItem[] | null,
): NewsIntelligenceItem[] {
  return items?.length ? items : DEMO_INTELLIGENCE_NEWS
}

/**
 * Filter by cloud desk (strict), then prioritize workload-linked items (#10).
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
    const aLinked = workload !== 'all' && a.workloadIds.includes(workload)
    const bLinked = workload !== 'all' && b.workloadIds.includes(workload)
    if (aLinked !== bLinked) return aLinked ? -1 : 1
    return b.publishedAt.localeCompare(a.publishedAt)
  })

  return ranked.slice(0, limit)
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
    default:
      return 'Synthetic'
  }
}
