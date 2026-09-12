import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Palette } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import type { ThemeId } from '../theme/themes'

export function ThemeSwitcher() {
  const { themeId, theme, themes, setThemeId } = useTheme()
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

  const pick = (id: ThemeId) => {
    setThemeId(id)
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
        <Palette size={14} className="shrink-0 text-teal" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold text-ink">
            {theme.name}
            {theme.experimental ? (
              <span className="ml-1 rounded bg-amber/15 px-1 py-px text-[9px] font-medium uppercase tracking-wide text-amber">
                Exp
              </span>
            ) : null}
          </span>
          <span className="block truncate text-[10px] text-mute">{theme.subtitle}</span>
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
          aria-label="Aesthetic theme"
          className="absolute right-0 z-50 mt-1.5 max-h-80 w-72 overflow-auto rounded-xl border border-line bg-panel p-1 shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
        >
          {themes.map((item) => {
            const selected = item.id === themeId
            return (
              <li key={item.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => pick(item.id)}
                  className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                    selected ? 'bg-teal/15' : 'hover:bg-elevated'
                  }`}
                >
                  <span
                    className="mt-0.5 size-3 shrink-0 rounded-full border border-line"
                    style={{ background: swatchFor(item.id) }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                      {item.name}
                      {item.experimental ? (
                        <span className="rounded bg-amber/15 px-1 py-px text-[9px] font-medium uppercase tracking-wide text-amber">
                          Experimental
                        </span>
                      ) : null}
                    </span>
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

/** Tiny preview dots — fixed hex so the menu itself shows each theme’s accent. */
function swatchFor(id: ThemeId): string {
  switch (id) {
    case 'pulse':
      return '#00b7c3'
    case 'fluent':
      return '#00bcf2'
    case 'paper':
      return '#2563eb'
    case 'ops':
      return '#e8b84a'
    case 'glass':
      return '#a855f7'
    case 'narrative':
      return '#4f46e5'
    case 'enterprise':
      return '#5b5fc7'
    case 'radar':
      return '#22d3ee'
  }
}
