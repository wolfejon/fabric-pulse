import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { buildAtelierPulse, atelierReceipts } from '../../../lib/atelier'
import { ReceiptsPanel } from '../../atelier/ReceiptsPanel'
import type { LayoutProps } from '../types'

export function FabricHorizon({ snapshot, view, workload }: LayoutProps) {
  const [open, setOpen] = useState(false)
  const pulse = useMemo(
    () => buildAtelierPulse(view.kpis, view.themes, view.workloads, view.mentions, workload),
    [view, workload],
  )
  const receipts = useMemo(
    () => atelierReceipts(view.mentions, pulse.theme),
    [view.mentions, pulse.theme],
  )

  const waterName = workload === 'onelake' ? 'OneLake' : 'the shore'
  const choppy = pulse.calmChoppy !== 'calm'

  return (
    <div className="relative flex min-h-[calc(100svh-7rem)] flex-col overflow-hidden">
      {/* Cyan→purple dusk sky */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#7A3FF2]/35 via-[#3d6ea8] to-[#00BCF2]/90"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-[#00A4A6]/40 to-[#0a3a48]"
        aria-hidden="true"
      />
      {/* Horizon line */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-[42%] h-px bg-gradient-to-r from-transparent via-[#00BCF2] to-transparent ${
          choppy ? 'atelier-horizon-choppy' : ''
        }`}
        aria-hidden="true"
      />
      {/* Sand / shore bar with etched wordmark */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex h-10 items-end justify-center pb-2"
        aria-hidden="true"
      >
        <span className="text-[9px] tracking-[0.35em] text-white/25">FABRIC</span>
      </div>

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="shore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-1 flex-col items-center justify-end px-6 pb-28 pt-8 text-center text-white"
          >
            <p className="mb-auto pt-8 text-[11px] uppercase tracking-[0.22em] text-white/50">
              Horizon · {snapshot.dateRange.label}
            </p>
            <p className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
              {pulse.moodWord}
            </p>
            <p className="mt-4 max-w-md text-base font-light text-white/75 sm:text-lg">
              Standing at {waterName} — {pulse.sentence}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
              <span>{pulse.volumeNote}</span>
              <span className="opacity-40">·</span>
              <span>{choppy ? 'Choppy water' : 'Still water'}</span>
              {pulse.risingName ? (
                <>
                  <span className="opacity-40">·</span>
                  <span className="text-[#00BCF2]">Storm spark · {pulse.risingName}</span>
                </>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-10 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm backdrop-blur-sm transition hover:bg-white/20"
            >
              Wade in
            </button>
          </motion.div>
        ) : (
          <ReceiptsPanel
            key="receipts"
            mentions={receipts}
            onClose={() => setOpen(false)}
            ink="text-white"
            mute="text-white/55"
            title="Shore receipts"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
