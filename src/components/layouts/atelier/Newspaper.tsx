import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { buildNewspaperEdition, type NewspaperStory } from '../../../lib/newspaper'
import type { LayoutProps } from '../types'

function DropCapBody({ paragraphs }: { paragraphs: string[] }) {
  if (paragraphs.length === 0) return null
  const [first, ...rest] = paragraphs
  const lead = first ?? ''
  const firstChar = lead.charAt(0)
  const remainder = lead.slice(1)

  return (
    <div className="newspaper-body space-y-4 text-[15px] leading-[1.65] text-[#2a2a28]">
      <p>
        <span className="newspaper-dropcap float-left mr-2 mt-1 font-display text-[3.4rem] leading-[0.8] text-[#1a1a18]">
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

function Masthead({
  paperName,
  dateLine,
  editionLabel,
  volumeNote,
}: {
  paperName: string
  dateLine: string
  editionLabel: string
  volumeNote: string
}) {
  return (
    <header className="relative px-1 pb-3 pt-1 text-center">
      <div className="newspaper-rule-dual mb-3" aria-hidden="true" />
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#5c5a54]">
        Microsoft Fabric · Social sentiment · {volumeNote}
      </p>
      <h1 className="font-display mt-2 text-[clamp(2.1rem,6vw,3.75rem)] font-semibold tracking-[-0.02em] text-[#141412]">
        {paperName}
      </h1>
      <div className="mx-auto mt-2 flex max-w-md items-center justify-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00BCF2] to-[#7A3FF2]" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A3FF2]">Pulse</span>
        <span className="h-px flex-1 bg-gradient-to-r from-[#7A3FF2] via-[#00BCF2] to-transparent" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-y border-[#1a1a18]/85 px-1 py-2 text-[11px] uppercase tracking-[0.14em] text-[#3d3b36]">
        <span>{dateLine}</span>
        <span className="font-medium text-[#00A4A6]">{editionLabel}</span>
        <span>Demo Broadsheet</span>
      </div>
      <div className="newspaper-rule-dual mt-3" aria-hidden="true" />
    </header>
  )
}

function LeadCard({
  story,
  onOpen,
}: {
  story: NewspaperStory
  onOpen: (id: string) => void
}) {
  return (
    <article className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00A4A6]">
        {story.sectionLabel} · Lead
      </p>
      <button
        type="button"
        onClick={() => onOpen(story.id)}
        className="group mt-2 w-full text-left"
      >
        <h2 className="font-display text-[clamp(1.65rem,3.5vw,2.45rem)] font-semibold leading-[1.12] tracking-tight text-[#141412] transition group-hover:text-[#00A4A6]">
          {story.headline}
        </h2>
        <p className="mt-3 font-serif text-[15px] leading-relaxed text-[#4a4842]">{story.dek}</p>
      </button>
      <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-[#7a7870]">{story.byline}</p>
      {story.body[0] ? (
        <p className="newspaper-body mt-4 text-[14.5px] leading-[1.6] text-[#2a2a28]">
          <span className="newspaper-dropcap float-left mr-2 mt-0.5 font-display text-[2.85rem] leading-[0.82] text-[#141412]">
            {story.body[0].charAt(0)}
          </span>
          {story.body[0].slice(1).split(/\s+/).slice(0, 48).join(' ')}
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
    </article>
  )
}

function SecondaryCard({
  story,
  onOpen,
}: {
  story: NewspaperStory
  onOpen: (id: string) => void
}) {
  return (
    <article className="border-t border-[#c8c2b4] pt-4 first:border-t-0 first:pt-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7a7870]">
        {story.sectionLabel}
      </p>
      <button type="button" onClick={() => onOpen(story.id)} className="group mt-1.5 w-full text-left">
        <h3 className="font-display text-[1.15rem] font-semibold leading-snug text-[#141412] transition group-hover:text-[#00A4A6] sm:text-[1.25rem]">
          {story.headline}
        </h3>
        <p className="mt-1.5 line-clamp-3 font-serif text-[13px] leading-relaxed text-[#5a5850]">
          {story.dek}
        </p>
      </button>
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

function BriefingColumn({
  items,
}: {
  items: { label: string; text: string }[]
}) {
  return (
    <aside className="newspaper-briefing rounded-sm border border-[#c8c2b4] bg-[#f3efe6]/80 p-4">
      <p className="border-b border-[#1a1a18] pb-2 font-display text-sm font-semibold uppercase tracking-[0.16em] text-[#141412]">
        Briefing
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="text-[12px] leading-snug text-[#3d3b36]">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#00A4A6]">
              {item.label}
            </span>
            <span className="mt-0.5 block font-serif">{item.text}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function ArticleView({
  story,
  onBack,
}: {
  story: NewspaperStory
  onBack: () => void
}) {
  return (
    <motion.article
      key={story.id}
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-2xl px-1 py-4"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[#5c5a54] transition hover:text-[#00A4A6]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to front page
      </button>

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00A4A6]">
        {story.sectionLabel} · {story.pageMark}
      </p>
      <h2 className="font-display mt-3 text-[clamp(1.85rem,4.5vw,2.75rem)] font-semibold leading-[1.15] tracking-tight text-[#141412]">
        {story.headline}
      </h2>
      <p className="mt-4 font-serif text-base leading-relaxed text-[#5a5850]">{story.dek}</p>
      <p className="mt-4 border-y border-[#c8c2b4] py-2 text-[11px] uppercase tracking-[0.12em] text-[#7a7870]">
        {story.byline}
      </p>

      {story.pullQuote ? (
        <blockquote className="newspaper-pull my-8 border-l-2 border-[#7A3FF2] pl-5">
          <p className="font-display text-xl leading-snug text-[#1a1a18] sm:text-2xl">
            “{story.pullQuote}”
          </p>
        </blockquote>
      ) : null}

      <div className="mt-6">
        <DropCapBody paragraphs={story.body} />
      </div>

      <p className="mt-10 text-center font-serif text-xs italic text-[#9a968c]">
        — End of {story.pageMark} —
      </p>
    </motion.article>
  )
}

export function Newspaper({ snapshot, view, workload }: LayoutProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  const edition = useMemo(
    () =>
      buildNewspaperEdition(
        view.kpis,
        view.themes,
        view.mentions,
        snapshot.news,
        snapshot.actions,
        workload,
        snapshot.dateRange.label,
      ),
    [view.kpis, view.themes, view.mentions, snapshot.news, snapshot.actions, workload, snapshot.dateRange.label],
  )

  const editionKey = `${workload}-${edition.stories.map((s) => s.id).join('|')}`

  useEffect(() => {
    setOpenId(null)
  }, [editionKey])

  const openStory = edition.stories.find((s) => s.id === openId) ?? null
  const lead = edition.stories.find((s) => s.kind === 'lead') ?? edition.stories[0] ?? null
  const secondaries = edition.stories.filter((s) => s.id !== lead?.id)

  const open = (id: string) => setOpenId(id)

  return (
    <div className="newspaper-stage relative flex min-h-[calc(100svh-7rem)] flex-col">
      <div className="newspaper-grain pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-14 pt-2 sm:px-8">
        <AnimatePresence mode="wait">
          {openStory ? (
            <ArticleView key={`article-${openStory.id}`} story={openStory} onBack={() => setOpenId(null)} />
          ) : (
            <motion.div
              key={`front-${editionKey}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <Masthead
                paperName={edition.paperName}
                dateLine={edition.dateLine}
                editionLabel={edition.editionLabel}
                volumeNote={edition.volumeNote}
              />

              {lead ? (
                <div className="mt-6 grid gap-8 lg:grid-cols-12">
                  {/* Lead + pull quote */}
                  <div className="lg:col-span-7 lg:border-r lg:border-[#c8c2b4] lg:pr-8">
                    <LeadCard story={lead} onOpen={open} />
                    {edition.pullQuote ? (
                      <blockquote className="newspaper-pull mt-8 hidden border-y border-[#1a1a18]/80 py-5 sm:block">
                        <p className="font-display text-center text-xl leading-snug text-[#1a1a18] sm:text-2xl">
                          “{edition.pullQuote.text}”
                        </p>
                        <footer className="mt-3 text-center text-[11px] uppercase tracking-[0.14em] text-[#7a7870]">
                          — {edition.pullQuote.attribution}
                        </footer>
                      </blockquote>
                    ) : null}
                  </div>

                  {/* Secondary stack + briefing */}
                  <div className="flex flex-col gap-6 lg:col-span-5">
                    <div className="newspaper-columns space-y-0">
                      {secondaries.slice(0, 4).map((story) => (
                        <SecondaryCard key={story.id} story={story} onOpen={open} />
                      ))}
                    </div>
                    <BriefingColumn items={edition.briefing} />
                  </div>
                </div>
              ) : (
                <p className="mt-16 text-center font-serif text-[#7a7870]">
                  Quiet newsroom — no stories in this edition.
                </p>
              )}

              {/* Bottom rail of remaining stories */}
              {secondaries.length > 4 ? (
                <div className="mt-10 grid gap-6 border-t-2 border-[#1a1a18] pt-6 sm:grid-cols-2 lg:grid-cols-3">
                  {secondaries.slice(4).map((story) => (
                    <SecondaryCard key={story.id} story={story} onOpen={open} />
                  ))}
                </div>
              ) : null}

              <p className="mt-12 text-center font-serif text-[11px] italic text-[#9a968c]">
                All the sentiment that’s fit to print · demo data only
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
