import { Drawer } from 'vaul'
import { ExternalLink, X } from 'lucide-react'
import { WORKLOAD_CATALOG } from '../../data/catalog'
import { evidenceBadgeText, volumeClassLabel } from '../../lib/evidence'
import { formatDateTime } from '../../lib/format'
import type { Mention, VolumeClass } from '../../types'

function sourceLabel(sourceEntryId?: string): string {
  if (!sourceEntryId) return 'Unknown source'
  if (sourceEntryId.includes('reddit')) return 'Reddit'
  if (sourceEntryId.includes('github')) return 'GitHub'
  if (sourceEntryId.includes('rss')) return 'Blog RSS'
  if (sourceEntryId.includes('x-api')) return 'X'
  if (sourceEntryId.includes('stack')) return 'Stack Overflow'
  if (sourceEntryId.includes('gdelt')) return 'GDELT'
  return sourceEntryId
}

export function EvidenceSheet({
  open,
  onOpenChange,
  title,
  mentionCount,
  uniqueAuthors,
  volumeClass,
  mentions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  mentionCount: number
  uniqueAuthors: number
  volumeClass: VolumeClass
  mentions: Mention[]
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-16 flex max-h-[88vh] flex-col rounded-t-2xl border border-[#d8d0c4] bg-[#fffcf7] outline-none sm:inset-x-auto sm:right-4 sm:bottom-4 sm:top-4 sm:mt-0 sm:w-[min(420px,92vw)] sm:rounded-2xl">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-[#d8d0c4] sm:hidden" />
          <div className="flex items-start justify-between gap-3 border-b border-[#e8e0d4] px-5 py-4">
            <div className="min-w-0">
              <Drawer.Title className="font-display text-lg font-medium tracking-tight text-[#1a1814]">
                Evidence
              </Drawer.Title>
              <Drawer.Description className="mt-1 text-[12px] leading-relaxed text-[#7a7268]">
                {title}
              </Drawer.Description>
              <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[#8a7f72]">
                {evidenceBadgeText(mentionCount, uniqueAuthors, volumeClass)} ·{' '}
                {volumeClassLabel(volumeClass)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1.5 text-[#8a7f72] transition hover:bg-[#f0ebe3] hover:text-[#1a1814]"
              aria-label="Close evidence"
            >
              <X size={16} />
            </button>
          </div>

          <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {mentions.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-[#e8e0d4] bg-white/70 px-4 py-3"
              >
                <p className="text-[14px] leading-relaxed text-[#2a2a28]">“{m.text}”</p>
                <p className="mt-2 text-[11px] text-[#8a7f72]">
                  {m.author} · {m.handle} · {WORKLOAD_CATALOG[m.workload]?.shortLabel} ·{' '}
                  {formatDateTime(m.createdAt)}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#9a9186]">
                  {sourceLabel(m.sourceEntryId)}
                  {m.externalId ? ` · ${m.externalId}` : ''}
                </p>
                {m.permalink ? (
                  <a
                    href={m.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-[#7A3FF2] underline-offset-2 hover:underline"
                  >
                    View original
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                ) : null}
              </li>
            ))}
            {mentions.length === 0 ? (
              <li className="font-serif text-sm italic text-[#9a9186]">
                No verbatims in this slice.
              </li>
            ) : null}
          </ul>

          <p className="border-t border-[#e8e0d4] px-5 py-3 text-center text-[10px] text-[#b0a496]">
            Demo permalinks · synthetic corpus · not live wire
          </p>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
