import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { buildLetterNarrative } from '../../lib/narrative'
import { formatDateTime } from '../../lib/format'
import { WORKLOAD_CATALOG } from '../../data/catalog'
import type { LayoutProps } from './types'

export function LetterReceipts({ snapshot, view, nested = false }: LayoutProps & { nested?: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null)

  const byId = useMemo(
    () => new Map(snapshot.mentions.map((m) => [m.id, m] as const)),
    [snapshot.mentions],
  )

  const letter = useMemo(
    () => buildLetterNarrative(view.themes, view.mentions, byId),
    [view.themes, view.mentions, byId],
  )

  return (
    <div className={`letter-stage relative flex min-h-[calc(100svh-5.5rem)] flex-col ${nested ? '' : 'bg-[#f3eee6]'}`}>
      {/* Soft paper grain / margin ornament */}
      <div
        className="pointer-events-none absolute inset-y-16 left-6 w-px bg-gradient-to-b from-transparent via-[#00b7c3]/50 to-transparent sm:left-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-4 top-1/3 hidden h-16 w-16 opacity-[0.12] sm:block"
        aria-hidden="true"
      >
        {/* Tiny woven-thread ornament */}
        <svg viewBox="0 0 64 64" className="size-full text-[#00b7c3]">
          <path
            d="M8 20h48M8 32h48M8 44h48M20 8v48M32 8v48M44 8v48"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-8 py-16 sm:px-12"
      >
        <p className="font-serif text-[11px] uppercase tracking-[0.28em] text-[#8a7f72]">
          A note from Pulse · {snapshot.dateRange.label}
        </p>

        <h2 className="font-display mt-10 text-[clamp(1.75rem,4.5vw,2.75rem)] font-medium leading-[1.25] tracking-tight text-[#1c1915]">
          {letter.sentence}
        </h2>

        <p className="mt-8 text-sm text-[#8a7f72]">Three receipts. Tap to unfold.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {letter.receipts.map((receipt) => {
            const selected = openId === receipt.id
            return (
              <button
                key={receipt.id}
                type="button"
                aria-expanded={selected}
                onClick={() => setOpenId(selected ? null : receipt.id)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  selected
                    ? 'border-[#1c1915] bg-[#1c1915] text-[#f3eee6]'
                    : 'border-[#cfc4b6] bg-[#faf7f2] text-[#3d362e] hover:border-[#1c1915]/40'
                }`}
              >
                {receipt.label}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {letter.receipts.map((receipt) => {
            if (openId !== receipt.id) return null
            const m = receipt.mention
            return (
              <motion.blockquote
                key={receipt.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28 }}
                className="mt-8 overflow-hidden border-l-2 border-[#00b7c3]/70 pl-5"
              >
                <p className="font-serif text-lg leading-relaxed text-[#2a241c]">
                  “{m.text}”
                </p>
                <footer className="mt-4 text-sm text-[#8a7f72]">
                  — {m.author} (@{m.handle}) ·{' '}
                  {WORKLOAD_CATALOG[m.workload]?.shortLabel} · {formatDateTime(m.createdAt)}
                </footer>
              </motion.blockquote>
            )
          })}
        </AnimatePresence>

        {!openId ? (
          <p className="mt-16 font-serif text-xs italic text-[#b0a496]">
            Fabric product names only — no charts on this page.
          </p>
        ) : null}
      </motion.div>
    </div>
  )
}
