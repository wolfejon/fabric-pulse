import { ArrowLeft, ExternalLink } from 'lucide-react'
import { motion } from 'motion/react'
import { WORKLOAD_CATALOG } from '../../../data/catalog'
import {
  corpusProvenanceLabel,
  deskBanner,
  deskLabel,
  isLivePublic,
  provenanceLabel,
  trustLabel,
  whyStoryMatters,
  workloadLabelsFor,
} from '../../../lib/intelligence'
import { formatDay } from '../../../lib/format'
import type {
  CloudDesk,
  NewsIntelligenceItem,
  WorkloadFilter,
} from '../../../types'

/**
 * Chronicle B-section / Intelligence back page (#6).
 * Folio + INTELLIGENCE section flag; content from active cloud desk (#1).
 * Live public feed preferred; demo pack retained with clear provenance.
 */
export function IntelligenceBackPage({
  desk,
  stories,
  workload,
  folioDate,
  paperName = 'The Fabric Chronicle',
  onBack,
  onOpenCompetitor,
}: {
  desk: CloudDesk
  stories: NewsIntelligenceItem[]
  workload: WorkloadFilter
  folioDate: string
  paperName?: string
  onBack: () => void
  onOpenCompetitor?: (pageId: string) => void
}) {
  const banner = deskBanner(desk)
  const workloadNote =
    workload === 'all' ? 'All Fabric' : (WORKLOAD_CATALOG[workload]?.shortLabel ?? workload)
  const provenance = corpusProvenanceLabel(stories)

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-3xl px-1 py-4"
    >
      <div className="flex items-center justify-between gap-3 border-t border-[#1a1a18]/70 px-1 py-2 text-[10px] uppercase tracking-[0.16em] text-[#5c5a54]">
        <span>{paperName}</span>
        <span>{folioDate}</span>
        <span>Page B2</span>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[#5c5a54] transition hover:text-[#00A4A6]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to A1
      </button>

      <header className="mt-6 border-b-2 border-[#1a1a18] pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7A3FF2]">
          Chronicle · Section B · Intelligence · {workloadNote}
        </p>
        <h2 className="font-display mt-3 text-[clamp(1.75rem,4vw,2.6rem)] font-semibold leading-[1.15] tracking-tight text-[#141412]">
          {deskLabel(desk)} desk
        </h2>
        <p className="mt-4 font-serif text-[15px] leading-relaxed text-[#4a4842]">
          Market, policy, and industry intelligence for the active cloud slice. Competitor posture
          stays on B1 — jump below when a story cites a rival page.
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#00A4A6]">{provenance}</p>
        {banner ? (
          <p
            className="mt-4 rounded-sm border border-amber-700/35 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-950"
            role="status"
          >
            {banner}
          </p>
        ) : (
          <p className="mt-4 text-[12px] text-[#5c5a54]">
            Commercial desk — federal / defense / intel items are excluded while this cloud filter is
            active.
          </p>
        )}
      </header>

      <div className="mt-8 space-y-6">
        {stories.length === 0 ? (
          <p className="font-serif text-sm italic text-[#9a968c]">
            Quiet desk — no intelligence items for this cloud / workload slice.
          </p>
        ) : (
          stories.map((story, i) => {
            const why = whyStoryMatters(story, workload)
            const live = isLivePublic(story)
            return (
              <article key={story.id} className="border-b border-[#c8c2b4] pb-6 last:border-b-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00A4A6]">
                  {trustLabel(story.trustTier)} · {provenanceLabel(story)} · {story.source} ·{' '}
                  {formatDay(story.publishedAt)}
                  <span className="ml-2 text-[#9a968c]">B2 / {i + 1}</span>
                </p>
                <h3 className="font-display mt-2 text-xl font-semibold leading-snug text-[#141412]">
                  {story.url ? (
                    <a
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1.5 hover:underline"
                    >
                      <span>{story.title}</span>
                      <ExternalLink
                        size={14}
                        className="mt-1.5 shrink-0 text-[#7a7870]"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    story.title
                  )}
                </h3>
                <p className="mt-3 font-serif text-[15px] leading-relaxed text-[#4a4842]">
                  {story.summary}
                </p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-[#7a7870]">
                  Workloads · {workloadLabelsFor(story)}
                  {live ? ' · Live public feed' : ' · Demo pack'}
                </p>
                {why ? (
                  <p className="mt-2 text-[12px] text-[#0a6e7a]">
                    Why it matters for {workloadNote}: {why}
                  </p>
                ) : null}
                {story.relatedCompetitorPageId && onOpenCompetitor ? (
                  <button
                    type="button"
                    onClick={() => onOpenCompetitor(story.relatedCompetitorPageId!)}
                    className="mt-3 font-serif text-[13px] italic text-[#7A3FF2] underline-offset-4 hover:underline"
                  >
                    See also · Competitors B1 →
                  </button>
                ) : null}
              </article>
            )
          })
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-3 border-t border-[#1a1a18]/70 px-1 py-2 text-[10px] uppercase tracking-[0.16em] text-[#5c5a54]">
        <span>{paperName}</span>
        <span>{folioDate}</span>
        <span>Page B2</span>
      </div>
      <p className="mt-4 text-center font-serif text-[11px] italic text-[#9a968c]">
        Intelligence section · live public RSS/API pack + synthetic demo · not operational intel
      </p>
    </motion.div>
  )
}
