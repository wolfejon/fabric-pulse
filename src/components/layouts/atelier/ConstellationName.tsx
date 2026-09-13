import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { buildAtelierPulse, atelierReceipts } from '../../../lib/atelier'
import { ReceiptsPanel } from '../../atelier/ReceiptsPanel'
import type { LayoutProps } from '../types'

const STAR_POS = [
  [20, 35],
  [38, 22],
  [52, 40],
  [68, 28],
  [78, 48],
  [45, 58],
  [30, 70],
] as const

export function ConstellationName({ snapshot, view, workload }: LayoutProps) {
  const [open, setOpen] = useState(false)
  const [activeStar, setActiveStar] = useState<number | null>(null)
  const pulse = useMemo(
    () => buildAtelierPulse(view.kpis, view.themes, view.workloads, view.mentions, workload),
    [view, workload],
  )
  const receipts = useMemo(
    () => atelierReceipts(view.mentions, pulse.theme),
    [view.mentions, pulse.theme],
  )
  const names = useMemo(() => {
    const fromThemes = view.themes.slice(0, 5).map((t) => t.name)
    while (fromThemes.length < 5) fromThemes.push(pulse.workloadLabel)
    return fromThemes
  }, [view.themes, pulse.workloadLabel])

  const temp =
    pulse.glowHue === 'cyan' ? '#00BCF2' : pulse.glowHue === 'purple' ? '#c4a8ff' : '#f0d9a8'

  return (
    <div className="relative flex min-h-[calc(100svh-7rem)] flex-col overflow-hidden bg-[#12081f] text-[#f0eaf8]">
      <p className="absolute left-6 top-2 text-[10px] tracking-[0.28em] text-white/30">
        OBSERVATORY
      </p>

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="sky"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-1 flex-col px-4 py-8"
          >
            <svg viewBox="0 0 100 80" className="mx-auto w-full max-w-3xl flex-1">
              {STAR_POS.slice(0, names.length).map((_, i, arr) => {
                if (i === 0) return null
                const [x1, y1] = arr[i - 1]!
                const [x2, y2] = arr[i]!
                return (
                  <line
                    key={`l-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={temp}
                    strokeWidth="0.15"
                    opacity="0.45"
                  />
                )
              })}
              {STAR_POS.slice(0, names.length).map(([x, y], i) => (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={i === 0 ? 1.4 : 0.9}
                    fill={i === 0 ? temp : '#00BCF2'}
                    className="atelier-star cursor-pointer"
                    onClick={() => {
                      setActiveStar(i)
                      setOpen(true)
                    }}
                  />
                  <text
                    x={x}
                    y={y - 2.5}
                    textAnchor="middle"
                    fill="white"
                    opacity="0.55"
                    fontSize="2.2"
                  >
                    {names[i]}
                  </text>
                </g>
              ))}
            </svg>
            <p className="mx-auto max-w-md text-center font-serif text-sm text-white/55">
              {pulse.sentence}
            </p>
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-white/30">
              {snapshot.dateRange.label} · {pulse.moodWord} sky · brightest · {pulse.themeName ?? '—'}
            </p>
            {activeStar !== null ? null : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mx-auto mt-6 text-[11px] tracking-wide text-[#00BCF2]/80 hover:text-[#00BCF2]"
              >
                Read a star
              </button>
            )}
          </motion.div>
        ) : (
          <ReceiptsPanel
            key="receipts"
            mentions={receipts}
            onClose={() => {
              setOpen(false)
              setActiveStar(null)
            }}
            ink="text-[#f0eaf8]"
            mute="text-white/50"
            title="Starlight quotes"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
