import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, CloudRain, CloudSun, Sun } from 'lucide-react'
import { EvidenceSheet } from '../../atelier/EvidenceSheet'
import {
  DEMO_COMPETITOR_FEATURES,
  DEMO_COMPETITOR_PAGES,
  defaultCompetitorPageForWorkload,
} from '../../../data/competitors'
import { ATELIER_WORKLOAD_ORDER, atelierWorkloadShort } from '../../../lib/atelier'
import {
  buildNewspaperEdition,
  sourcesLineText,
  type NewspaperEdition,
  type NewspaperStory,
} from '../../../lib/newspaper'
import type { Mention, WorkloadFilter } from '../../../types'
import type { LayoutProps } from '../types'
import { CompetitorBackPage } from './CompetitorBackPage'
import { IntelligenceBackPage } from './IntelligenceBackPage'
import {
  deskForCloud,
  selectIntelligenceNews,
} from '../../../lib/intelligence'

/* ── Shared print furniture ───────────────────────────────────── */

function SourcesLine({
  mentionCount,
  uniqueAuthors,
  onClick,
}: {
  mentionCount: number
  uniqueAuthors: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="newspaper-sources text-left text-[11px] leading-snug text-[#5c5a54] underline decoration-[#c8c2b4] underline-offset-4 transition hover:text-[#00A4A6] hover:decoration-[#00A4A6]"
      title="Open evidence sheet"
    >
      {sourcesLineText(mentionCount, uniqueAuthors)}
    </button>
  )
}

function FolioBar({
  paperName,
  date,
  page,
}: {
  paperName: string
  date: string
  page: string
}) {
  return (
    <div className="newspaper-folio flex items-center justify-between gap-3 border-t border-[#1a1a18]/70 px-1 py-2 text-[10px] uppercase tracking-[0.16em] text-[#5c5a54]">
      <span className="flex items-center gap-2">
        <span className="newspaper-weave-mark" aria-hidden="true" />
        {paperName}
      </span>
      <span>{date}</span>
      <span>Page {page}</span>
    </div>
  )
}

function WeatherIcon({ icon }: { icon: 'storm' | 'clear' | 'mixed' }) {
  if (icon === 'storm') return <CloudRain size={14} aria-hidden="true" />
  if (icon === 'clear') return <Sun size={14} aria-hidden="true" />
  return <CloudSun size={14} aria-hidden="true" />
}

function DropCapBody({
  paragraphs,
  opinion = false,
}: {
  paragraphs: string[]
  opinion?: boolean
}) {
  if (paragraphs.length === 0) return null
  const [first, ...rest] = paragraphs
  const lead = first ?? ''
  const firstChar = lead.charAt(0)
  const remainder = lead.slice(1)

  return (
    <div
      className={`newspaper-body newspaper-ink space-y-3 text-[15px] leading-[1.62] ${
        opinion ? 'newspaper-opinion-body' : ''
      }`}
    >
      <p>
        <span className="newspaper-dropcap float-left mr-2 mt-1 font-display text-[3.4rem] leading-[0.8] text-[#1c1b19]">
          {firstChar}
        </span>
        {remainder}
      </p>
      {rest.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}

/* ── Masthead with ears ───────────────────────────────────────── */

function Masthead({
  edition,
}: {
  edition: NewspaperEdition
}) {
  const { weatherBug } = edition
  return (
    <header className="relative px-1 pb-2 pt-1">
      <div className="newspaper-rule-dual mb-3" aria-hidden="true" />

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)] items-stretch gap-2 sm:gap-3">
        {/* Left ear — weather / sentiment bug */}
        <aside className="newspaper-ear flex flex-col justify-center border border-[#1a1a18]/80 bg-[rgba(0,188,242,0.06)] px-2 py-2 text-left sm:px-3">
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#00A4A6]">
            Weather
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[#1c1b19]">
            <span className="text-[#00A4A6]">
              <WeatherIcon icon={weatherBug.icon} />
            </span>
            <span className="font-display text-sm font-semibold leading-tight sm:text-base">
              {weatherBug.word}
            </span>
          </div>
          <p className="mt-1 hidden text-[10px] leading-snug text-[#5c5a54] sm:block">
            {weatherBug.detail}
          </p>
        </aside>

        {/* Flag / nameplate */}
        <div className="min-w-0 text-center">
          <p className="text-[9px] uppercase tracking-[0.28em] text-[#5c5a54] sm:text-[10px]">
            Microsoft Fabric · Social sentiment
          </p>
          <h1 className="newspaper-flag mt-1 font-display text-[clamp(1.65rem,5.5vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-[#141412]">
            <span className="newspaper-flag-blackletter">{edition.paperName}</span>
          </h1>
          <div className="mx-auto mt-1.5 flex max-w-xs items-center justify-center gap-2 sm:max-w-md sm:gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00BCF2] to-[#7A3FF2]" />
            <span className="text-[9px] uppercase tracking-[0.22em] text-[#7A3FF2]">Pulse</span>
            <span className="h-px flex-1 bg-gradient-to-r from-[#7A3FF2] via-[#00BCF2] to-transparent" />
          </div>
          <p className="mt-1.5 text-[9px] uppercase tracking-[0.14em] text-[#7a7870]">
            {edition.volumeNote}
          </p>
        </div>

        {/* Right ear — edition / demo */}
        <aside className="newspaper-ear flex flex-col justify-center border border-[#1a1a18]/80 bg-[rgba(122,63,242,0.05)] px-2 py-2 text-right sm:px-3">
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#7A3FF2]">
            Edition
          </p>
          <p className="mt-1 font-display text-sm font-semibold leading-tight text-[#1c1b19] sm:text-base">
            {edition.editionLabel}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#5c5a54]">
            Demo · Gratis
          </p>
        </aside>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-y border-[#1a1a18]/85 px-1 py-2 text-[10px] uppercase tracking-[0.14em] text-[#3d3b36] sm:text-[11px]">
        <span>{edition.dateLine}</span>
        <span className="font-medium text-[#00A4A6]">{edition.dispatchLine}</span>
        <span>Broadsheet</span>
      </div>
      <div className="newspaper-rule-dual mt-3" aria-hidden="true" />
    </header>
  )
}

/* ── Section flag strip ───────────────────────────────────────── */

function SectionFlagStrip({
  workload,
  setWorkload,
  onBackPage,
  onIntelligence,
}: {
  workload: WorkloadFilter
  setWorkload: (next: WorkloadFilter) => void
  onBackPage: () => void
  onIntelligence: () => void
}) {
  const flags: { id: string; label: string; onClick: () => void; active: boolean }[] = [
    {
      id: 'news',
      label: 'News',
      onClick: () => setWorkload('all'),
      active: workload === 'all',
    },
    ...ATELIER_WORKLOAD_ORDER.filter((w) => w !== 'all')
      .slice(0, 5)
      .map((w) => ({
        id: w,
        label: atelierWorkloadShort(w).toUpperCase(),
        onClick: () => setWorkload(w),
        active: workload === w,
      })),
    {
      id: 'opinion',
      label: 'Opinion',
      onClick: () => setWorkload(workload),
      active: false,
    },
    {
      id: 'markets',
      label: 'Markets',
      onClick: () => setWorkload(workload),
      active: false,
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      onClick: onIntelligence,
      active: false,
    },
    {
      id: 'back',
      label: 'Competitors',
      onClick: onBackPage,
      active: false,
    },
  ]

  return (
    <nav
      aria-label="Section flags"
      className="newspaper-section-flags flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-[#c8c2b4] pb-2"
    >
      {flags.map((f, i) => (
        <span key={f.id} className="inline-flex items-center">
          {i > 0 ? (
            <span className="mx-1.5 text-[10px] text-[#c8c2b4]" aria-hidden="true">
              |
            </span>
          ) : null}
          <button
            type="button"
            onClick={f.onClick}
            className={`text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
              f.active
                ? 'text-[#00A4A6] underline decoration-[#00BCF2] decoration-2 underline-offset-4'
                : 'text-[#5c5a54] hover:text-[#1c1b19]'
            }`}
          >
            {f.label}
          </button>
        </span>
      ))}
    </nav>
  )
}

/* ── Markets ticker ───────────────────────────────────────────── */

function MarketsTicker({ markets }: { markets: NewspaperEdition['markets'] }) {
  if (markets.length === 0) return null
  const line = markets
    .map((m) => `${m.label} ${m.change}`)
    .join('  ·  ')
  return (
    <div className="newspaper-ticker overflow-hidden border-y border-[#1a1a18]/70 bg-[#efe8dc]/70 py-1.5">
      <div className="newspaper-ticker-track flex whitespace-nowrap text-[10px] uppercase tracking-[0.14em] text-[#3d3b36]">
        <span className="px-4">
          <span className="mr-3 font-semibold text-[#00A4A6]">Markets</span>
          {line}
        </span>
        <span className="px-4" aria-hidden="true">
          <span className="mr-3 font-semibold text-[#00A4A6]">Markets</span>
          {line}
        </span>
      </div>
    </div>
  )
}

/* ── Refer bar ────────────────────────────────────────────────── */

function ReferBar({
  refers,
  onOpen,
  onIntelligence,
}: {
  refers: NewspaperEdition['refers']
  onOpen: (id: string) => void
  onIntelligence?: () => void
}) {
  if (refers.length === 0) return null
  return (
    <div className="newspaper-refer mt-3 border border-[#1a1a18]/75 bg-[#f7f2e8]/90 px-3 py-2">
      <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7a7870]">
        Also in this edition
      </p>
      <ul className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-1">
        {refers.map((r) => (
          <li key={`${r.page}-${r.text}`} className="min-w-0">
            <button
              type="button"
              onClick={() => {
                if (r.page === 'B2' && onIntelligence) onIntelligence()
                else if (r.storyId) onOpen(r.storyId)
              }}
              className="group flex max-w-full items-baseline gap-2 text-left"
            >
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#00A4A6]">
                {r.page}
              </span>
              <span className="truncate font-serif text-[12px] text-[#3d3b36] group-hover:text-[#00A4A6]">
                {r.text}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── News Index (replaces KPI briefing) ───────────────────────── */

function NewsIndex({
  items,
  dispatchLine,
  onOpen,
  onBackPage,
  onIntelligence,
}: {
  items: NewspaperEdition['newsIndex']
  dispatchLine: string
  onOpen: (id: string) => void
  onBackPage: () => void
  onIntelligence: () => void
}) {
  return (
    <aside className="newspaper-index border border-[#1a1a18]/80 bg-[#f3efe6]/85 p-3 sm:p-4">
      <p className="border-b border-[#1a1a18] pb-2 font-display text-sm font-semibold uppercase tracking-[0.16em] text-[#141412]">
        Inside
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={`${item.page}-${item.label}`}>
            <button
              type="button"
              onClick={() => {
                if (item.label === 'Competitors') onBackPage()
                else if (item.label === 'Intelligence') onIntelligence()
                else if (item.storyId) onOpen(item.storyId)
              }}
              className="group flex w-full items-baseline justify-between gap-2 text-left"
            >
              <span className="font-serif text-[13px] text-[#2a2a28] group-hover:text-[#00A4A6]">
                <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#00A4A6]">
                  {item.page}
                </span>
                {item.label}
              </span>
              <span className="newspaper-leader flex-1 border-b border-dotted border-[#c8c2b4]" />
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-[#c8c2b4] pt-2 text-[11px] italic text-[#5c5a54]">
        {dispatchLine}
      </p>
    </aside>
  )
}

/* ── Illustration / photo hole ────────────────────────────────── */

function PhotoHole({ cutline }: { cutline: string }) {
  return (
    <figure className="newspaper-photo-hole my-3">
      <div className="newspaper-halftone relative aspect-[5/3] overflow-hidden border border-[#1a1a18]/80 bg-[#d9d2c4]">
        <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden="true">
          <defs>
            <pattern id="np-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="rgba(28,27,25,0.35)" />
            </pattern>
            <linearGradient id="np-cyan" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00BCF2" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7A3FF2" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#np-cyan)" />
          <rect width="200" height="120" fill="url(#np-dots)" />
          <path
            d="M20 90 C50 40, 80 100, 110 55 S160 20, 190 70"
            fill="none"
            stroke="#1c1b19"
            strokeWidth="1.2"
            opacity="0.55"
          />
          <circle cx="70" cy="48" r="14" fill="none" stroke="#1c1b19" strokeWidth="1" opacity="0.4" />
          <circle cx="70" cy="48" r="6" fill="#00BCF2" opacity="0.35" />
        </svg>
      </div>
      <figcaption className="newspaper-cutline mt-1.5 text-[11px] leading-snug text-[#5c5a54]">
        <span className="font-semibold uppercase tracking-[0.08em]">Cutline — </span>
        {cutline}
      </figcaption>
    </figure>
  )
}

/* ── Editorial cartoon ────────────────────────────────────────── */

function EditorialCartoon({ caption }: { caption: string }) {
  return (
    <figure className="newspaper-cartoon border border-[#1a1a18]/80 bg-[#f7f2e8] p-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7A3FF2]">
        Editorial cartoon
      </p>
      <div className="mt-2 flex justify-center">
        <svg viewBox="0 0 160 100" className="h-24 w-full max-w-[200px]" aria-hidden="true">
          <rect x="8" y="55" width="50" height="30" rx="2" fill="none" stroke="#1c1b19" strokeWidth="1.4" />
          <path d="M18 55 V40 H48 V55" fill="none" stroke="#1c1b19" strokeWidth="1.2" />
          <path
            d="M58 70 C78 40, 95 95, 115 50 S140 30, 152 60"
            fill="none"
            stroke="#7A3FF2"
            strokeWidth="1.6"
          />
          <circle cx="125" cy="28" r="10" fill="none" stroke="#00BCF2" strokeWidth="1.3" />
          <path d="M125 18 V12 M135 28 H141 M125 38 V44 M115 28 H109" stroke="#00BCF2" strokeWidth="1" />
          <text x="20" y="75" fontSize="7" fill="#5c5a54" fontFamily="serif">
            PIPE
          </text>
        </svg>
      </div>
      <figcaption className="mt-1 text-center font-serif text-[11px] italic text-[#5c5a54]">
        {caption}
      </figcaption>
    </figure>
  )
}

/* ── Letters / Corrections ────────────────────────────────────── */

function LettersBox({ letters }: { letters: NewspaperEdition['letters'] }) {
  if (letters.length === 0) return null
  return (
    <aside className="newspaper-letters border border-[#1a1a18]/80 p-3">
      {letters.map((letter, i) => (
        <div key={letter.title} className={i > 0 ? 'mt-3 border-t border-[#c8c2b4] pt-3' : ''}>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7a7870]">
            {letter.title}
          </p>
          <p className="mt-1.5 font-serif text-[12px] leading-relaxed text-[#2a2a28]">{letter.body}</p>
          <p className="mt-1 text-[10px] italic text-[#7a7870]">{letter.signoff}</p>
        </div>
      ))}
    </aside>
  )
}

/* ── Classifieds as actions ───────────────────────────────────── */

function ClassifiedsStrip({ ads }: { ads: NewspaperEdition['classifieds'] }) {
  if (ads.length === 0) return null
  return (
    <section className="newspaper-classifieds mt-8 border-t-2 border-[#1a1a18] pt-4">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#5c5a54]">
        Classifieds · Recommended actions
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {ads.map((ad) => (
          <article
            key={ad.headline}
            className="border border-[#c8c2b4] bg-[#f7f2e8]/90 px-3 py-2.5 text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1c1b19]">
              {ad.headline}
            </p>
            <p className="mt-1.5 font-serif text-[11px] leading-snug text-[#5c5a54]">{ad.body}</p>
            <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-[#00A4A6]">{ad.tag}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ── Story cards ──────────────────────────────────────────────── */

function KickerRow({
  sectionLabel,
  kicker,
  opinion = false,
}: {
  sectionLabel: string
  kicker?: string
  opinion?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00A4A6]">
        {sectionLabel}
      </p>
      {kicker ? (
        <p
          className={`text-[9px] font-semibold uppercase tracking-[0.2em] ${
            opinion ? 'text-[#7A3FF2]' : 'text-[#5c5a54]'
          }`}
        >
          {kicker}
        </p>
      ) : null}
    </div>
  )
}

function LeadPackage({
  story,
  cutline,
  pullQuote,
  onOpen,
  onEvidence,
}: {
  story: NewspaperStory
  cutline: string
  pullQuote: NewspaperEdition['pullQuote']
  onOpen: (id: string) => void
  onEvidence: (story: NewspaperStory) => void
}) {
  return (
    <article className="newspaper-lead-package min-w-0">
      <KickerRow sectionLabel={`${story.sectionLabel} · Lead`} kicker={story.kicker} />
      <button type="button" onClick={() => onOpen(story.id)} className="group mt-2 w-full text-left">
        <h2 className="font-display text-[clamp(1.7rem,3.6vw,2.55rem)] font-semibold leading-[1.1] tracking-tight text-[#141412] transition group-hover:text-[#00A4A6]">
          {story.headline}
        </h2>
        <p className="mt-3 font-serif text-[15px] leading-relaxed text-[#4a4842]">{story.dek}</p>
      </button>

      {/* L-shaped package: body wraps photo + pull */}
      <div className="newspaper-l-lead mt-4">
        <div className="newspaper-l-art">
          <PhotoHole cutline={cutline} />
          {pullQuote ? (
            <blockquote className="newspaper-pull hidden border border-[#1a1a18]/70 bg-[#f7f2e8]/80 p-3 sm:block">
              <p className="font-display text-[1.05rem] leading-snug text-[#1a1a18]">
                “{pullQuote.text}”
              </p>
              <footer className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#7a7870]">
                — {pullQuote.attribution}
              </footer>
            </blockquote>
          ) : null}
        </div>
        <div className="newspaper-l-copy">
          {story.mentionCount != null && story.uniqueAuthorCount != null ? (
            <div className="mb-3">
              <SourcesLine
                mentionCount={story.mentionCount}
                uniqueAuthors={story.uniqueAuthorCount}
                onClick={() => onEvidence(story)}
              />
            </div>
          ) : null}
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a7870]">{story.byline}</p>
          {story.body[0] ? (
            <p className="newspaper-body newspaper-ink mt-3 text-[14.5px] leading-[1.6]">
              <span className="newspaper-dropcap float-left mr-2 mt-0.5 font-display text-[2.85rem] leading-[0.82] text-[#1c1b19]">
                {story.body[0].charAt(0)}
              </span>
              {story.body[0].slice(1).split(/\s+/).slice(0, 55).join(' ')}
              …
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => onOpen(story.id)}
            className="mt-3 text-[12px] font-medium italic text-[#7A3FF2] underline-offset-2 hover:underline"
          >
            {story.jumpLabel} →
          </button>
        </div>
      </div>
    </article>
  )
}

function SecondaryCard({
  story,
  onOpen,
  onEvidence,
  rank,
}: {
  story: NewspaperStory
  onOpen: (id: string) => void
  onEvidence: (story: NewspaperStory) => void
  rank: 1 | 2 | 3
}) {
  const hedClass =
    rank === 1
      ? 'text-[1.35rem] sm:text-[1.45rem]'
      : rank === 2
        ? 'text-[1.15rem] sm:text-[1.22rem]'
        : 'text-[1.02rem] sm:text-[1.08rem]'
  const opinion = story.isOpinion || story.kind === 'editorial'

  return (
    <article
      className={`newspaper-mod border-t border-[#c8c2b4] pt-4 first:border-t-0 first:pt-0 ${
        opinion ? 'newspaper-opinion-mod' : ''
      }`}
    >
      <KickerRow sectionLabel={story.sectionLabel} kicker={story.kicker} opinion={opinion} />
      <button type="button" onClick={() => onOpen(story.id)} className="group mt-1.5 w-full text-left">
        <h3
          className={`font-display font-semibold leading-snug text-[#141412] transition group-hover:text-[#00A4A6] ${hedClass} ${
            opinion ? 'italic' : ''
          }`}
        >
          {story.headline}
        </h3>
        <p className="mt-1.5 line-clamp-3 font-serif text-[13px] leading-relaxed text-[#5a5850]">
          {story.dek}
        </p>
      </button>
      {story.mentionCount != null && story.uniqueAuthorCount != null ? (
        <div className="mt-2">
          <SourcesLine
            mentionCount={story.mentionCount}
            uniqueAuthors={story.uniqueAuthorCount}
            onClick={() => onEvidence(story)}
          />
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => onOpen(story.id)}
        className="mt-2 text-[11px] italic text-[#7A3FF2] hover:underline"
      >
        {story.jumpLabel} →
      </button>
    </article>
  )
}

/* ── Article (true jump continuity) ───────────────────────────── */

function ArticleView({
  story,
  paperName,
  folioDate,
  onBack,
  onEvidence,
  onBackPage,
}: {
  story: NewspaperStory
  paperName: string
  folioDate: string
  onBack: () => void
  onEvidence: (story: NewspaperStory) => void
  onBackPage: (pageId: string) => void
}) {
  const opinion = story.isOpinion || story.kind === 'editorial'
  const displayHed = story.jumpHed || story.headline

  return (
    <motion.article
      key={story.id}
      initial={{ opacity: 0, rotateY: -6, x: 36 }}
      animate={{ opacity: 1, rotateY: 0, x: 0 }}
      exit={{ opacity: 0, rotateY: 4, x: -24 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="newspaper-page-turn mx-auto w-full max-w-5xl px-1 py-3"
      style={{ transformOrigin: 'left center', perspective: 1200 }}
    >
      <FolioBar paperName={paperName} date={folioDate} page={story.pageMark} />

      <button
        type="button"
        onClick={onBack}
        className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[#5c5a54] transition hover:text-[#00A4A6]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Return to front
      </button>

      <p className="mt-5 text-[11px] italic text-[#7a7870]">
        Continued from {story.continuedFrom ?? 'A1'}
      </p>

      <KickerRow
        sectionLabel={`${story.sectionLabel} · ${story.pageMark}`}
        kicker={story.kicker}
        opinion={opinion}
      />

      <h2
        className={`font-display mt-2 text-[clamp(1.7rem,4vw,2.55rem)] font-semibold leading-[1.12] tracking-tight text-[#141412] ${
          opinion ? 'italic' : ''
        }`}
      >
        {displayHed}
      </h2>
      <p className="mt-3 font-serif text-base leading-relaxed text-[#5a5850]">{story.dek}</p>

      {story.mentionCount != null && story.uniqueAuthorCount != null ? (
        <div className="mt-3">
          <SourcesLine
            mentionCount={story.mentionCount}
            uniqueAuthors={story.uniqueAuthorCount}
            onClick={() => onEvidence(story)}
          />
        </div>
      ) : null}

      <p className="mt-4 border-y border-[#c8c2b4] py-2 text-[11px] uppercase tracking-[0.12em] text-[#7a7870]">
        {story.byline}
      </p>

      {story.pullQuote ? (
        <blockquote className="newspaper-pull my-6 border-l-2 border-[#7A3FF2] pl-5">
          <p className="font-display text-xl leading-snug text-[#1a1a18] sm:text-2xl">
            “{story.pullQuote}”
          </p>
        </blockquote>
      ) : null}

      <div className={`mt-6 ${opinion ? 'newspaper-opinion-well' : ''}`}>
        <div className="newspaper-article-cols">
          <DropCapBody paragraphs={story.body} opinion={opinion} />
        </div>
      </div>

      {story.competitorPageId ? (
        <div className="mt-10 border-t border-[#1a1a18]/80 pt-6 text-center">
          <button
            type="button"
            onClick={() => onBackPage(story.competitorPageId!)}
            className="font-serif text-[15px] italic text-[#7A3FF2] underline-offset-4 transition hover:underline"
          >
            Turn to the back page — who else ships this →
          </button>
          <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#9a968c]">
            Chronicle · Section B · Rival posture
          </p>
        </div>
      ) : null}

      <div className="mt-10">
        <FolioBar paperName={paperName} date={folioDate} page={story.pageMark} />
        <p className="mt-3 text-center font-serif text-xs italic text-[#9a968c]">
          — End of {story.pageMark} —
        </p>
      </div>
    </motion.article>
  )
}

/* ── Front page ───────────────────────────────────────────────── */

function FrontPage({
  edition,
  workload,
  setWorkload,
  onOpen,
  onEvidence,
  onBackPage,
  onIntelligence,
}: {
  edition: NewspaperEdition
  workload: WorkloadFilter
  setWorkload: (next: WorkloadFilter) => void
  onOpen: (id: string) => void
  onEvidence: (story: NewspaperStory) => void
  onBackPage: () => void
  onIntelligence: () => void
}) {
  const lead = edition.stories.find((s) => s.kind === 'lead') ?? edition.stories[0] ?? null
  const secondaries = edition.stories.filter((s) => s.id !== lead?.id)
  const rail = secondaries.slice(0, 3)
  const belowFold = secondaries.slice(3)
  const opinion = secondaries.find((s) => s.kind === 'editorial')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="newspaper-front"
    >
      <Masthead edition={edition} />
      <SectionFlagStrip workload={workload} setWorkload={setWorkload} onBackPage={onBackPage} onIntelligence={onIntelligence} />
      <div className="mt-2">
        <MarketsTicker markets={edition.markets} />
      </div>
      <ReferBar refers={edition.refers} onOpen={onOpen} onIntelligence={onIntelligence} />

      {lead ? (
        <>
          {/* Above the fold — 6-col modular */}
          <div className="newspaper-fold-label mt-5 mb-2 text-[9px] uppercase tracking-[0.2em] text-[#9a968c]">
            Above the fold
          </div>
          <div className="newspaper-grid-6 newspaper-above-fold">
            <div className="newspaper-col-span-4 newspaper-col-rule-r pr-0 lg:pr-5">
              <LeadPackage
                story={lead}
                cutline={edition.leadCutline}
                pullQuote={edition.pullQuote}
                onOpen={onOpen}
                onEvidence={onEvidence}
              />
            </div>
            <div className="newspaper-col-span-2 flex flex-col gap-5 pl-0 lg:pl-1">
              <NewsIndex
                items={edition.newsIndex}
                dispatchLine={edition.dispatchLine}
                onOpen={onOpen}
                onBackPage={onBackPage}
                onIntelligence={onIntelligence}
              />
              <div className="newspaper-rail space-y-0">
                {rail.map((story, i) => (
                  <SecondaryCard
                    key={story.id}
                    story={story}
                    onOpen={onOpen}
                    onEvidence={onEvidence}
                    rank={(story.hedRank ?? (([2, 3, 1] as const)[i] ?? 2)) as 1 | 2 | 3}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Fold crease */}
          <div className="newspaper-fold-crease my-8" aria-hidden="true" />
          <div className="newspaper-fold-label mb-3 text-[9px] uppercase tracking-[0.2em] text-[#9a968c]">
            Below the fold
          </div>

          {/* Below fold: teasers + cartoon + letters + remaining */}
          <div className="newspaper-grid-6 gap-y-6">
            <div className="newspaper-col-span-2 newspaper-col-rule-r">
              <EditorialCartoon caption={edition.cartoonCaption} />
            </div>
            <div className="newspaper-col-span-2 newspaper-col-rule-r px-0 lg:px-4">
              <LettersBox letters={edition.letters} />
              {opinion && !rail.some((s) => s.id === opinion.id) ? (
                <div className="mt-5">
                  <SecondaryCard
                    story={opinion}
                    onOpen={onOpen}
                    onEvidence={onEvidence}
                    rank={1}
                  />
                </div>
              ) : null}
            </div>
            <div className="newspaper-col-span-2 space-y-0">
              {(belowFold.length ? belowFold : rail.slice(0, 2)).map((story, i) => (
                <SecondaryCard
                  key={`below-${story.id}`}
                  story={story}
                  onOpen={onOpen}
                  onEvidence={onEvidence}
                  rank={(story.hedRank ?? (([3, 2, 1] as const)[i] ?? 3)) as 1 | 2 | 3}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="mt-16 text-center font-serif text-[#7a7870]">
          Quiet newsroom — no stories in this edition.
        </p>
      )}

      <ClassifiedsStrip ads={edition.classifieds} />

      <div className="mt-10">
        <FolioBar paperName={edition.paperName} date={edition.folioDate} page="A1" />
        <p className="mt-3 text-center font-serif text-[11px] italic text-[#9a968c]">
          All the sentiment that’s fit to print · demo data only
        </p>
      </div>
    </motion.div>
  )
}

/* ── Root ─────────────────────────────────────────────────────── */

export function Newspaper({ snapshot, view, workload, setWorkload, cloud }: LayoutProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [backPageId, setBackPageId] = useState<string | null>(null)
  const [intelligenceOpen, setIntelligenceOpen] = useState(false)
  const [evidenceStory, setEvidenceStory] = useState<NewspaperStory | null>(null)

  const edition = useMemo(
    () =>
      buildNewspaperEdition(
        view.kpis,
        view.themes,
        view.mentions,
        view.news ?? snapshot.news,
        snapshot.actions,
        workload,
        snapshot.dateRange.label,
        view.workloads,
      ),
    [
      view.kpis,
      view.themes,
      view.mentions,
      view.news,
      view.workloads,
      snapshot.news,
      snapshot.actions,
      workload,
      snapshot.dateRange.label,
    ],
  )

  const editionKey = `${workload}-${edition.stories.map((s) => s.id).join('|')}-${view.mentions.length}`

  useEffect(() => {
    setOpenId(null)
    setBackPageId(null)
    setIntelligenceOpen(false)
    setEvidenceStory(null)
  }, [editionKey])

  // Reset intelligence when cloud / workload pills change
  useEffect(() => {
    setIntelligenceOpen(false)
  }, [cloud, workload])

  const evidenceMentions: Mention[] = useMemo(() => {
    if (!evidenceStory?.themeId) return []
    const theme = view.themes.find((t) => t.id === evidenceStory.themeId)
    if (!theme) return []
    const ids = new Set(theme.mentionIds)
    return view.mentions
      .filter((m) => ids.has(m.id))
      .sort((a, b) => b.likes + b.reposts - (a.likes + a.reposts))
      .slice(0, 8)
  }, [evidenceStory, view.themes, view.mentions])

  const openStory = edition.stories.find((s) => s.id === openId) ?? null
  const pages = snapshot.competitorPages ?? DEMO_COMPETITOR_PAGES
  const allFeatures = snapshot.competitorFeatures ?? DEMO_COMPETITOR_FEATURES
  const activePage = backPageId ? (pages.find((p) => p.id === backPageId) ?? null) : null
  const pageFeatures = activePage
    ? allFeatures.filter((f) => activePage.featureIds.includes(f.id))
    : []

  const open = (id: string) => {
    setBackPageId(null)
    setIntelligenceOpen(false)
    setOpenId(id)
  }

  const openEvidence = (story: NewspaperStory) => setEvidenceStory(story)

  const intelStories = useMemo(
    () => selectIntelligenceNews(snapshot.intelligenceNews, cloud, workload, 10),
    [snapshot.intelligenceNews, cloud, workload],
  )
  const intelDesk = deskForCloud(cloud)

  const openIntelligence = () => {
    setOpenId(null)
    setBackPageId(null)
    setIntelligenceOpen(true)
  }

  const openDefaultBackPage = () => {
    const fromStories = edition.stories.find((s) => s.competitorPageId)?.competitorPageId
    const forWorkload =
      workload !== 'all'
        ? defaultCompetitorPageForWorkload(workload)?.id
        : undefined
    const id = fromStories ?? forWorkload ?? pages[0]?.id
    if (id) {
      setOpenId(null)
      setBackPageId(id)
    }
  }

  return (
    <div className="newspaper-stage relative flex min-h-[calc(100svh-7rem)] flex-col">
      <div className="newspaper-grain pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="newspaper-fiber pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-3 pb-16 pt-2 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {intelligenceOpen ? (
            <IntelligenceBackPage
              key={`intel-${intelDesk}-${workload}`}
              desk={intelDesk}
              stories={intelStories}
              workload={workload}
              folioDate={edition.folioDate}
              paperName={edition.paperName}
              onBack={() => setIntelligenceOpen(false)}
              onOpenCompetitor={(pageId) => {
                setIntelligenceOpen(false)
                setBackPageId(pageId)
              }}
            />
          ) : activePage ? (
            <CompetitorBackPage
              key={`back-${activePage.id}`}
              page={activePage}
              features={pageFeatures}
              onBack={() => setBackPageId(null)}
            />
          ) : openStory ? (
            <ArticleView
              key={`article-${openStory.id}`}
              story={openStory}
              paperName={edition.paperName}
              folioDate={edition.folioDate}
              onBack={() => setOpenId(null)}
              onEvidence={openEvidence}
              onBackPage={(pageId) => setBackPageId(pageId)}
            />
          ) : (
            <FrontPage
              key={`front-${editionKey}`}
              edition={edition}
              workload={workload}
              setWorkload={setWorkload}
              onOpen={open}
              onEvidence={openEvidence}
              onBackPage={openDefaultBackPage}
              onIntelligence={openIntelligence}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Persistent folio while on front */}
      {!openStory && !activePage && !intelligenceOpen ? (
        <div className="newspaper-folio-sticky pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl bg-gradient-to-t from-[#efe6d8]/95 to-transparent pb-2 pt-6">
            <FolioBar paperName={edition.paperName} date={edition.folioDate} page="A1" />
          </div>
        </div>
      ) : null}

      <EvidenceSheet
        open={evidenceStory != null}
        onOpenChange={(o) => {
          if (!o) setEvidenceStory(null)
        }}
        title={evidenceStory?.headline ?? 'Theme evidence'}
        mentionCount={evidenceStory?.mentionCount ?? 0}
        uniqueAuthors={evidenceStory?.uniqueAuthorCount ?? 0}
        volumeClass={evidenceStory?.volumeClass ?? 'single'}
        mentions={evidenceMentions}
      />
    </div>
  )
}
