import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { WORKLOAD_CATALOG } from '../../../data/catalog'
import { ATELIER_WORKLOAD_ORDER, atelierReceipts, buildAtelierPulse } from '../../../lib/atelier'
import { ReceiptsPanel } from '../../atelier/ReceiptsPanel'
import type { LayoutProps } from '../types'
import type { WorkloadFilter } from '../../../types'

export function DeskGlobe({ snapshot, view, workload, setWorkload }: LayoutProps) {
  const [open, setOpen] = useState(false)
  const [spin, setSpin] = useState(0)
  const pulse = useMemo(
    () => buildAtelierPulse(view.kpis, view.themes, view.workloads, view.mentions, workload),
    [view, workload],
  )
  const receipts = useMemo(
    () => atelierReceipts(view.mentions, pulse.theme),
    [view.mentions, pulse.theme],
  )

  const continents = ATELIER_WORKLOAD_ORDER.filter((id) => id !== 'all') as Exclude<
    WorkloadFilter,
    'all'
  >[]

  const tint =
    pulse.glowHue === 'cyan'
      ? 'from-[#00BCF2]/50 to-[#00A4A6]/80'
      : pulse.glowHue === 'purple'
        ? 'from-[#7A3FF2]/50 to-[#3d2a6d]/90'
        : 'from-[#e8c48a]/40 to-[#00A4A6]/70'

  return (
    <div className="relative flex min-h-[calc(100svh-7rem)] flex-col items-center justify-center overflow-hidden bg-[#ebe6dc] text-[#1a2a3a]">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="globe"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center px-6 py-10"
          >
            <p className="text-[10px] tracking-[0.28em] text-[#8a7f72]">FABRIC PULSE · MERIDIAN</p>
            <div
              role="img"
              aria-label="Fabric estate globe"
              className={`relative mt-8 size-52 rounded-full bg-gradient-to-br ${tint} shadow-[0_24px_60px_rgba(0,0,0,0.18)] transition sm:size-64`}
              style={{ transform: `rotate(${spin}deg)` }}
            >
              <div className="absolute inset-[12%] rounded-full border border-white/30" />
              <div className="absolute inset-y-[8%] left-1/2 w-px -translate-x-1/2 bg-white/25" />
              {/* Continent dots */}
              {continents.slice(0, 6).map((id, i) => {
                const angle = (i / 6) * Math.PI * 2 - Math.PI / 2
                const r = 34
                const x = 50 + Math.cos(angle) * r
                const y = 50 + Math.sin(angle) * r
                const selected = workload === id
                return (
                  <button
                    key={id}
                    type="button"
                    className={`absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                      selected ? 'scale-125 bg-white' : 'bg-white/50'
                    }`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setWorkload(id)
                    }}
                    title={WORKLOAD_CATALOG[id]?.shortLabel}
                    aria-label={WORKLOAD_CATALOG[id]?.shortLabel}
                  />
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setSpin((s) => s + 45)}
              className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[#8a7f72] hover:text-[#1a2a3a]"
            >
              Turn globe
            </button>
            <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[#8a7f72]">
              {pulse.workloadLabel}
              {pulse.risingName ? ` · flag · ${pulse.risingName}` : ''}
            </p>
            <p className="mt-6 max-w-md text-center font-serif text-lg leading-relaxed text-[#3d362e]">
              {pulse.sentence}
            </p>
            <p className="mt-2 text-[10px] text-[#8a7f72]">{snapshot.dateRange.label}</p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-8 text-sm text-[#00A4A6] underline decoration-[#00A4A6]/30 underline-offset-4"
            >
              Open atlas
            </button>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setWorkload('all')}
                className="rounded-full px-2 py-0.5 text-[10px] text-[#8a7f72] hover:text-[#1a2a3a]"
              >
                Full spin
              </button>
              {continents.slice(0, 5).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setWorkload(id)}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    workload === id ? 'text-[#00A4A6]' : 'text-[#8a7f72] hover:text-[#1a2a3a]'
                  }`}
                >
                  {WORKLOAD_CATALOG[id]?.shortLabel}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <ReceiptsPanel
            key="receipts"
            mentions={receipts}
            onClose={() => setOpen(false)}
            title="Atlas pages"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
