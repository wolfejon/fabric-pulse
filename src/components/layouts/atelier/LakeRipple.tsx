import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { buildAtelierPulse, atelierReceipts } from '../../../lib/atelier'
import { ReceiptsPanel } from '../../atelier/ReceiptsPanel'
import type { LayoutProps } from '../types'

export function LakeRipple({ snapshot, view, workload }: LayoutProps) {
  const [open, setOpen] = useState(false)
  const pulse = useMemo(
    () => buildAtelierPulse(view.kpis, view.themes, view.workloads, view.mentions, workload),
    [view, workload],
  )
  const receipts = useMemo(
    () => atelierReceipts(view.mentions, pulse.theme),
    [view.mentions, pulse.theme],
  )
  const rings = pulse.volume >= 40 ? 4 : pulse.volume >= 20 ? 3 : 2
  const clear = pulse.calmChoppy === 'calm'

  return (
    <div className="relative flex min-h-[calc(100svh-7rem)] flex-col overflow-hidden bg-[#0c3d4a] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#00BCF2]/30 via-[#00A4A6]/40 to-[#0a2a35]"
        aria-hidden="true"
      />
      {/* Dock plaque */}
      <p className="absolute bottom-4 left-6 z-10 text-[9px] tracking-[0.3em] text-white/30">
        FABRIC · DOCK
      </p>

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="lake"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12"
          >
            <div className="relative size-64 sm:size-80">
              {Array.from({ length: rings }).map((_, i) => (
                <div
                  key={i}
                  className="atelier-ripple absolute left-1/2 top-1/2 rounded-full border border-[#00BCF2]/40"
                  style={{
                    width: `${40 + i * 55}%`,
                    height: `${40 + i * 55}%`,
                    marginLeft: `${-(20 + i * 27.5)}%`,
                    marginTop: `${-(20 + i * 27.5)}%`,
                    borderColor: clear
                      ? `rgba(0,188,242,${0.55 - i * 0.1})`
                      : `rgba(122,63,242,${0.45 - i * 0.08})`,
                    animationDelay: `${i * 0.45}s`,
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_24px_rgba(0,188,242,0.6)]"
                aria-label="Still center — open receipts"
              />
            </div>
            <p className="mt-10 max-w-md text-center font-display text-2xl font-medium tracking-tight">
              {pulse.sentence}
            </p>
            {pulse.topQuote ? (
              <p className="mt-6 max-w-sm text-center font-serif text-sm italic text-white/55">
                “{pulse.topQuote.text.slice(0, 100)}
                {pulse.topQuote.text.length > 100 ? '…' : ''}”
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-center gap-x-4 text-[11px] uppercase tracking-[0.16em] text-white/40">
              <span>{rings} ripples</span>
              <span>·</span>
              <span>{clear ? 'Clear water' : 'Murky dusk'}</span>
              <span>·</span>
              <span>{snapshot.dateRange.label}</span>
            </div>
          </motion.div>
        ) : (
          <ReceiptsPanel
            key="receipts"
            mentions={receipts}
            onClose={() => setOpen(false)}
            ink="text-white"
            mute="text-white/50"
            title="Under the leaf"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
