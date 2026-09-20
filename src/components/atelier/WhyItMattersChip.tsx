import { useMemo } from 'react'
import { selectIntelligenceNews, whyStoryMatters } from '../../lib/intelligence'
import type {
  CloudBoundaryFilter,
  NewsIntelligenceItem,
  WorkloadFilter,
} from '../../types'

/** Compact “why this story matters for {workload}” chip (#10). */
export function WhyItMattersChip({
  cloud,
  workload,
  items,
  className = '',
}: {
  cloud: CloudBoundaryFilter
  workload: WorkloadFilter
  items?: NewsIntelligenceItem[]
  className?: string
}) {
  const top = useMemo(() => {
    if (workload === 'all') return null
    const list = selectIntelligenceNews(items, cloud, workload, 1)
    const story = list[0]
    if (!story) return null
    const why = whyStoryMatters(story, workload)
    if (!why) return null
    return { story, why }
  }, [items, cloud, workload])

  if (!top) return null

  return (
    <div
      className={`rounded-full border border-[#00BCF2]/30 bg-[#00BCF2]/08 px-3 py-1 text-[11px] leading-snug text-[#0a6e7a] ${className}`}
      title={top.story.title}
    >
      <span className="font-semibold uppercase tracking-[0.12em]">Intel · </span>
      {top.why}
    </div>
  )
}
