import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { buildAtelierPulse, atelierReceipts } from '../../../lib/atelier'
import { FabricMark } from '../../atelier/FabricMark'
import { ReceiptsPanel } from '../../atelier/ReceiptsPanel'
import type { LayoutProps } from '../types'

export function WeaveThread({ snapshot, view, workload }: LayoutProps) {
  const [open, setOpen] = useState(false)
  const pulse = useMemo(
    () => buildAtelierPulse(view.kpis, view.themes, view.workloads, view.mentions, workload),
    [view, workload],
  )
  const receipts = useMemo(
    () => atelierReceipts(view.mentions, pulse.theme),
    [view.mentions, pulse.theme],
  )
  const fray = pulse.calmChoppy !== 'calm'

  return (
    <div className="relative flex min-h-[calc(100svh-7rem)] flex-col overflow-hidden bg-[#f7f4ef] text-[#1a2a3a]">
      {/* Soft loom grid */}
      <svg className="pointer-events-none absolute inset-0 size-full opacity-[0.12]" aria-hidden="true">
        <defs>
          <pattern id="loom" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="#7A3FF2" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#loom)" />
      </svg>
      <div className="absolute right-6 top-4 opacity-70">
        <FabricMark variant="weave" />
      </div>

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="weave"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12"
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a7f72]">
              Weave · {snapshot.dateRange.label}
            </p>

            <svg viewBox="0 0 640 220" className="mt-10 w-full max-w-2xl" aria-hidden="true">
              <path
                d="M40 110 C140 40, 220 180, 320 110 S500 40, 600 110"
                fill="none"
                stroke="#00A4A6"
                strokeWidth="2.5"
                className="atelier-thread"
                strokeLinecap="round"
              />
              {fray ? (
                <path
                  d="M480 95 l18 -22 M500 120 l22 14"
                  fill="none"
                  stroke="#7A3FF2"
                  strokeWidth="1.2"
                  opacity="0.7"
                />
              ) : null}
              <circle cx="320" cy="110" r="6" fill="#7A3FF2" className="atelier-knot" />
            </svg>

            <p className="font-display mt-2 max-w-lg text-center text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
              {pulse.sentence}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-x-5 text-[11px] uppercase tracking-[0.16em] text-[#8a7f72]">
              <span>Knot · {pulse.themeName ?? 'Quiet'}</span>
              <span className="opacity-40">·</span>
              <span>{fray ? 'Fray · tension' : 'Smooth selvage'}</span>
              <span className="opacity-40">·</span>
              <span>{pulse.workloadLabel}</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-10 rounded-full border border-[#1a2a3a]/20 px-5 py-2 text-sm transition hover:border-[#00BCF2]/50 hover:text-[#00A4A6]"
            >
              Pull the knot
            </button>
          </motion.div>
        ) : (
          <ReceiptsPanel
            key="receipts"
            mentions={receipts}
            onClose={() => setOpen(false)}
            title="Stitched receipts"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
