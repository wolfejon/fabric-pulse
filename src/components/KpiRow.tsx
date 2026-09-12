import type { ReactNode } from 'react'
import { Activity, MessageCircle, Scale, Sparkles } from 'lucide-react'
import type { PulseKpis } from '../types'
import { formatNet, formatShare } from '../lib/format'
import { Card, Trend } from './ui'

function Kpi({
  label,
  value,
  hint,
  icon,
  trend,
  invertTrend,
}: {
  label: string
  value: string
  hint: string
  icon: ReactNode
  trend?: number
  invertTrend?: boolean
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] uppercase tracking-wider text-faint">{label}</p>
        <span className="text-teal">{icon}</span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
        {trend !== undefined ? <Trend value={trend} invert={invertTrend} /> : null}
      </div>
      <p className="mt-1 text-xs text-mute">{hint}</p>
    </Card>
  )
}

export function KpiRow({ kpis }: { kpis: PulseKpis }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi
        label="Mention volume"
        value={String(kpis.volume)}
        hint="Sample X posts in the demo window"
        icon={<MessageCircle size={16} />}
        trend={kpis.volumeTrend}
      />
      <Kpi
        label="Sentiment mix"
        value={`${formatShare(kpis.positiveShare)} / ${formatShare(kpis.negativeShare)}`}
        hint={`${formatShare(kpis.neutralShare)} neutral · pos / neg share`}
        icon={<Scale size={16} />}
      />
      <Kpi
        label="Net sentiment"
        value={formatNet(kpis.netSentiment)}
        hint={`${formatNet(kpis.netSentimentTrend)} vs first half of window`}
        icon={<Activity size={16} />}
        trend={kpis.netSentimentTrend * 100}
      />
      <Kpi
        label="Top rising theme"
        value={kpis.topRisingTheme ?? '—'}
        hint="Highest volume growth, first half → second half"
        icon={<Sparkles size={16} />}
        trend={kpis.topRisingThemeTrend}
      />
    </div>
  )
}
