import { ATELIER_WORKLOAD_ORDER, atelierWorkloadShort } from '../../lib/atelier'
import type { WorkloadFilter } from '../../types'

/** Sparse workload pills — filters copy/data only, never a KPI wall. */
export function WorkloadSwitcher({
  value,
  onChange,
  tone = 'light',
}: {
  value: WorkloadFilter
  onChange: (next: WorkloadFilter) => void
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
        : 'bg-[#00BCF2]/15 text-[#0a4a5c]'

  return (
    <div
      role="tablist"
      aria-label="Workload focus"
      className="flex max-w-full flex-wrap items-center justify-center gap-1 sm:flex-nowrap sm:overflow-x-auto sm:scrollbar-none"
    >
      {ATELIER_WORKLOAD_ORDER.map((id) => {
        const selected = value === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] tracking-wide transition ${
              selected ? active : idle
            }`}
          >
            {atelierWorkloadShort(id)}
          </button>
        )
      })}
    </div>
  )
}
