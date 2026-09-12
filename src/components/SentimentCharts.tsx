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
import { Card, SectionTitle } from './ui'

const tooltipStyle = {
  background: '#182230',
  border: '1px solid #243040',
  borderRadius: 10,
  fontSize: 12,
}

export function SentimentCharts({
  daily,
  kpis,
}: {
  daily: DailyPoint[]
  kpis: PulseKpis
}) {
  const mix = [
    { name: 'Positive', value: Math.round(kpis.positiveShare * 100), color: '#3ddc97' },
    { name: 'Neutral', value: Math.round(kpis.neutralShare * 100), color: '#8b9bb0' },
    { name: 'Negative', value: Math.round(kpis.negativeShare * 100), color: '#ff6b7a' },
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
              <CartesianGrid stroke="#243040" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#8b9bb0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8b9bb0', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [String(value), String(name)]}
              />
              <Bar dataKey="positive" stackId="s" fill="#3ddc97" name="Positive" radius={[0, 0, 0, 0]} />
              <Bar dataKey="neutral" stackId="s" fill="#5d6d82" name="Neutral" />
              <Bar dataKey="negative" stackId="s" fill="#ff6b7a" name="Negative" radius={[4, 4, 0, 0]} />
              <Area
                type="monotone"
                dataKey="volume"
                fill="#00b7c3"
                fillOpacity={0.08}
                stroke="#00b7c3"
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
