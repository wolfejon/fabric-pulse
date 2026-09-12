import { useMemo, useState } from 'react'
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import type { ThemeInsight, WorkloadId, WorkloadStat } from '../../types'
import { WORKLOAD_CATALOG } from '../../data/catalog'
import { actionRank } from '../../layout/brief'
import { formatNet, formatPct, initials, relativeFrom } from '../../lib/format'
import { useThemeColors } from '../../theme/colors'
import { Card, EffortImpact, SectionTitle, SentimentPill, ToneBadge } from '../ui'
import type { LayoutProps } from './types'

type Grain = 'theme' | 'workload'

type CellDatum = {
  name: string
  size: number
  net: number
  trend: number
  id: string
  kind: Grain
}

function netToColor(net: number, pos: string, neg: string, neu: string): string {
  if (net >= 0.2) return pos
  if (net >= 0.05) return mixHex(pos, neu, 0.45)
  if (net > -0.05) return neu
  if (net > -0.25) return mixHex(neg, neu, 0.35)
  return neg
}

function mixHex(a: string, b: string, t: number): string {
  const pa = parseHex(a)
  const pb = parseHex(b)
  if (!pa || !pb) return a
  const r = Math.round(pa.r + (pb.r - pa.r) * t)
  const g = Math.round(pa.g + (pb.g - pa.g) * t)
  const bl = Math.round(pa.b + (pb.b - pa.b) * t)
  return `rgb(${r},${g},${bl})`
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    const r = parseInt(clean[0]! + clean[0]!, 16)
    const g = parseInt(clean[1]! + clean[1]!, 16)
    const b = parseInt(clean[2]! + clean[2]!, 16)
    return { r, g, b }
  }
  if (clean.length >= 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    }
  }
  const rgb = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgb) return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) }
  return null
}

function themeCells(themes: ThemeInsight[]): CellDatum[] {
  return themes.map((theme) => ({
    name: theme.name,
    size: theme.mentionCount,
    net: theme.sentimentScore,
    trend: theme.trend,
    id: theme.id,
    kind: 'theme' as const,
  }))
}

function workloadCells(workloads: WorkloadStat[]): CellDatum[] {
  return workloads
    .filter((w) => w.volume > 0)
    .map((w) => ({
      name: w.shortLabel,
      size: w.volume,
      net: w.netSentiment,
      trend: w.trend,
      id: w.id,
      kind: 'workload' as const,
    }))
}

function TreemapTile(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  net?: number
  size?: number
  id?: string
  selectedId?: string | null
  colors: ReturnType<typeof useThemeColors>
  onSelect: (id: string) => void
}) {
  const { x = 0, y = 0, width = 0, height = 0, name = '', net = 0, size = 0, id = '', selectedId, colors, onSelect } =
    props
  if (width < 2 || height < 2) return null
  const fill = netToColor(net, colors.pos, colors.neg, colors.neu)
  const selected = selectedId === id
  const showLabel = width > 56 && height > 36

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={() => onSelect(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(id)
        }
      }}
    >
      <rect
        x={x + 1}
        y={y + 1}
        width={Math.max(0, width - 2)}
        height={Math.max(0, height - 2)}
        rx={6}
        fill={fill}
        fillOpacity={selected ? 0.92 : 0.72}
        stroke={selected ? colors.tealBright : colors.canvas}
        strokeWidth={selected ? 2.5 : 1}
      />
      {showLabel ? (
        <foreignObject x={x + 6} y={y + 6} width={Math.max(0, width - 12)} height={Math.max(0, height - 12)}>
          <div className="pointer-events-none flex h-full flex-col justify-between overflow-hidden text-left">
            <p className="text-[11px] font-semibold leading-tight text-ink drop-shadow-sm" style={{ color: colors.ink }}>
              {name}
            </p>
            <p className="text-[10px] tabular-nums" style={{ color: colors.ink, opacity: 0.85 }}>
              {size} · {formatNet(net)}
            </p>
          </div>
        </foreignObject>
      ) : null}
    </g>
  )
}

export function VolumePainMap({
  snapshot,
  view,
  workload,
  themeId,
  setWorkload,
  setThemeId,
}: LayoutProps) {
  const colors = useThemeColors()
  const [grain, setGrain] = useState<Grain>('theme')
  const [showClassicCharts, setShowClassicCharts] = useState(false)

  const cells = useMemo(
    () => (grain === 'theme' ? themeCells(view.themes) : workloadCells(view.workloads)),
    [grain, view.themes, view.workloads],
  )

  const selectedId = grain === 'theme' ? themeId : workload === 'all' ? null : workload
  const selectedCell = cells.find((c) => c.id === selectedId) ?? null

  const sampleMentions = useMemo(() => {
    if (!selectedCell) return view.mentions.slice(0, 4)
    if (selectedCell.kind === 'theme') {
      const theme = view.themes.find((t) => t.id === selectedCell.id)
      if (!theme) return []
      return view.mentions.filter((m) => theme.mentionIds.includes(m.id)).slice(0, 5)
    }
    return view.mentions.filter((m) => m.workload === selectedCell.id).slice(0, 5)
  }, [selectedCell, view.mentions, view.themes])

  const topAction = useMemo(() => {
    const pool = snapshot.actions
      .filter((action) => {
        if (!selectedCell) return true
        if (selectedCell.kind === 'workload') return action.workload === selectedCell.id
        return action.relatedThemeIds.includes(selectedCell.id)
      })
      .sort((a, b) => actionRank(b) - actionRank(a))
    return pool[0] ?? snapshot.actions.slice().sort((a, b) => actionRank(b) - actionRank(a))[0] ?? null
  }, [selectedCell, snapshot.actions])

  const onSelectCell = (id: string) => {
    if (grain === 'theme') {
      setThemeId(themeId === id ? null : id)
    } else {
      const next = (workload === id ? 'all' : id) as WorkloadId | 'all'
      setWorkload(next)
      setThemeId(null)
    }
  }

  const treemapData = cells.map((cell) => ({
    ...cell,
    // recharts Treemap uses `size` via dataKey
  }))

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-3">
        <Card className="p-4">
          <SectionTitle
            title="Diagnosis Object · Volume × Pain"
            hint="Diagnosis Object: tile size = mention volume · color = net sentiment (pain). Click to filter. Demo data."
            action={
              <div className="flex gap-1">
                {(
                  [
                    ['theme', 'Themes'],
                    ['workload', 'Workloads'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setGrain(id)
                      setThemeId(null)
                      if (id === 'theme') setWorkload('all')
                    }}
                    className={`rounded-full px-2.5 py-1 text-[11px] ${
                      grain === id ? 'bg-teal/20 text-teal-bright' : 'text-mute hover:bg-elevated'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          />
          <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] text-mute">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: colors.pos }} /> Pain low / positive
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: colors.neu }} /> Neutral
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: colors.neg }} /> Pain high / negative
            </span>
            {selectedCell ? (
              <button
                type="button"
                onClick={() => {
                  setThemeId(null)
                  setWorkload('all')
                }}
                className="rounded-full border border-teal/40 bg-teal/10 px-2.5 py-0.5 text-teal-bright"
              >
                Clear · {selectedCell.name}
              </button>
            ) : null}
          </div>
          <div className="h-[420px] w-full overflow-hidden rounded-xl border border-line bg-canvas/40">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                nameKey="name"
                stroke={colors.canvas}
                isAnimationActive={false}
                content={(nodeProps) => (
                  <TreemapTile
                    {...(nodeProps as object)}
                    selectedId={selectedId}
                    colors={colors}
                    onSelect={onSelectCell}
                  />
                )}
              >
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null
                    const row = payload[0].payload as CellDatum
                    return (
                      <div
                        className="rounded-lg border px-3 py-2 text-xs shadow-lg"
                        style={{
                          background: colors.elevated,
                          borderColor: colors.line,
                          color: colors.ink,
                        }}
                      >
                        <p className="font-semibold">{row.name}</p>
                        <p className="mt-1 opacity-80">
                          Volume {row.size} · net {formatNet(row.net)} · Δ {formatPct(row.trend)}
                        </p>
                      </div>
                    )
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </Card>

        <div>
          <button
            type="button"
            onClick={() => setShowClassicCharts((v) => !v)}
            className="text-xs text-mute underline-offset-2 hover:text-ink hover:underline"
          >
            {showClassicCharts ? 'Hide' : 'Show'} classic stacked charts (demoted)
          </button>
          {showClassicCharts ? (
            <div className="mt-2 opacity-90">
              {/* lazy import avoided — inline thin KPI strip only */}
              <Card className="p-4">
                <SectionTitle
                  title="Classic charts (demoted)"
                  hint="Volume×Pain is primary; stacked bars kept for compare."
                />
                <p className="text-xs text-mute">
                  Switch to <span className="text-ink">Classic</span> layout for the full chart row, or use
                  Morning Brief Explore.
                </p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                  {view.daily.map((d) => (
                    <li key={d.date} className="rounded-lg border border-line bg-elevated/30 px-3 py-2 text-xs">
                      <p className="font-medium text-ink">{d.label}</p>
                      <p className="text-mute">
                        vol {d.volume} · net {formatNet(d.net)}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="flex flex-col gap-3">
        <Card className="p-4">
          <SectionTitle
            title={selectedCell ? selectedCell.name : 'All Fabric'}
            hint={
              selectedCell
                ? `${selectedCell.size} mentions · net ${formatNet(selectedCell.net)}`
                : 'Select a tile for scoped evidence'
            }
          />
          <ul className="max-h-72 space-y-2 overflow-auto pr-1">
            {sampleMentions.map((mention) => (
              <li key={mention.id} className="rounded-lg border border-line bg-elevated/40 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-teal/15 text-[10px] font-semibold text-teal-bright">
                    {initials(mention.author)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink">{mention.handle}</p>
                    <p className="text-[10px] text-faint">
                      {relativeFrom(mention.createdAt, snapshot.generatedAt)}
                    </p>
                  </div>
                  <SentimentPill sentiment={mention.sentiment} />
                </div>
                <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink/90">{mention.text}</p>
              </li>
            ))}
          </ul>
        </Card>

        {topAction ? (
          <Card className="p-4">
            <SectionTitle title="Top action" hint="Ranked impact × effort for this scope" />
            <p className="text-sm font-medium text-ink">{topAction.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-mute">{topAction.rationale}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <EffortImpact effort={topAction.effort} impact={topAction.impact} />
              <ToneBadge tone="teal" label={WORKLOAD_CATALOG[topAction.workload].shortLabel} />
              <ToneBadge tone="mute" label={topAction.ownerHint} />
            </div>
          </Card>
        ) : null}
      </aside>
    </div>
  )
}
