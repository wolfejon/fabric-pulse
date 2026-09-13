import { useEffect, useId, useRef, useState } from 'react'
import { Archive, Check, ChevronDown } from 'lucide-react'
import { useLayout } from '../layout/LayoutProvider'
import {
  ARCHIVE_LAYOUTS,
  PRIMARY_LAYOUTS,
  isArchiveLayout,
  type LayoutId,
} from '../layout/layouts'

/**
 * Minimal mode switcher: Weather | Letter | Archive (old dashboards).
 * Replaces the dense layout dropdown as the emotional default control.
 */
export function ModeSwitcher({ variant = 'artistic' }: { variant?: 'artistic' | 'archive' }) {
  const { layoutId, setLayoutId } = useLayout()
  const [archiveOpen, setArchiveOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const inArchive = isArchiveLayout(layoutId)

  useEffect(() => {
    if (!archiveOpen) return
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setArchiveOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setArchiveOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [archiveOpen])

  const pick = (id: LayoutId) => {
    setLayoutId(id)
    setArchiveOpen(false)
  }

  const artistic =
    variant === 'artistic'
      ? {
          shell: 'text-[12px]',
          idle: 'text-current/55 hover:text-current',
          active: 'text-current',
          archiveBtn:
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-current/55 transition hover:text-current',
          archiveActive: 'text-current',
          menu: 'border-current/15 bg-white/90 text-[#1a2a3a] shadow-lg backdrop-blur-md',
        }
      : {
          shell: 'text-[12px]',
          idle: 'text-mute hover:text-ink',
          active: 'text-ink',
          archiveBtn:
            'inline-flex items-center gap-1 rounded-full border border-line bg-elevated/80 px-2.5 py-1 text-[11px] text-mute transition hover:border-teal/40 hover:text-ink',
          archiveActive: 'border-teal/40 text-teal-bright',
          menu: 'border-line bg-panel text-ink shadow-[0_16px_48px_rgba(0,0,0,0.35)]',
        }

  return (
    <div ref={rootRef} className={`relative flex items-center gap-1 ${artistic.shell}`}>
      {PRIMARY_LAYOUTS.map((item) => {
        const selected = layoutId === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => pick(item.id)}
            className={`rounded-full px-3 py-1.5 font-medium tracking-wide transition ${
              selected ? artistic.active : artistic.idle
            } ${selected ? 'underline decoration-[#00b7c3] decoration-1 underline-offset-4' : ''}`}
          >
            {item.name}
          </button>
        )
      })}

      <span className="mx-1 opacity-25" aria-hidden="true">
        |
      </span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={archiveOpen}
        aria-controls={listId}
        onClick={() => setArchiveOpen((v) => !v)}
        className={`${artistic.archiveBtn} ${inArchive ? artistic.archiveActive : ''}`}
      >
        <Archive size={12} aria-hidden="true" />
        Archive
        <ChevronDown
          size={12}
          className={`transition ${archiveOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {archiveOpen ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Old dashboard archive"
          className={`absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border p-1 ${artistic.menu}`}
        >
          <li className="px-2.5 py-2 text-[10px] uppercase tracking-[0.16em] opacity-50">
            Old dashboard (deprecated)
          </li>
          {ARCHIVE_LAYOUTS.map((item) => {
            const selected = item.id === layoutId
            return (
              <li key={item.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => pick(item.id)}
                  className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                    selected ? 'bg-[#00b7c3]/15' : 'hover:bg-black/5'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold">{item.name}</span>
                    <span className="block text-[10px] opacity-60">{item.subtitle}</span>
                  </span>
                  {selected ? <Check size={14} className="mt-0.5 shrink-0 text-[#00b7c3]" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
