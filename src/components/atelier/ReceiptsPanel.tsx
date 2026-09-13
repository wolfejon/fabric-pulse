import { motion } from 'motion/react'
import { WORKLOAD_CATALOG } from '../../data/catalog'
import { formatDateTime } from '../../lib/format'
import type { Mention } from '../../types'

export function ReceiptsPanel({
  mentions,
  onClose,
  ink = 'text-[#1a2a3a]',
  mute = 'text-[#3d5266]/70',
  title = 'Receipts',
}: {
  mentions: Mention[]
  onClose: () => void
  ink?: string
  mute?: string
  title?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={`mx-auto w-full max-w-lg px-6 py-8 ${ink}`}
    >
      <button
        type="button"
        onClick={onClose}
        className={`mb-6 text-sm ${mute} transition hover:opacity-100`}
      >
        ← Back
      </button>
      <p className={`text-[11px] uppercase tracking-[0.2em] ${mute}`}>{title}</p>
      <ul className="mt-6 space-y-4">
        {mentions.map((m) => (
          <li
            key={m.id}
            className="rounded-2xl border border-current/10 bg-white/20 px-5 py-4 backdrop-blur-sm"
          >
            <p className="text-[15px] leading-relaxed opacity-90">“{m.text}”</p>
            <p className={`mt-3 text-[11px] ${mute}`}>
              {m.author} · {WORKLOAD_CATALOG[m.workload]?.shortLabel} · {formatDateTime(m.createdAt)}
            </p>
          </li>
        ))}
        {mentions.length === 0 ? (
          <li className={`text-sm ${mute}`}>No mentions in this focus.</li>
        ) : null}
      </ul>
    </motion.div>
  )
}
