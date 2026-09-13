import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ATELIER_WORKLOAD_ORDER, atelierReceipts, atelierWorkloadShort, buildAtelierPulse } from '../../../lib/atelier'
import { ReceiptsPanel } from '../../atelier/ReceiptsPanel'
import type { LayoutProps } from '../types'

export function SignalLantern({ snapshot, view, workload, setWorkload }: LayoutProps) {
  const [open, setOpen] = useState(false)
  const pulse = useMemo(
    () => buildAtelierPulse(view.kpis, view.themes, view.workloads, view.mentions, workload),
    [view, workload],
  )
  const receipts = useMemo(
    () => atelierReceipts(view.mentions, pulse.theme),
    [view.mentions, pulse.theme],
  )

  const glow =
    pulse.glowHue === 'cyan'
      ? 'rgba(0,188,242,0.55)'
      : pulse.glowHue === 'purple'
        ? 'rgba(122,63,242,0.55)'
        : 'rgba(232,180,100,0.5)'
  const brightness = 0.35 + Math.min(pulse.volume, 50) / 50 * 0.55

  return (
    <div className="relative flex min-h-[calc(100svh-7rem)] flex-col overflow-hidden bg-[#121018] text-[#f0eaf8]">
      {/* Festival wire of tiny lanterns = workload switch */}
      <div className="relative z-20 flex justify-center gap-2 px-4 pt-2">
        {ATELIER_WORKLOAD_ORDER.map((id) => {
          const on = workload === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setWorkload(id)}
              title={atelierWorkloadShort(id)}
              className={`size-2.5 rounded-full transition ${
                on ? 'bg-[#00BCF2] shadow-[0_0_10px_#00BCF2]' : 'bg-white/20 hover:bg-white/40'
              }`}
              aria-label={atelierWorkloadShort(id)}
            />
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="lantern"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12"
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="atelier-lantern relative flex flex-col items-center"
              aria-label="Open lantern for receipts"
            >
              <div className="h-6 w-px bg-white/25" />
              <div
                className="relative flex h-44 w-28 flex-col items-center justify-center rounded-t-[40%] rounded-b-[20%] border border-white/15"
                style={{
                  background: `radial-gradient(ellipse at 50% 40%, ${glow}, rgba(18,16,24,0.9) 70%)`,
                  boxShadow: `0 0 ${40 * brightness}px ${glow}`,
                  opacity: 0.85 + brightness * 0.15,
                }}
              >
                <div
                  className="absolute inset-3 rounded-t-[36%] rounded-b-[16%] border border-white/10"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,188,242,0.08) 6px, rgba(0,188,242,0.08) 7px)',
                  }}
                />
                <span className="relative z-10 text-[9px] tracking-[0.3em] text-white/50">FABRIC</span>
              </div>
            </button>
            <p className="mt-10 max-w-md text-center font-serif text-lg text-white/70">
              {pulse.sentence}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-x-4 text-[11px] uppercase tracking-[0.16em] text-white/35">
              <span>{pulse.glowHue} glow</span>
              <span>·</span>
              <span>{pulse.volumeNote}</span>
              <span>·</span>
              <span>{pulse.velocityNote}</span>
            </div>
            <p className="mt-3 text-[10px] text-white/25">{snapshot.dateRange.label}</p>
          </motion.div>
        ) : (
          <ReceiptsPanel
            key="receipts"
            mentions={receipts}
            onClose={() => setOpen(false)}
            ink="text-[#f0eaf8]"
            mute="text-white/50"
            title="Inside the lantern"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
