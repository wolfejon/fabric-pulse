import { useEffect, useMemo, useState } from 'react'
import { ResponsiveTreeMap } from '@nivo/treemap'
import type { ComputedNode, NodeProps, TooltipProps } from '@nivo/treemap'
import { animated, to } from '@react-spring/web'
import { AnimatePresence, motion } from 'motion/react'
import { Drawer } from 'vaul'
import { X } from 'lucide-react'
import type { ThemeInsight, WorkloadId, WorkloadStat } from '../../types'
import { WORKLOAD_CATALOG } from '../../data/catalog'
import { actionRank } from '../../layout/brief'
import { formatNet, formatPct, initials, relativeFrom } from '../../lib/format'
import { useThemeColors, type ThemeColors } from '../../theme/colors'
import { Card, EffortImpact, EmptyState, SentimentPill, ToneBadge } from '../ui'
import type { LayoutProps } from './types'

type Grain = 'theme' | 'workload'

type PulseTreeNode = {
  id: string
  name: string
  value?: number
  net?: number
  trend?: number
  kind?: Grain
  children?: PulseTreeNode[]
}

type LeafMeta = {
  id: string
  name: string
  value: number
  net: number
  trend: number
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
    return {
      r: parseInt(clean[0]! + clean[0]!, 16),
      g: parseInt(clean[1]! + clean[1]!, 16),
      b: parseInt(clean[2]! + clean[2]!, 16),
    }
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

function themeLeaves(themes: ThemeInsight[]): LeafMeta[] {
  return themes.map((theme) => ({
    id: theme.id,
    name: theme.name,
    value: theme.mentionCount,
    net: theme.sentimentScore,
    trend: theme.trend,
    kind: 'theme' as const,
  }))
}

function workloadLeaves(workloads: WorkloadStat[]): LeafMeta[] {
  return workloads
    .filter((w) => w.volume > 0)
    .map((w) => ({
      id: w.id,
      name: w.shortLabel,
      value: w.volume,
      net: w.netSentiment,
      trend: w.trend,
      kind: 'workload' as const,
    }))
}

function leafFromNode(node: ComputedNode<PulseTreeNode>): LeafMeta | null {
  const data = node.data
  if (data.net === undefined || data.kind === undefined || data.value === undefined) return null
  return {
    id: data.id,
    name: data.name,
    value: data.value,
    net: data.net,
    trend: data.trend ?? 0,
    kind: data.kind,
  }
}

function PulseTooltip({ node }: TooltipProps<PulseTreeNode>) {
  const leaf = leafFromNode(node)
  if (!leaf) return null
  return (
    <div className="rounded-lg border border-line bg-elevated px-3 py-2 text-xs text-ink shadow-lg">
      <p className="font-semibold">{leaf.name}</p>
      <p className="mt-1 text-mute">
        Volume {leaf.value} · net {formatNet(leaf.net)} · Δ {formatPct(leaf.trend)}
      </p>
      <p className="mt-1 text-[10px] text-faint">Click to diagnose</p>
    </div>
  )
}

function createPulseNode(selectedId: string | null, colors: ThemeColors) {
  return function PulseTreeMapNode({
    node,
    animatedProps,
    enableLabel,
    labelSkipSize,
  }: NodeProps<PulseTreeNode>) {
    if (!node.isLeaf) return null

    const leaf = leafFromNode(node)
    const fill = leaf
      ? netToColor(leaf.net, colors.pos, colors.neg, colors.neu)
      : node.color
    const selected = leaf !== null && selectedId === leaf.id
    const dimmed = selectedId !== null && !selected
    const showLabel =
      enableLabel &&
      (labelSkipSize === 0 || Math.min(node.width, node.height) > labelSkipSize) &&
      node.width > 52 &&
      node.height > 34

    return (
      <animated.g
        transform={to([animatedProps.x, animatedProps.y], (x, y) => `translate(${x},${y})`)}
        style={{ cursor: 'pointer' }}
      >
        <animated.rect
          data-testid={`node.${node.id}`}
          width={to(animatedProps.width, (w) => Math.max(w - 2, 0))}
          height={to(animatedProps.height, (h) => Math.max(h - 2, 0))}
          x={1}
          y={1}
          rx={7}
          ry={7}
          fill={fill}
          fillOpacity={dimmed ? 0.38 : selected ? 0.95 : 0.78}
          stroke={selected ? colors.tealBright : colors.canvas}
          strokeWidth={selected ? 2.5 : 1}
          onMouseEnter={node.onMouseEnter}
          onMouseMove={node.onMouseMove}
          onMouseLeave={node.onMouseLeave}
          onClick={node.onClick}
        />
        {showLabel && leaf ? (
          <foreignObject x={8} y={8} width={Math.max(node.width - 16, 0)} height={Math.max(node.height - 16, 0)}>
            <div className="pointer-events-none flex h-full flex-col justify-between overflow-hidden text-left">
              <p
                className="text-[11px] font-semibold leading-tight drop-shadow-sm"
                style={{ color: colors.ink }}
              >
                {leaf.name}
              </p>
              <p className="text-[10px] tabular-nums" style={{ color: colors.ink, opacity: 0.88 }}>
                {leaf.value} · {formatNet(leaf.net)}
              </p>
            </div>
          </foreignObject>
        ) : null}
      </animated.g>
    )
  }
}

function EvidenceBody({
  selectedCell,
  sampleMentions,
  topAction,
  generatedAt,
  onClear,
}: {
  selectedCell: LeafMeta | null
  sampleMentions: LayoutProps['view']['mentions']
  topAction: LayoutProps['snapshot']['actions'][number] | null
  generatedAt: string
  onClear: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-faint">Evidence</p>
          <h3 className="mt-1 text-sm font-semibold text-ink">
            {selectedCell ? selectedCell.name : 'All Fabric'}
          </h3>
          <p className="mt-0.5 text-xs text-mute">
            {selectedCell
              ? `${selectedCell.value} mentions · net ${formatNet(selectedCell.net)} · Δ ${formatPct(selectedCell.trend)}`
              : 'Select a tile for scoped samples + a recommended move'}
          </p>
        </div>
        {selectedCell ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-line bg-elevated/60 p-1.5 text-mute hover:text-ink"
            aria-label="Clear selection"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium text-mute">Sample mentions</p>
        {sampleMentions.length === 0 ? (
          <EmptyState label="No mentions in this scope" />
        ) : (
          <ul className="max-h-72 space-y-2 overflow-auto pr-1">
            {sampleMentions.map((mention) => (
              <li key={mention.id} className="rounded-lg border border-line bg-elevated/40 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-teal/15 text-[10px] font-semibold text-teal-bright">
                    {initials(mention.author)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink">{mention.handle}</p>
                    <p className="text-[10px] text-faint">{relativeFrom(mention.createdAt, generatedAt)}</p>
                  </div>
                  <SentimentPill sentiment={mention.sentiment} />
                </div>
                <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink/90">{mention.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {topAction ? (
        <div className="rounded-xl border border-line bg-elevated/35 p-3">
          <p className="text-[11px] font-medium text-mute">Top suggested action</p>
          <p className="mt-1.5 text-sm font-medium text-ink">{topAction.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-mute">{topAction.rationale}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <EffortImpact effort={topAction.effort} impact={topAction.impact} />
            <ToneBadge tone="teal" label={WORKLOAD_CATALOG[topAction.workload].shortLabel} />
            <ToneBadge tone="mute" label={topAction.ownerHint} />
          </div>
        </div>
      ) : null}
    </div>
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const leaves = useMemo(
    () => (grain === 'theme' ? themeLeaves(view.themes) : workloadLeaves(view.workloads)),
    [grain, view.themes, view.workloads],
  )

  const treeData = useMemo<PulseTreeNode>(
    () => ({
      id: 'fabric',
      name: 'Fabric',
      children: leaves.map((leaf) => ({
        id: leaf.id,
        name: leaf.name,
        value: leaf.value,
        net: leaf.net,
        trend: leaf.trend,
        kind: leaf.kind,
      })),
    }),
    [leaves],
  )

  const selectedId = grain === 'theme' ? themeId : workload === 'all' ? null : workload
  const selectedCell = leaves.find((c) => c.id === selectedId) ?? null
  const hudLabel = hoveredId
    ? (leaves.find((l) => l.id === hoveredId)?.name ?? null)
    : selectedCell?.name ?? null

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

  const onClear = () => {
    setThemeId(null)
    setWorkload('all')
  }

  useEffect(() => {
    if (!selectedCell) {
      setDrawerOpen(false)
      return
    }
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1279px)').matches) {
      setDrawerOpen(true)
    }
  }, [selectedCell?.id])

  const nodeComponent = useMemo(() => createPulseNode(selectedId, colors), [selectedId, colors])

  const nivoTheme = useMemo(
    () => ({
      background: 'transparent',
      text: { fill: colors.ink, fontSize: 11, fontFamily: 'inherit' },
      tooltip: {
        container: {
          background: colors.elevated,
          color: colors.ink,
          fontSize: 12,
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        },
      },
    }),
    [colors],
  )

  const evidenceProps = {
    selectedCell,
    sampleMentions,
    topAction,
    generatedAt: snapshot.generatedAt,
    onClear,
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Thin HUD — not a KPI card wall */}
      <motion.div
        layout
        className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-line bg-panel/70 px-4 py-2.5 backdrop-blur-sm"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-faint">Diagnosis Object</p>
          <p className="truncate text-sm font-semibold text-ink">Volume × Pain organism</p>
        </div>
        <div className="h-8 w-px bg-line max-sm:hidden" />
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs">
          <span className="tabular-nums text-mute">
            Net{' '}
            <strong className="text-ink">{formatNet(view.kpis.netSentiment)}</strong>
            <span className="ml-1 text-faint">({formatPct(view.kpis.netSentimentTrend)})</span>
          </span>
          <span className="tabular-nums text-mute">
            Volume <strong className="text-ink">{view.kpis.volume}</strong>
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={hudLabel ?? 'all'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="tabular-nums text-mute"
            >
              Focus{' '}
              <strong className="text-teal-bright">{hudLabel ?? 'All Fabric'}</strong>
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full border border-line bg-elevated/40 p-0.5">
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
                className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                  grain === id ? 'bg-teal/20 text-teal-bright' : 'text-mute hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-2 text-[10px] text-mute sm:flex">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-sm" style={{ background: colors.pos }} /> +
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-sm" style={{ background: colors.neu }} /> ~
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-sm" style={{ background: colors.neg }} /> pain
            </span>
          </div>
          {selectedCell ? (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-full border border-teal/40 bg-teal/10 px-2.5 py-1 text-[11px] text-teal-bright xl:hidden"
            >
              Open evidence
            </button>
          ) : null}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="relative overflow-hidden p-0">
          <div className="border-b border-line px-4 py-3">
            <p className="text-xs text-mute">
              Size = mention volume · color = net sentiment (pain). Click a tile to filter &amp; open the
              evidence rail. Demo data.
            </p>
          </div>
          <div className="h-[min(62vh,560px)] w-full bg-canvas/30">
            {leaves.length === 0 ? (
              <div className="flex h-full items-center justify-center p-6">
                <EmptyState label="No themes in range" />
              </div>
            ) : (
              <ResponsiveTreeMap<PulseTreeNode>
                data={treeData}
                identity="id"
                value="value"
                valueFormat=".0f"
                leavesOnly
                tile="squarify"
                innerPadding={3}
                outerPadding={4}
                margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                colors={(node) => {
                  const net = (node.data as PulseTreeNode).net
                  if (typeof net !== 'number') return colors.neu
                  return netToColor(net, colors.pos, colors.neg, colors.neu)
                }}
                nodeOpacity={1}
                borderWidth={0}
                enableLabel={false}
                enableParentLabel={false}
                animate
                motionConfig="gentle"
                isInteractive
                nodeComponent={nodeComponent}
                tooltip={PulseTooltip}
                theme={nivoTheme}
                onClick={(node) => {
                  const leaf = leafFromNode(node)
                  if (leaf) onSelectCell(leaf.id)
                }}
                onMouseEnter={(node) => {
                  const leaf = leafFromNode(node)
                  setHoveredId(leaf?.id ?? null)
                }}
                onMouseLeave={() => setHoveredId(null)}
                role="img"
                ariaLabel="Diagnosis Object volume by pain treemap"
              />
            )}
          </div>
        </Card>

        {/* Desktop evidence rail */}
        <motion.aside
          layout
          className="hidden xl:block"
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        >
          <Card className="sticky top-3 p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCell?.id ?? 'all'}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <EvidenceBody {...evidenceProps} />
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.aside>
      </div>

      {/* Mobile / tablet evidence sheet (vaul) */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/45 xl:hidden" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[85vh] flex-col rounded-t-2xl border border-line bg-panel outline-none xl:hidden">
            <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-line" />
            <div className="overflow-auto p-4 pb-8">
              <Drawer.Title className="sr-only">Evidence rail</Drawer.Title>
              <Drawer.Description className="sr-only">
                Sample mentions and top suggested action for the selected tile
              </Drawer.Description>
              <EvidenceBody {...evidenceProps} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

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
            <Card className="p-4">
              <p className="text-sm font-semibold text-ink">Classic charts (demoted)</p>
              <p className="mt-1 text-xs text-mute">
                Volume×Pain is primary; switch to <span className="text-ink">Classic</span> layout for the
                full chart row.
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
  )
}
