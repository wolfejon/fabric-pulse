import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from 'recharts'
import type { DailyPoint, DateRange, PulseKpis, WorkloadFilter } from '../types'
import { WORKLOAD_CATALOG } from '../data/catalog'
import { formatNet, sentimentWord } from '../lib/format'
import { ToneBadge } from './ui'

function PulseMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-9" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0b1118" stroke="#00b7c3" strokeWidth="1.2" />
      <path
        d="M5 18c3-8 5 8 8 0s5 8 8 0 5 8 6 0"
        stroke="#00b7c3"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function Header({
  kpis,
  daily,
  dateRange,
  workload,
  onClear,
}: {
  kpis: PulseKpis
  daily: DailyPoint[]
  dateRange: DateRange
  workload: WorkloadFilter
  onClear: () => void
}) {
  const word = sentimentWord(kpis.netSentiment)
  const wordColor =
    word === 'positive' ? 'text-pos' : word === 'negative' ? 'text-neg' : 'text-mute'

  return (
    <header className="flex flex-col gap-5 border-b border-line px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <PulseMark />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-ink">Fabric Pulse</h1>
            <ToneBadge tone="amber" label="Demo" />
          </div>
          <p className="mt-0.5 text-xs text-mute">
            Social listening &amp; sentiment for Microsoft Fabric product teams
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-6">
        {workload !== 'all' ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs text-teal-bright hover:bg-teal/20"
          >
            Filtered: {WORKLOAD_CATALOG[workload].shortLabel} · Clear
          </button>
        ) : null}

        <div className="min-w-40">
          <p className="text-[11px] uppercase tracking-wider text-faint">Overall sentiment</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className={`text-2xl font-semibold ${wordColor}`}>{formatNet(kpis.netSentiment)}</span>
            <span className={`text-sm capitalize ${wordColor}`}>{word}</span>
          </div>
        </div>

        <div className="h-12 w-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <Area
                type="monotone"
                dataKey="net"
                stroke="#00b7c3"
                fill="#00b7c3"
                fillOpacity={0.18}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-faint">7-day net trend</p>
        </div>

        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-faint">Date range</p>
          <p className="mt-0.5 text-sm text-ink">{dateRange.label}</p>
          <p className="text-[11px] text-mute">Demo window</p>
        </div>
      </div>
    </header>
  )
}
