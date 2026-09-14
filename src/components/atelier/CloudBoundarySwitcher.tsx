import type { CloudBoundaryFilter } from '../../types'

const CLOUD_OPTIONS: { id: CloudBoundaryFilter; label: string }[] = [
  { id: 'all', label: 'All clouds' },
  { id: 'usgov', label: 'USGov' },
  { id: 'il7', label: 'IL7' },
  { id: 'il6', label: 'IL6' },
  { id: 'commercial', label: 'Commercial' },
]

/** Sparse cloud pills — same weight as workload switcher, not a KPI matrix. */
export function CloudBoundarySwitcher({
  value,
  onChange,
  tone = 'light',
}: {
  value: CloudBoundaryFilter
  onChange: (next: CloudBoundaryFilter) => void
  tone?: 'light' | 'dark' | 'inherit'
}) {
  const idle =
    tone === 'dark'
      ? 'text-white/45 hover:text-white/80'
      : tone === 'inherit'
        ? 'text-current/45 hover:text-current/80'
        : 'text-[#3d5266]/55 hover:text-[#1a2a3a]'
  const active =
    tone === 'dark'
      ? 'bg-white/15 text-white'
      : tone === 'inherit'
        ? 'bg-current/10 text-current'
        : 'bg-[#7A3FF2]/12 text-[#4a1f9e]'

  return (
    <div
      role="tablist"
      aria-label="Cloud boundary"
      className="flex max-w-full flex-wrap items-center justify-center gap-1 sm:flex-nowrap sm:overflow-x-auto sm:scrollbar-none"
    >
      {CLOUD_OPTIONS.map((opt) => {
        const selected = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.id)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] tracking-wide transition ${
              selected ? active : idle
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
