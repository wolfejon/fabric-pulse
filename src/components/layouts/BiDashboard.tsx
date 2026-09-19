import { useMemo, useState, type ReactNode } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleDashed,
  MessageCircle,
  Minus,
  Scale,
  Sparkles,
  Target,
} from 'lucide-react'
import {
  Area,
  Bar,
  BarChart,
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
import { EvidenceBadge } from '../atelier/EvidenceBadge'
import { EvidenceSheet } from '../atelier/EvidenceSheet'
import { WORKLOAD_CATALOG } from '../../data/catalog'
import { resolveThemeMapping } from '../../lib/aggregate'
import { formatCloudBoundary, formatNet, formatPct, formatShare } from '../../lib/format'
import type { CoverageStatus, SuggestedAction, ThemeInsight, ThemePolarity } from '../../types'
import type { LayoutProps } from './types'

const BI = {
  line: '#e1e4e8',
  ink: '#242424',
  mute: '#616161',
  faint: '#8a8a8a',
  elevated: '#fafafa',
  panel: '#ffffff',
  teal: '#00A4A6',
  cyan: '#00BCF2',
  pos: '#0d9e6d',
  neg: '#c4314b',
  neu: '#8a8a8a',
  amber: '#c19c00',
} as const

function polarityLabel(p: ThemePolarity): string {
  if (p === 'want') return 'Want'
  if (p === 'dont-like') return "Don't like"
  return 'Mixed'
}

function polarityClass(p: ThemePolarity): string {
  if (p === 'want') return 'border-[#0d9e6d]/30 bg-[#0d9e6d]/10 text-[#0d7a54]'
  if (p === 'dont-like') return 'border-[#c4314b]/28 bg-[#c4314b]/10 text-[#a0283c]'
  return 'border-[#8a8a8a]/28 bg-[#8a8a8a]/10 text-[#5c5c5c]'
}

function coverageLabel(s: CoverageStatus): string {
  if (s === 'covered') return 'Covered'
  if (s === 'partial') return 'Partial'
  return 'Gap'
}

function coverageColor(s: CoverageStatus): string {
  if (s === 'covered') return BI.pos
  if (s === 'partial') return BI.amber
  return BI.neg
}

function actionRank(action: SuggestedAction): number {
  const impact = action.impact === 'high' ? 3 : action.impact === 'medium' ? 2 : 1
  const effort = action.effort === 'low' ? 3 : action.effort === 'medium' ? 2 : 1
  return impact * 10 + effort
}

function TrendChip({ value }: { value: number }) {
  const up = value > 0
  const down = value < 0
  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus
  const color = up ? BI.pos : down ? BI.neg : BI.faint
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums" style={{ color }}>
      <Icon size={12} aria-hidden="true" />
      {formatPct(value, 0)}
    </span>
  )
}

function BiCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-lg border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
      style={{ borderColor: BI.line }}
    >
      {children}
    </section>
  )
}

function BiSectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-[13px] font-semibold tracking-wide" style={{ color: BI.ink }}>
        {title}
      </h2>
      {hint ? (
        <p className="mt-0.5 text-[11px]" style={{ color: BI.faint }}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function FilterChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
      style={{ borderColor: BI.line, color: BI.mute, background: BI.elevated }}
    >
      {label}
    </span>
  )
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  trend,
}: {
  label: string
  value: string
  hint: string
  icon: ReactNode
  trend?: number
}) {
  return (
    <BiCard className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: BI.faint }}>
          {label}
        </p>
        <span style={{ color: BI.teal }}>{icon}</span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold tracking-tight" style={{ color: BI.ink }}>
          {value}
        </p>
        {trend !== undefined ? <TrendChip value={trend} /> : null}
      </div>
      <p className="mt-1 text-[11px] leading-snug" style={{ color: BI.mute }}>
        {hint}
      </p>
    </BiCard>
  )
}

/** Executive BI analytics view — opt-in via mode dropdown. */
export function BiDashboard({
  snapshot,
  view,
  workload,
  cloud,
  themeId,
  setWorkload,
  setThemeId,
}: LayoutProps) {
  const [sortBy, setSortBy] = useState<'volume' | 'sentiment'>('volume')
  const [evidenceTheme, setEvidenceTheme] = useState<ThemeInsight | null>(null)

  const tooltipStyle = {
    background: BI.panel,
    border: `1px solid ${BI.line}`,
    borderRadius: 8,
    fontSize: 12,
    color: BI.ink,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  }

  const mix = [
    { name: 'Positive', value: Math.round(view.kpis.positiveShare * 100), color: BI.pos },
    { name: 'Neutral', value: Math.round(view.kpis.neutralShare * 100), color: BI.neu },
    { name: 'Negative', value: Math.round(view.kpis.negativeShare * 100), color: BI.neg },
  ]

  const workloadBars = useMemo(
    () =>
      view.workloads
        .filter((w) => w.volume > 0)
        .slice(0, 10)
        .map((w) => ({
          id: w.id,
          name: w.shortLabel,
          volume: w.volume,
        })),
    [view.workloads],
  )

  const rankedThemes = useMemo(() => {
    const list = [...view.themes]
    if (sortBy === 'sentiment') {
      list.sort((a, b) => a.sentimentScore - b.sentimentScore || b.mentionCount - a.mentionCount)
    } else {
      list.sort((a, b) => b.mentionCount - a.mentionCount || b.trend - a.trend)
    }
    return list
  }, [view.themes, sortBy])

  const coverageSummary = useMemo(() => {
    const counts: Record<CoverageStatus, number> = { covered: 0, partial: 0, gap: 0 }
    for (const theme of view.themes) {
      const mapping = resolveThemeMapping(theme.id, snapshot.themeMappings, cloud, workload)
      counts[mapping?.coverage ?? 'gap'] += 1
    }
    return counts
  }, [view.themes, snapshot.themeMappings, cloud, workload])

  const topActions = useMemo(
    () =>
      [...snapshot.actions]
        .filter((a) => (workload === 'all' ? true : a.workload === workload))
        .sort((a, b) => actionRank(b) - actionRank(a))
        .slice(0, 5),
    [snapshot.actions, workload],
  )

  const evidenceMentions = useMemo(() => {
    if (!evidenceTheme) return []
    const ids = new Set(evidenceTheme.mentionIds)
    return view.mentions.filter((m) => ids.has(m.id))
  }, [evidenceTheme, view.mentions])

  const workloadLabel =
    workload === 'all' ? 'All workloads' : (WORKLOAD_CATALOG[workload]?.label ?? workload)
  const cloudLabel = formatCloudBoundary(cloud)
  const themeLabel = view.selectedTheme?.name ?? null

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-2 sm:px-6 lg:px-8">
      <header
        className="mb-4 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-end sm:justify-between"
        style={{ borderColor: BI.line }}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: BI.teal }}>
            Fabric Pulse · Analytics
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl" style={{ color: BI.ink }}>
            BI Dashboard
          </h1>
          <p className="mt-1 text-[12px]" style={{ color: BI.mute }}>
            {snapshot.dateRange.label}
            <span className="mx-1.5 opacity-40">·</span>
            Executive sentiment &amp; coverage review
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip label={workloadLabel} />
          <FilterChip label={cloudLabel} />
          {themeLabel ? <FilterChip label={themeLabel} /> : null}
          {themeId ? (
            <button
              type="button"
              onClick={() => setThemeId(null)}
              className="text-[11px] font-medium hover:underline"
              style={{ color: BI.cyan }}
            >
              Clear theme
            </button>
          ) : null}
        </div>
      </header>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Mention volume"
          value={String(view.kpis.volume)}
          hint="Mentions in filtered window"
          icon={<MessageCircle size={16} />}
          trend={view.kpis.volumeTrend}
        />
        <KpiCard
          label="Sentiment mix"
          value={`${formatShare(view.kpis.positiveShare)} / ${formatShare(view.kpis.negativeShare)}`}
          hint={`${formatShare(view.kpis.neutralShare)} neutral · pos / neg`}
          icon={<Scale size={16} />}
        />
        <KpiCard
          label="Net sentiment"
          value={formatNet(view.kpis.netSentiment)}
          hint={`${formatNet(view.kpis.netSentimentTrend)} vs first half`}
          icon={<Activity size={16} />}
          trend={view.kpis.netSentimentTrend * 100}
        />
        <KpiCard
          label="Top rising theme"
          value={view.kpis.topRisingTheme ?? '—'}
          hint="Highest volume growth, H1 → H2"
          icon={<Sparkles size={16} />}
          trend={view.kpis.topRisingThemeTrend}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <BiCard className="p-4 xl:col-span-2">
          <BiSectionTitle
            title="Volume & sentiment over time"
            hint="Daily mention volume with stacked sentiment"
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={view.daily} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={BI.line} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: BI.mute, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: BI.mute, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [String(value), String(name)]} />
                <Bar dataKey="positive" stackId="s" fill={BI.pos} name="Positive" />
                <Bar dataKey="neutral" stackId="s" fill={BI.neu} name="Neutral" />
                <Bar dataKey="negative" stackId="s" fill={BI.neg} name="Negative" radius={[3, 3, 0, 0]} />
                <Area
                  type="monotone"
                  dataKey="volume"
                  fill={BI.teal}
                  fillOpacity={0.06}
                  stroke={BI.teal}
                  strokeWidth={2}
                  name="Volume"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </BiCard>

        <BiCard className="p-4">
          <BiSectionTitle title="Sentiment mix" hint={`Net ${formatNet(view.kpis.netSentiment)}`} />
          <div className="flex h-64 flex-col items-center justify-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={2}
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
            <ul className="mt-1 flex flex-wrap justify-center gap-3 text-[11px]" style={{ color: BI.mute }}>
              {mix.map((slice) => (
                <li key={slice.name} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: slice.color }} />
                  {slice.name} {slice.value}%
                </li>
              ))}
            </ul>
          </div>
        </BiCard>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <BiCard className="p-4 xl:col-span-2">
          <BiSectionTitle
            title={workload === 'all' ? 'Workload comparison' : 'Workload focus'}
            hint={
              workload === 'all'
                ? 'Click a bar to filter · volume by workload'
                : `Showing ${workloadLabel} — use Show all to compare`
            }
          />
          {workload !== 'all' ? (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => {
                  setWorkload('all')
                  setThemeId(null)
                }}
                className="text-[11px] font-medium hover:underline"
                style={{ color: BI.cyan }}
              >
                Show all workloads
              </button>
            </div>
          ) : null}
          <div className="h-56">
            {workloadBars.length === 0 ? (
              <p className="py-16 text-center text-sm" style={{ color: BI.mute }}>
                No workload volume for this filter.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadBars} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid stroke={BI.line} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: BI.mute, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={88} tick={{ fill: BI.ink, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [String(value), String(name)]} />
                  <Bar
                    dataKey="volume"
                    name="Volume"
                    fill={BI.teal}
                    radius={[0, 4, 4, 0]}
                    cursor="pointer"
                    onClick={(data) => {
                      const id = (data as { id?: string })?.id
                      if (!id) return
                      setWorkload(id as typeof workload)
                      setThemeId(null)
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </BiCard>

        <div className="flex flex-col gap-3">
          <BiCard className="p-4">
            <BiSectionTitle title="ADO coverage" hint="Theme → plan mapping" />
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['covered', coverageSummary.covered, CheckCircle2],
                  ['partial', coverageSummary.partial, CircleDashed],
                  ['gap', coverageSummary.gap, Target],
                ] as const
              ).map(([key, count, Icon]) => (
                <div
                  key={key}
                  className="rounded-md border px-2 py-2.5 text-center"
                  style={{ borderColor: BI.line, background: BI.elevated }}
                >
                  <Icon size={14} className="mx-auto mb-1" style={{ color: coverageColor(key) }} />
                  <p className="text-lg font-semibold tabular-nums" style={{ color: BI.ink }}>
                    {count}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: BI.faint }}>
                    {coverageLabel(key)}
                  </p>
                </div>
              ))}
            </div>
          </BiCard>

          <BiCard className="flex-1 p-4">
            <BiSectionTitle title="Top actions" hint="Highest impact · filtered" />
            {topActions.length === 0 ? (
              <p className="text-sm" style={{ color: BI.mute }}>
                No actions for this filter.
              </p>
            ) : (
              <ul className="space-y-2">
                {topActions.map((action) => (
                  <li
                    key={action.id}
                    className="rounded-md border px-2.5 py-2"
                    style={{ borderColor: BI.line, background: BI.elevated }}
                  >
                    <p className="text-[12px] font-medium leading-snug" style={{ color: BI.ink }}>
                      {action.title}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-1.5 text-[10px]" style={{ color: BI.faint }}>
                      <span>{WORKLOAD_CATALOG[action.workload]?.shortLabel ?? action.workload}</span>
                      <span>·</span>
                      <span>Impact {action.impact}</span>
                      <span>·</span>
                      <span>Effort {action.effort}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </BiCard>
        </div>
      </div>

      <BiCard className="overflow-hidden">
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3"
          style={{ borderColor: BI.line }}
        >
          <div>
            <h2 className="text-[13px] font-semibold tracking-wide" style={{ color: BI.ink }}>
              Themes ranked
            </h2>
            <p className="mt-0.5 text-[11px]" style={{ color: BI.faint }}>
              Volume, sentiment, polarity, evidence
            </p>
          </div>
          <div className="flex gap-1">
            {(
              [
                ['volume', 'By volume'],
                ['sentiment', 'By sentiment'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSortBy(id)}
                className="rounded-full px-2.5 py-1 text-[11px] font-medium transition"
                style={
                  sortBy === id
                    ? { background: `${BI.teal}18`, color: BI.teal }
                    : { color: BI.mute }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {rankedThemes.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm" style={{ color: BI.mute }}>
            No themes match this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[12px]">
              <thead>
                <tr
                  className="border-b text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ borderColor: BI.line, color: BI.faint, background: BI.elevated }}
                >
                  <th className="px-4 py-2.5 font-semibold">Theme</th>
                  <th className="px-3 py-2.5 font-semibold">Polarity</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Vol</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Net</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Trend</th>
                  <th className="px-3 py-2.5 font-semibold">Coverage</th>
                  <th className="px-4 py-2.5 font-semibold">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {rankedThemes.map((theme) => {
                  const mapping = resolveThemeMapping(
                    theme.id,
                    snapshot.themeMappings,
                    cloud,
                    workload,
                  )
                  const status: CoverageStatus = mapping?.coverage ?? 'gap'
                  const active = theme.id === themeId
                  return (
                    <tr
                      key={theme.id}
                      className="border-b transition"
                      style={{
                        borderColor: BI.line,
                        background: active ? `${BI.teal}0d` : undefined,
                      }}
                    >
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => setThemeId(active ? null : theme.id)}
                          className="text-left"
                        >
                          <span className="block font-medium leading-snug" style={{ color: BI.ink }}>
                            {theme.name}
                          </span>
                          <span className="mt-0.5 line-clamp-1 block text-[11px]" style={{ color: BI.faint }}>
                            {theme.description}
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${polarityClass(theme.polarity)}`}
                        >
                          {polarityLabel(theme.polarity)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums" style={{ color: BI.ink }}>
                        {theme.mentionCount}
                      </td>
                      <td
                        className="px-3 py-2.5 text-right tabular-nums"
                        style={{
                          color:
                            theme.sentimentScore > 0.1
                              ? BI.pos
                              : theme.sentimentScore < -0.1
                                ? BI.neg
                                : BI.mute,
                        }}
                      >
                        {formatNet(theme.sentimentScore)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <TrendChip value={theme.trend} />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full" style={{ background: coverageColor(status) }} />
                          <span style={{ color: BI.mute }}>{coverageLabel(status)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <EvidenceBadge
                          mentionCount={theme.mentionCount}
                          uniqueAuthors={theme.uniqueAuthorCount}
                          volumeClass={theme.volumeClass}
                          tone="light"
                          compact
                          onClick={() => setEvidenceTheme(theme)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </BiCard>

      <footer
        className="mt-6 flex flex-wrap items-center justify-between gap-2 text-[11px]"
        style={{ color: BI.faint }}
      >
        <span className="inline-flex items-center gap-1.5">
          <BarChart3 size={12} aria-hidden="true" />
          Demo corpus · {snapshot.demoDisclaimer}
        </span>
        <span>
          {snapshot.dateRange.label} · mode: bi-dashboard
        </span>
      </footer>

      <EvidenceSheet
        open={Boolean(evidenceTheme)}
        onOpenChange={(open) => {
          if (!open) setEvidenceTheme(null)
        }}
        title={evidenceTheme?.name ?? ''}
        mentionCount={evidenceTheme?.mentionCount ?? 0}
        uniqueAuthors={evidenceTheme?.uniqueAuthorCount ?? 0}
        volumeClass={evidenceTheme?.volumeClass ?? 'single'}
        mentions={evidenceMentions}
      />
    </div>
  )
}
