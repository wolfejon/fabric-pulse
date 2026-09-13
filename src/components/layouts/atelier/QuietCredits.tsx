import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ATELIER_WORKLOAD_ORDER, atelierReceipts, atelierWorkloadShort, buildAtelierPulse } from '../../../lib/atelier'
import { WORKLOAD_CATALOG } from '../../../data/catalog'
import { ReceiptsPanel } from '../../atelier/ReceiptsPanel'
import type { LayoutProps } from '../types'
import type { WorkloadFilter } from '../../../types'

export function QuietCredits({ snapshot, view, workload, setWorkload }: LayoutProps) {
  const [open, setOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const pulse = useMemo(
    () => buildAtelierPulse(view.kpis, view.themes, view.workloads, view.mentions, workload),
    [view, workload],
  )
  const receipts = useMemo(
    () => atelierReceipts(view.mentions, pulse.theme),
    [view.mentions, pulse.theme],
  )

  const creditLines = useMemo(() => {
    const lines: { role: string; name: string }[] = []
    for (const t of view.themes.slice(0, 5)) {
      const role = t.sentimentScore >= 0.15 ? 'Ally' : t.sentimentScore <= -0.1 ? 'Villain' : 'Cameo'
      lines.push({ role, name: t.name })
    }
    if (lines.length === 0) lines.push({ role: 'Silence', name: 'Quiet estate' })
    return lines
  }, [view.themes])

  const chapters = ATELIER_WORKLOAD_ORDER

  return (
    <div className="relative flex min-h-[calc(100svh-7rem)] flex-col overflow-hidden bg-[#0b0a10] text-[#f5f0ff]">
      {/* Letterbox bars */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-black" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-black" aria-hidden="true" />

      {/* Chapter index */}
      <nav
        aria-label="Credit chapters"
        className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-1 sm:flex"
      >
        {chapters.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setWorkload(id)}
            className={`text-left text-[9px] tracking-wide transition ${
              workload === id ? 'text-[#00BCF2]' : 'text-white/25 hover:text-white/50'
            }`}
          >
            {atelierWorkloadShort(id)}
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="credits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16"
          >
            <div className={`atelier-credits ${paused ? 'atelier-credits-paused' : ''} text-center`}>
              <p className="text-[11px] tracking-[0.4em] text-white/50">MICROSOFT FABRIC</p>
              <div className="mx-auto mt-2 h-px w-16 bg-[#00BCF2]" />
              <p className="font-display mt-6 text-4xl font-medium tracking-tight text-white">Pulse</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#7A3FF2]/80">
                {pulse.moodWord} · runtime {snapshot.dateRange.label}
              </p>

              <ul className="mx-auto mt-12 space-y-5">
                {creditLines.map((line) => (
                  <li key={line.name} className="font-serif">
                    <span className="block text-[10px] uppercase tracking-[0.22em] text-white/35">
                      {line.role}
                    </span>
                    <span className="mt-1 block text-lg text-white/85">{line.name}</span>
                  </li>
                ))}
              </ul>

              {pulse.topQuote ? (
                <p className="mx-auto mt-12 max-w-sm font-serif text-sm italic text-white/45">
                  Special thanks — “{pulse.topQuote.text.slice(0, 90)}
                  {pulse.topQuote.text.length > 90 ? '…' : ''}”
                </p>
              ) : null}

              <p className="mt-10 text-[11px] text-white/30">
                Chapter ·{' '}
                {workload === 'all'
                  ? 'All'
                  : WORKLOAD_CATALOG[workload as Exclude<WorkloadFilter, 'all'>]?.shortLabel}
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="text-[11px] tracking-wide text-white/40 hover:text-white/70"
              >
                {paused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="text-[11px] tracking-wide text-[#00BCF2]/70 hover:text-[#00BCF2]"
              >
                Still · receipts
              </button>
            </div>
          </motion.div>
        ) : (
          <ReceiptsPanel
            key="receipts"
            mentions={receipts}
            onClose={() => setOpen(false)}
            ink="text-[#f5f0ff]"
            mute="text-white/50"
            title="Credit stills"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
