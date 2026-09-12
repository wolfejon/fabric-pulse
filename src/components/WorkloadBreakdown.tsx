import type { WorkloadFilter, WorkloadStat } from '../types'
import { formatNet } from '../lib/format'
import { Card, SectionTitle, Trend } from './ui'

export function WorkloadBreakdown({
  workloads,
  selected,
  onSelect,
}: {
  workloads: WorkloadStat[]
  selected: WorkloadFilter
  onSelect: (id: WorkloadFilter) => void
}) {
  const max = Math.max(...workloads.map((item) => item.volume), 1)

  return (
    <Card className="p-4">
      <SectionTitle
        title="Workload breakdown"
        hint="Click a row to filter the dashboard. Sentiment bars are positive / neutral / negative share."
        action={
          selected !== 'all' ? (
            <button
              type="button"
              onClick={() => onSelect('all')}
              className="text-xs text-teal-bright hover:underline"
            >
              Show all
            </button>
          ) : null
        }
      />
      <div className="space-y-1">
        {workloads.map((item) => {
          const active = selected === item.id
          const pos = item.volume === 0 ? 0 : (item.positive / item.volume) * 100
          const neu = item.volume === 0 ? 0 : (item.neutral / item.volume) * 100
          const neg = item.volume === 0 ? 0 : (item.negative / item.volume) * 100
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(active ? 'all' : item.id)}
              className={`grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_auto] items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                active ? 'bg-teal/10 ring-1 ring-teal/40' : 'hover:bg-elevated'
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{item.label}</p>
                <p className="truncate text-[11px] text-faint">{item.blurb}</p>
              </div>
              <div>
                <div className="mb-1 h-2 overflow-hidden rounded-full bg-canvas">
                  <div className="flex h-full" style={{ width: `${(item.volume / max) * 100}%` }}>
                    <span className="h-full bg-pos" style={{ width: `${pos}%` }} />
                    <span className="h-full bg-faint" style={{ width: `${neu}%` }} />
                    <span className="h-full bg-neg" style={{ width: `${neg}%` }} />
                  </div>
                </div>
                <p className="text-[11px] text-mute">
                  {item.volume} mentions · net {formatNet(item.netSentiment)}
                </p>
              </div>
              <Trend value={item.trend} />
            </button>
          )
        })}
      </div>
    </Card>
  )
}
