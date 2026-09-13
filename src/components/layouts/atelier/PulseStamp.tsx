import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { buildAtelierPulse, atelierReceipts } from '../../../lib/atelier'
import { ReceiptsPanel } from '../../atelier/ReceiptsPanel'
import type { LayoutProps } from '../types'

export function PulseStamp({ snapshot, view, workload }: LayoutProps) {
  const [open, setOpen] = useState(false)
  const pulse = useMemo(
    () => buildAtelierPulse(view.kpis, view.themes, view.workloads, view.mentions, workload),
    [view, workload],
  )
  const receipts = useMemo(
    () => atelierReceipts(view.mentions, pulse.theme),
    [view.mentions, pulse.theme],
  )
  const denom = Math.max(1, Math.round(pulse.volume))

  return (
    <div className="relative flex min-h-[calc(100svh-7rem)] flex-col items-center justify-center overflow-hidden bg-[#d4c4a8] text-[#1c1915]">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="stamp"
            initial={{ opacity: 0, rotate: -2 }}
            animate={{ opacity: 1, rotate: -1.5 }}
            exit={{ opacity: 0 }}
            className="relative z-10 px-6 py-10"
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative mx-auto block w-[min(100%,20rem)] overflow-hidden rounded-sm border-[3px] border-dashed border-[#1c1915]/50 bg-[#faf6ef] p-1 shadow-xl transition hover:shadow-2xl"
              aria-label="Flip stamp for receipts"
            >
              <div className="border border-[#7A3FF2]/40 bg-gradient-to-br from-[#00BCF2]/20 via-white to-[#7A3FF2]/25 px-5 py-8 text-center">
                <p className="text-[8px] tracking-[0.4em] text-[#5C2D91]">MICROSOFT FABRIC</p>
                <p className="font-display mt-4 text-4xl font-medium tracking-tight text-[#1c1915]">
                  {pulse.moodWord}
                </p>
                <div className="mx-auto mt-4 h-16 w-16 rounded-full border-2 border-[#00BCF2]/50 bg-[#00BCF2]/10" />
                <p className="mt-4 text-xs text-[#5c5348]">{pulse.themeName ?? 'Quiet week'}</p>
                <p className="mt-6 font-display text-2xl text-[#7A3FF2]">{denom}¢</p>
                <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-[#8a7f72]">
                  Postmark · {snapshot.dateRange.end.slice(0, 10)}
                </p>
              </div>
            </button>
            <p className="mx-auto mt-8 max-w-sm text-center font-serif text-sm text-[#5c5348]">
              {pulse.sentence}
            </p>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-[#8a7f72]/80">
              Flip for receipts · {pulse.workloadLabel}
            </p>
          </motion.div>
        ) : (
          <ReceiptsPanel
            key="receipts"
            mentions={receipts}
            onClose={() => setOpen(false)}
            title="Under the stamp"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
