import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { buildAtelierPulse, atelierReceipts } from '../../../lib/atelier'
import { ReceiptsPanel } from '../../atelier/ReceiptsPanel'
import type { LayoutProps } from '../types'

export function StageLight({ snapshot, view, workload }: LayoutProps) {
  const [open, setOpen] = useState(false)
  const pulse = useMemo(
    () => buildAtelierPulse(view.kpis, view.themes, view.workloads, view.mentions, workload),
    [view, workload],
  )
  const receipts = useMemo(
    () => atelierReceipts(view.mentions, pulse.theme),
    [view.mentions, pulse.theme],
  )
  const glow = Math.round(40 + pulse.applause * 50)

  return (
    <div className="relative flex min-h-[calc(100svh-7rem)] flex-col overflow-hidden bg-[#0a0812] text-[#f5f0ff]">
      {/* Purple curtain hint */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#7A3FF2]/35 to-transparent"
        aria-hidden="true"
      />
      <p className="absolute left-1/2 top-3 z-10 -translate-x-1/2 text-[9px] tracking-[0.35em] text-white/25">
        FABRIC · PROSCENIUM
      </p>

      {/* Spotlight cone */}
      <div
        className="pointer-events-none absolute left-1/2 top-[8%] h-[70%] w-[min(90vw,28rem)] -translate-x-1/2"
        style={{
          background: `radial-gradient(ellipse 55% 70% at 50% 100%, rgba(0,188,242,${glow / 100}) 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-16 text-center"
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
              Showtime · {snapshot.dateRange.label}
            </p>
            <p className="mt-6 text-sm tracking-wide text-[#00BCF2]/90">{pulse.workloadLabel}</p>
            <h2 className="font-display mt-4 max-w-lg text-[clamp(1.75rem,5vw,3rem)] font-medium leading-snug tracking-tight">
              {pulse.sentence}
            </h2>
            <div
              className="mt-10 h-1 w-24 rounded-full bg-[#00BCF2]/40"
              style={{ boxShadow: `0 0 ${glow}px rgba(0,188,242,0.55)` }}
              title="Applause meter"
              aria-hidden="true"
            />
            <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-white/30">
              {pulse.applause > 0.55 ? 'Soft applause' : pulse.applause < 0.35 ? 'Quiet house' : 'Polite murmur'}
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-12 text-sm text-white/50 underline decoration-white/20 underline-offset-4 transition hover:text-white/80"
            >
              Playbill
            </button>
          </motion.div>
        ) : (
          <ReceiptsPanel
            key="receipts"
            mentions={receipts}
            onClose={() => setOpen(false)}
            ink="text-[#f5f0ff]"
            mute="text-white/50"
            title="Playbill · receipts"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
