import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DailyPoint, PulseKpis } from '../types'
import { formatNet } from '../lib/format'
import { useThemeColors } from '../theme/colors'
import { Card, SectionTitle } from './ui'

export function SentimentCharts({
  daily,
  kpis,
}: {
  daily: DailyPoint[]
  kpis: PulseKpis
}) {
  const colors = useThemeColors()
  const tooltipStyle = {
    background: colors.elevated,
    border: `1px solid ${colors.line}`,
    borderRadius: 10,
    fontSize: 12,
    color: colors.ink,
  }
  const mix = [
    { name: 'Positive', value: Math.round(kpis.positiveShare * 100), color: colors.pos },
    { name: 'Neutral', value: Math.round(kpis.neutralShare * 100), color: colors.neu },
    { name: 'Negative', value: Math.round(kpis.negativeShare * 100), color: colors.neg },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <Card className="p-4 xl:col-span-2">
        <SectionTitle
          title="Volume & sentiment over time"
          hint="Daily mention volume with stacked sentiment counts (demo)"
        />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={daily} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={colors.chartGrid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: colors.mute, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: colors.mute, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [String(value), String(name)]}
              />
              <Bar dataKey="positive" stackId="s" fill={colors.pos} name="Positive" radius={[0, 0, 0, 0]} />
              <Bar dataKey="neutral" stackId="s" fill={colors.faint} name="Neutral" />
              <Bar dataKey="negative" stackId="s" fill={colors.neg} name="Negative" radius={[4, 4, 0, 0]} />
              <Area
                type="monotone"
                dataKey="volume"
                fill={colors.teal}
                fillOpacity={0.08}
                stroke={colors.teal}
                strokeWidth={2}
                name="Volume"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle title="Sentiment mix" hint={`Net ${formatNet(kpis.netSentiment)} across the filtered set`} />
        <div className="flex h-64 flex-col items-center justify-center">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={74}
                  paddingAngle={3}
                  stroke="none"
                >
                  {mix.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-1 flex flex-wrap justify-center gap-3 text-xs text-mute">
            {mix.map((slice) => (
              <li key={slice.name} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: slice.color }} />
                {slice.name} {slice.value}%
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  )
}
