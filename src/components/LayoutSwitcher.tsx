import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, LayoutTemplate } from 'lucide-react'
import { useLayout } from '../layout/LayoutProvider'
import type { LayoutId } from '../layout/layouts'

export function LayoutSwitcher() {
  const { layoutId, layout, layouts, setLayoutId } = useLayout()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (id: LayoutId) => {
    setLayoutId(id)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-w-[11.5rem] items-center gap-2 rounded-xl border border-line bg-elevated/80 px-2.5 py-1.5 text-left transition hover:border-teal/40 hover:bg-elevated"
      >
        <LayoutTemplate size={14} className="shrink-0 text-teal" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold text-ink">{layout.name}</span>
          <span className="block truncate text-[10px] text-mute">{layout.subtitle}</span>
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-faint transition ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Presentation layout"
          className="absolute right-0 z-50 mt-1.5 max-h-80 w-72 overflow-auto rounded-xl border border-line bg-panel p-1 shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
        >
          {layouts.map((item) => {
            const selected = item.id === layoutId
            return (
              <li key={item.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => pick(item.id)}
                  className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                    selected ? 'bg-teal/15' : 'hover:bg-elevated'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-ink">{item.name}</span>
                    <span className="block text-[10px] text-mute">{item.subtitle}</span>
                  </span>
                  {selected ? <Check size={14} className="mt-0.5 shrink-0 text-teal" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
