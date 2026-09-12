import { useMemo, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { detectSpikes, mentionsOnDay, newsNearDay, themesForMentions } from '../../layout/brief'
import { formatNet, formatPct, initials, relativeFrom } from '../../lib/format'
import { useThemeColors } from '../../theme/colors'
import { Card, EmptyState, SectionTitle, SentimentPill, ToneBadge } from '../ui'
import type { LayoutProps } from './types'

export function StoryTimeline({ snapshot, view, setThemeId }: LayoutProps) {
  const colors = useThemeColors()
  const spikes = useMemo(() => detectSpikes(view.daily), [view.daily])
  const [selectedDate, setSelectedDate] = useState<string | null>(spikes[0]?.date ?? null)

  const selectedSpike = spikes.find((s) => s.date === selectedDate) ?? null
  const dayMentions = useMemo(
    () => (selectedDate ? mentionsOnDay(view.mentions, selectedDate) : []),
    [selectedDate, view.mentions],
  )
  const dayThemes = useMemo(
    () => themesForMentions(view.themes, dayMentions).slice(0, 4),
    [view.themes, dayMentions],
  )
  const nearbyNews = useMemo(
    () => (selectedDate ? newsNearDay(snapshot.news, selectedDate, 1) : []),
    [selectedDate, snapshot.news],
  )

  const chartData = view.daily.map((d) => ({
    ...d,
    spike: spikes.some((s) => s.date === d.date) ? d.volume : null,
  }))

  const briefBullets = useMemo(() => {
    if (!selectedSpike) return []
    const top = dayThemes[0]
    return [
      `Volume hit ${selectedSpike.volume} mentions on ${selectedSpike.label} (z=${selectedSpike.zScore.toFixed(1)} vs window mean).`,
      `Mix that day: ${selectedSpike.positive} pos / ${selectedSpike.neutral} neu / ${selectedSpike.negative} neg · net ${formatNet(selectedSpike.net)}.`,
      top
        ? `Primary driver theme: ${top.name} (${formatNet(top.sentimentScore)} net, ${formatPct(top.trend)} velocity).`
        : 'No strong theme overlap in the demo window for this spike.',
    ]
  }, [selectedSpike, dayThemes])

  const tooltipStyle = {
    background: colors.elevated,
    border: `1px solid ${colors.line}`,
    borderRadius: 10,
    fontSize: 12,
    color: colors.ink,
  }

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-4">
        <SectionTitle
          title="Spike Cinema"
          hint="Spike Cinema: full-width volume & net with spike markers. Click a spike for the why story. Demo data."
        />
        <div className="h-72 w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 16, left: -8, bottom: 0 }}
              onClick={(state) => {
                const label = state?.activeLabel
                if (!label || typeof label !== 'string') return
                const point = view.daily.find((d) => d.label === label)
                if (point && spikes.some((s) => s.date === point.date)) {
                  setSelectedDate(point.date)
                }
              }}
            >
              <CartesianGrid stroke={colors.chartGrid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: colors.mute, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="vol"
                tick={{ fill: colors.mute, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="net"
                orientation="right"
                domain={[-1, 1]}
                tick={{ fill: colors.mute, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                yAxisId="vol"
                type="monotone"
                dataKey="volume"
                fill={colors.teal}
                fillOpacity={0.12}
                stroke={colors.teal}
                strokeWidth={2}
                name="Volume"
              />
              <Line
                yAxisId="net"
                type="monotone"
                dataKey="net"
                stroke={colors.amber}
                strokeWidth={2}
                dot={false}
                name="Net sentiment"
              />
              {spikes.map((spike) => (
                <ReferenceDot
                  key={spike.date}
                  yAxisId="vol"
                  x={spike.label}
                  y={spike.volume}
                  r={selectedDate === spike.date ? 8 : 6}
                  fill={selectedDate === spike.date ? colors.neg : colors.amber}
                  stroke={colors.canvas}
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedDate(spike.date)}
                />
              ))}
              {snapshot.news.map((item) => {
                const day = item.publishedAt.slice(0, 10)
                const point = view.daily.find((d) => d.date === day)
                if (!point) return null
                const fill =
                  item.sourceType === 'official'
                    ? colors.official
                    : item.sourceType === 'community'
                      ? colors.amber
                      : colors.mute
                return (
                  <ReferenceDot
                    key={item.id}
                    yAxisId="vol"
                    x={point.label}
                    y={Math.max(point.volume * 0.15, 0.4)}
                    r={5}
                    fill={fill}
                    stroke={colors.canvas}
                    strokeWidth={1}
                    shape={(dotProps) => {
                      const cx = Number(dotProps.cx ?? 0)
                      const cy = Number(dotProps.cy ?? 0)
                      const r = Number(dotProps.r ?? 5)
                      return (
                        <polygon
                          points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
                          fill={fill}
                          stroke={colors.canvas}
                          strokeWidth={1}
                        />
                      )
                    }}
                  />
                )
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-mute">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: colors.amber }} /> Spike marker
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block size-2 rotate-45"
              style={{ background: colors.official }}
            />{' '}
            News diamond (official / community / press)
          </span>
          <span>Click a spike to open the why panel</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="p-4">
          <SectionTitle
            title={selectedSpike ? `Why · ${selectedSpike.label}` : 'Why story'}
            hint="Template brief from windowed themes + mentions (no LLM)"
          />
          {!selectedSpike ? (
            <EmptyState label="No spike selected — markers appear when volume rises vs the window mean." />
          ) : (
            <>
              <ul className="space-y-2">
                {briefBullets.map((line, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink/90">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-teal" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <p className="mb-2 text-[11px] uppercase tracking-wider text-faint">Themes in window</p>
                <div className="flex flex-wrap gap-1.5">
                  {dayThemes.length === 0 ? (
                    <span className="text-xs text-mute">No theme overlap</span>
                  ) : (
                    dayThemes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setThemeId(theme.id)}
                        className="rounded-full border border-line bg-elevated/50 px-2.5 py-1 text-xs text-ink hover:border-teal/40"
                      >
                        {theme.name} · {formatNet(theme.sentimentScore)}
                      </button>
                    ))
                  )}
                </div>
              </div>
              {nearbyNews.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-[11px] uppercase tracking-wider text-faint">Nearby news</p>
                  <ul className="space-y-1.5">
                    {nearbyNews.map((item) => (
                      <li key={item.id} className="rounded-lg border border-line bg-elevated/30 px-3 py-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <ToneBadge
                            tone={
                              item.sourceType === 'official'
                                ? 'official'
                                : item.sourceType === 'community'
                                  ? 'community'
                                  : 'press'
                            }
                            label={item.sourceType}
                          />
                          <span className="text-xs font-medium text-ink">{item.title}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-mute">{item.summary}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </Card>

        <Card className="p-4">
          <SectionTitle
            title="Mentions in spike window"
            hint={selectedSpike ? `${dayMentions.length} demo posts on ${selectedSpike.label}` : 'Select a spike'}
          />
          {dayMentions.length === 0 ? (
            <EmptyState label="No mentions for this day in the demo corpus." />
          ) : (
            <ul className="max-h-[420px] space-y-2 overflow-auto pr-1">
              {dayMentions
                .slice()
                .sort((a, b) => b.likes + b.reposts - (a.likes + a.reposts))
                .slice(0, 8)
                .map((mention) => (
                  <li key={mention.id} className="rounded-xl border border-line bg-elevated/40 p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-teal/15 text-[11px] font-semibold text-teal-bright">
                        {initials(mention.author)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{mention.author}</p>
                        <p className="text-[11px] text-faint">
                          {mention.handle} · {relativeFrom(mention.createdAt, snapshot.generatedAt)}
                        </p>
                      </div>
                      <SentimentPill sentiment={mention.sentiment} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink/90">{mention.text}</p>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
