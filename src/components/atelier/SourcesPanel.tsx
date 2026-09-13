import { useEffect, useState } from 'react'
import { Drawer } from 'vaul'
import { Radio, X } from 'lucide-react'
import type { SourceRegistryEntry } from '../../types'
import { persistEnabledSourceIds } from '../../data/sources'

function formatRefresh(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function SourcesControl({
  registry,
  enabledIds,
  onChange,
  tone = 'light',
}: {
  registry: SourceRegistryEntry[]
  enabledIds: Set<string>
  onChange: (next: Set<string>) => void
  tone?: 'light' | 'dark' | 'inherit'
}) {
  const [open, setOpen] = useState(false)
  const enabledCount = [...enabledIds].filter((id) =>
    registry.some((r) => r.id === id),
  ).length

  useEffect(() => {
    persistEnabledSourceIds(enabledIds, registry)
  }, [enabledIds, registry])

  const toggle = (id: string) => {
    const next = new Set(enabledIds)
    if (next.has(id)) {
      // Keep at least one source on for a usable edition
      if (next.size <= 1) return
      next.delete(id)
    } else {
      next.add(id)
    }
    onChange(next)
  }

  const btnClass =
    tone === 'dark'
      ? 'text-white/70 hover:text-white'
      : 'text-current/70 hover:text-current'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full border border-current/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] transition ${btnClass}`}
        title="Data sources"
      >
        <Radio size={12} aria-hidden="true" />
        Sources · {enabledCount}
      </button>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/35" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-20 flex max-h-[85vh] flex-col rounded-t-2xl border border-[#d8d0c4] bg-[#fffcf7] outline-none sm:inset-y-4 sm:right-4 sm:left-auto sm:mt-0 sm:w-[min(380px,92vw)] sm:rounded-2xl">
            <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-[#d8d0c4] sm:hidden" />
            <div className="flex items-start justify-between gap-3 border-b border-[#e8e0d4] px-5 py-4">
              <div>
                <Drawer.Title className="font-display text-lg font-medium text-[#1a1814]">
                  Sources
                </Drawer.Title>
                <Drawer.Description className="mt-1 text-[12px] text-[#7a7268]">
                  Toggle feeds for this demo edition. Filtered corpus respects enabled
                  sources.
                </Drawer.Description>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-[#8a7f72] hover:bg-[#f0ebe3]"
                aria-label="Close sources"
              >
                <X size={16} />
              </button>
            </div>

            <ul className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
              {registry.map((entry) => {
                const on = enabledIds.has(entry.id)
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => toggle(entry.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                        on
                          ? 'border-[#1a2a3a]/25 bg-white'
                          : 'border-transparent bg-[#f3efe6]/80 opacity-70'
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border ${
                          on
                            ? 'border-[#0d7a6f] bg-[#0d7a6f]'
                            : 'border-[#c8c2b4] bg-transparent'
                        }`}
                        aria-hidden="true"
                      >
                        {on ? (
                          <span className="size-1.5 rounded-full bg-white" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-[#1c1915]">
                          {entry.displayName}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-[#8a7f72]">
                          {entry.configBlurb}
                        </span>
                        <span className="mt-1.5 block text-[10px] uppercase tracking-[0.12em] text-[#9a9186]">
                          {entry.kind}
                          {entry.legalNote ? ` · ${entry.legalNote}` : ''} · refreshed{' '}
                          {formatRefresh(entry.lastRefresh)}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-[10px] uppercase tracking-[0.12em] ${
                          on ? 'text-[#0d7a6f]' : 'text-[#9a9186]'
                        }`}
                      >
                        {on ? 'On' : 'Off'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <p className="border-t border-[#e8e0d4] px-5 py-3 text-center text-[10px] text-[#b0a496]">
              Preferences saved in localStorage · demo registry only
            </p>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
