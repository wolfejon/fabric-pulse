import { useMemo, useState } from 'react'
import {
  corpusProvenanceLabel,
  deskBanner,
  deskForCloud,
  deskLabel,
  isLivePublic,
  provenanceLabel,
  selectIntelligenceNews,
  trustLabel,
  whyStoryMatters,
  workloadLabelsFor,
} from '../../lib/intelligence'
import { formatDay } from '../../lib/format'
import type {
  CloudBoundaryFilter,
  NewsIntelligenceItem,
  WorkloadFilter,
} from '../../types'

/**
 * Cloud-contextual News Desk (#1) + workload linker (#10).
 * USGov / IL7 / IL6 → Fed/Defense/Intel desk; Commercial / All → commercial desk.
 * Live-public RSS pack is preferred when present; synthetic demo pack remains.
 */
export function NewsDeskRail({
  cloud,
  workload,
  items,
  tone = 'light',
  compact = false,
}: {
  cloud: CloudBoundaryFilter
  workload: WorkloadFilter
  items?: NewsIntelligenceItem[]
  tone?: 'light' | 'dark' | 'inherit'
  compact?: boolean
}) {
  const [expanded, setExpanded] = useState(!compact)
  const desk = deskForCloud(cloud)
  const stories = useMemo(
    () => selectIntelligenceNews(items, cloud, workload, compact ? 3 : 6),
    [items, cloud, workload, compact],
  )
  const banner = deskBanner(desk)
  const provenance = corpusProvenanceLabel(stories)

  const shell =
    tone === 'dark'
      ? 'border-white/15 bg-white/5 text-white'
      : tone === 'inherit'
        ? 'border-current/15 bg-current/5 text-current'
        : 'border-[#c8c2b4] bg-[#f7f2e8]/90 text-[#1a1a18]'

  const mute =
    tone === 'dark' ? 'text-white/55' : tone === 'inherit' ? 'text-current/55' : 'text-[#5c5a54]'
  const accent = tone === 'dark' ? 'text-[#5EE1E6]' : 'text-[#00A4A6]'

  return (
    <section
      aria-label={`${deskLabel(desk)} news desk`}
      className="mx-auto w-full max-w-6xl px-4 pb-3 sm:px-6"
      data-cloud-desk={desk}
    >
      <div className={`rounded-xl border ${shell} px-3 py-2.5 sm:px-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${accent}`}>
              News desk · {deskLabel(desk)}
            </p>
            <p className={`mt-0.5 text-[11px] ${mute}`}>
              {stories.length} stories
              {workload !== 'all' ? ' · workload-prioritized' : ''}
              {' · '}
              {provenance}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={`text-[11px] uppercase tracking-[0.14em] ${accent} hover:underline`}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {banner ? (
          <p
            className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-medium text-amber-900"
            role="status"
          >
            {banner}
          </p>
        ) : (
          <p className={`mt-2 text-[11px] ${mute}`}>
            Commercial industry / data-platform desk — gov mission news stays on USGov · IL7 · IL6.
          </p>
        )}

        {expanded ? (
          <ul className="mt-3 space-y-2">
            {stories.map((story) => {
              const why = whyStoryMatters(story, workload)
              const linked = workload !== 'all' && story.workloadIds.includes(workload)
              const live = isLivePublic(story)
              return (
                <li
                  key={story.id}
                  className="rounded-lg border border-current/10 bg-black/[0.02] px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em]">
                    <span className={accent}>{trustLabel(story.trustTier)}</span>
                    <span
                      className={
                        live
                          ? 'rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-800'
                          : 'rounded-full bg-black/5 px-2 py-0.5 text-current/60'
                      }
                    >
                      {provenanceLabel(story)}
                    </span>
                    <span className={mute}>{story.source}</span>
                    <span className={mute}>{formatDay(story.publishedAt)}</span>
                    {linked ? (
                      <span className="rounded-full bg-[#7A3FF2]/15 px-2 py-0.5 font-semibold text-[#5a2fb8]">
                        Linked workload
                      </span>
                    ) : null}
                  </div>
                  {story.url ? (
                    <a
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm font-medium leading-snug hover:underline"
                    >
                      {story.title}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-medium leading-snug">{story.title}</p>
                  )}
                  <p className={`mt-1 text-xs leading-relaxed ${mute}`}>{story.summary}</p>
                  <p className={`mt-1.5 text-[10px] uppercase tracking-[0.12em] ${mute}`}>
                    Workloads · {workloadLabelsFor(story)}
                  </p>
                  {why ? (
                    <p className="mt-1.5 inline-flex max-w-full rounded-full border border-[#00BCF2]/35 bg-[#00BCF2]/10 px-2.5 py-0.5 text-[11px] text-[#0a6e7a]">
                      Why it matters · {why}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
