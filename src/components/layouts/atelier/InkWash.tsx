import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { buildAtelierPulse, atelierReceipts } from '../../../lib/atelier'
import { FabricMark } from '../../atelier/FabricMark'
import { ReceiptsPanel } from '../../atelier/ReceiptsPanel'
import type { LayoutProps } from '../types'

export function InkWash({ snapshot, view, workload }: LayoutProps) {
  const [open, setOpen] = useState(false)
  const pulse = useMemo(
    () => buildAtelierPulse(view.kpis, view.themes, view.workloads, view.mentions, workload),
    [view, workload],
  )
  const receipts = useMemo(
    () => atelierReceipts(view.mentions, pulse.theme),
    [view.mentions, pulse.theme],
  )
  const density = Math.min(1, pulse.volume / 50)

  return (
    <div className="relative flex min-h-[calc(100svh-7rem)] flex-col overflow-hidden bg-[#f6f1e8] text-[#1a1814]">
      <div className="absolute right-6 top-4">
        <FabricMark variant="seal" />
      </div>

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="ink"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12"
          >
            <svg viewBox="0 0 400 280" className="w-full max-w-lg" aria-hidden="true">
              {/* Mist / mountain density */}
              <ellipse
                cx="200"
                cy="200"
                rx={120 + density * 60}
                ry={28 + density * 20}
                fill={`rgba(26,24,20,${0.04 + density * 0.08})`}
              />
              <path
                d="M40 160 C90 40, 150 200, 200 100 S300 40, 360 140"
                fill="none"
                stroke="#1a1814"
                strokeWidth={pulse.calmChoppy === 'storm' ? 4.5 : pulse.calmChoppy === 'choppy' ? 3 : 2}
                strokeLinecap="round"
                className="atelier-ink-stroke"
                opacity="0.85"
              />
              <path
                d="M80 190 C140 170, 180 210, 240 185"
                fill="none"
                stroke="#00A4A6"
                strokeWidth="1.2"
                opacity="0.5"
              />
            </svg>
            <p className="font-display mt-2 text-3xl font-medium tracking-tight">{pulse.moodWord}</p>
            <p className="mt-4 max-w-md text-center font-serif text-base text-[#5c5348]">
              {pulse.sentence}
            </p>
            <p className="mt-8 text-[10px] uppercase tracking-[0.2em] text-[#8a7f72]">
              Colophon · {snapshot.dateRange.label} · {pulse.workloadLabel}
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-8 text-sm text-[#7A3FF2] transition hover:opacity-80"
            >
              Unroll scroll
            </button>
          </motion.div>
        ) : (
          <ReceiptsPanel
            key="receipts"
            mentions={receipts}
            onClose={() => setOpen(false)}
            title="Scroll receipts"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
