import { useEffect, useId, useRef, useState } from 'react'
import { Archive, Check, ChevronDown } from 'lucide-react'
import { useLayout } from '../layout/LayoutProvider'
import {
  ARCHIVE_LAYOUTS,
  PRIMARY_LAYOUTS,
  getLayoutMeta,
  isArchiveLayout,
  type LayoutId,
} from '../layout/layouts'

/**
 * Beautiful minimal mode switcher — lists all atelier modes by name.
 * Archive remains the escape hatch to old dashboards.
 */
export function ModeSwitcher({ variant = 'artistic' }: { variant?: 'artistic' | 'archive' }) {
  const { layoutId, setLayoutId } = useLayout()
  const [modesOpen, setModesOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const modesListId = useId()
  const archiveListId = useId()
  const inArchive = isArchiveLayout(layoutId)
  const currentName = getLayoutMeta(layoutId).name

  useEffect(() => {
    if (!modesOpen && !archiveOpen) return
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setModesOpen(false)
        setArchiveOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModesOpen(false)
        setArchiveOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [modesOpen, archiveOpen])

  const pick = (id: LayoutId) => {
    setLayoutId(id)
    setModesOpen(false)
    setArchiveOpen(false)
  }

  const artistic =
    variant === 'artistic'
      ? {
          shell: 'text-[12px]',
          idle: 'text-current/55 hover:text-current',
          active: 'text-current',
          btn: 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition',
          menu: 'border-current/15 bg-white/95 text-[#1a2a3a] shadow-lg backdrop-blur-md',
        }
      : {
          shell: 'text-[12px]',
          idle: 'text-mute hover:text-ink',
          active: 'text-ink',
          btn: 'inline-flex items-center gap-1 rounded-full border border-line bg-elevated/80 px-2.5 py-1 text-[11px] text-mute transition hover:border-teal/40 hover:text-ink',
          menu: 'border-line bg-panel text-ink shadow-[0_16px_48px_rgba(0,0,0,0.35)]',
        }

  return (
    <div ref={rootRef} className={`relative flex items-center gap-1 ${artistic.shell}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={modesOpen}
        aria-controls={modesListId}
        onClick={() => {
          setModesOpen((v) => !v)
          setArchiveOpen(false)
        }}
        className={`${artistic.btn} ${inArchive ? artistic.idle : artistic.active} font-medium tracking-wide`}
      >
        {inArchive ? 'Modes' : currentName}
        <ChevronDown
          size={12}
          className={`transition ${modesOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {modesOpen ? (
        <ul
          id={modesListId}
          role="listbox"
          aria-label="Atelier modes"
          className={`absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-xl border p-1 sm:w-72 ${artistic.menu}`}
        >
          <li className="px-2.5 py-2 text-[10px] uppercase tracking-[0.16em] opacity-50">
            Atelier
          </li>
          {PRIMARY_LAYOUTS.map((item) => {
            const selected = item.id === layoutId
            return (
              <li key={item.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => pick(item.id)}
                  className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                    selected ? 'bg-[#00BCF2]/15' : 'hover:bg-black/5'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold">{item.name}</span>
                    <span className="block text-[10px] opacity-60">{item.subtitle}</span>
                  </span>
                  {selected ? (
                    <Check size={14} className="mt-0.5 shrink-0 text-[#00BCF2]" />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      <span className="mx-1 opacity-25" aria-hidden="true">
        |
      </span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={archiveOpen}
        aria-controls={archiveListId}
        onClick={() => {
          setArchiveOpen((v) => !v)
          setModesOpen(false)
        }}
        className={`${artistic.btn} ${inArchive ? artistic.active : artistic.idle}`}
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
          id={archiveListId}
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
                    selected ? 'bg-[#00BCF2]/15' : 'hover:bg-black/5'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold">{item.name}</span>
                    <span className="block text-[10px] opacity-60">{item.subtitle}</span>
                  </span>
                  {selected ? (
                    <Check size={14} className="mt-0.5 shrink-0 text-[#00BCF2]" />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
