import { useMemo, useState, type ReactNode } from 'react'
import {
  Activity,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Maximize2,
  Minus,
  RefreshCw,
  X,
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
import { FabricMark } from '../atelier/FabricMark'
import { WORKLOAD_CATALOG } from '../../data/catalog'
import { DEMO_COMPETITOR_FEATURES, featuresForWorkload } from '../../data/competitors'
import { resolveThemeMapping, workItemsForMapping } from '../../lib/aggregate'
import { formatCloudBoundary, formatNet, formatPct, formatShare } from '../../lib/format'
import type {
  CompetitorFeature,
  CoverageStatus,
  DependencyRequest,
  FabricCompetitorStatus,
  SuggestedAction,
  ThemeInsight,
  ThemePolarity,
  ThemeSignalMapping,
  WorkItem,
  WorkloadId,
} from '../../types'
import type { LayoutProps } from './types'
import { WhyItMattersChip } from '../atelier/WhyItMattersChip'

/** Fluent / Fabric BI tokens — exec analytics, not atelier. */
const BI = {
  canvas: '#f5f5f5',
  line: '#e1dfdd',
  stroke: '#e0e0e0',
  ink: '#242424',
  mute: '#616161',
  faint: '#8a8886',
  elevated: '#faf9f8',
  panel: '#ffffff',
  teal: '#00A4A6',
  cyan: '#00BCF2',
  purple: '#7A3FF2',
  select: '#f0f6ff',
  pos: '#0d9e6d',
  neg: '#c4314b',
  neu: '#a0aeb2',
  amber: '#c19c00',
  grid: '#ebebeb',
  shadow: '0 0.3px 0.9px rgba(0,0,0,0.12), 0 1.6px 3.6px rgba(0,0,0,0.08)',
} as const

type RoadmapKind = 'on-roadmap' | 'planned' | 'partial' | 'not-planned'

const OPEN_WI_STATES = new Set([
  'new',
  'active',
  'committed',
  'proposed',
  'in progress',
  'approved',
])

function isOpenWorkItem(wi: WorkItem): boolean {
  return OPEN_WI_STATES.has(wi.state.toLowerCase())
}

function polarityLabel(p: ThemePolarity): string {
  if (p === 'want') return 'Want'
  if (p === 'dont-like') return "Don't like"
  return 'Mixed'
}

function polarityClass(p: ThemePolarity): string {
  if (p === 'want') return 'border-[#0d9e6d]/30 bg-[#0d9e6d]/10 text-[#0d7a54]'
  if (p === 'dont-like') return 'border-[#c4314b]/28 bg-[#c4314b]/10 text-[#a0283c]'
  return 'border-[#a0aeb2]/40 bg-[#a0aeb2]/12 text-[#5c5c5c]'
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

/** Derive roadmap visibility from mapping + linked work items. */
function resolveRoadmap(
  mapping: ThemeSignalMapping | null,
  workItems: WorkItem[],
): { kind: RoadmapKind; label: string; color: string; primaryWi: WorkItem | null } {
  const coverage: CoverageStatus = mapping?.coverage ?? 'gap'
  const open = workItems.filter(isOpenWorkItem)
  const primaryWi = open[0] ?? workItems[0] ?? null

  if (coverage === 'covered') {
    return { kind: 'on-roadmap', label: 'On roadmap', color: BI.pos, primaryWi }
  }
  if (coverage === 'partial') {
    return { kind: 'partial', label: 'Partial', color: BI.amber, primaryWi }
  }
  if (workItems.length > 0) {
    return { kind: 'planned', label: 'Planned', color: BI.purple, primaryWi }
  }
  return { kind: 'not-planned', label: 'Not planned', color: BI.neg, primaryWi: null }
}

function competitorStatusLabel(s: FabricCompetitorStatus): string {
  if (s === 'ships') return 'Ships'
  if (s === 'planned') return 'Planned'
  if (s === 'gap') return 'Gap'
  return 'Unknown'
}

function competitorStatusStyle(s: FabricCompetitorStatus): { bg: string; fg: string; border: string } {
  if (s === 'ships') return { bg: '#0d9e6d14', fg: BI.pos, border: '#0d9e6d40' }
  if (s === 'planned') return { bg: '#7A3FF214', fg: '#5a3a9a', border: '#7A3FF240' }
  if (s === 'gap') return { bg: '#c4314b12', fg: BI.neg, border: '#c4314b35' }
  return { bg: BI.elevated, fg: BI.mute, border: BI.line }
}

function actionRank(action: SuggestedAction): number {
  const impact = action.impact === 'high' ? 3 : action.impact === 'medium' ? 2 : 1
  const effort = action.effort === 'low' ? 3 : action.effort === 'medium' ? 2 : 1
  return impact * 10 + effort
}

function TrendChip({ value }: { value: number }) {
  const up = value > 0
  const down = value < 0
  const Icon = up ? ChevronUp : down ? ChevronDown : Minus
  const color = up ? BI.pos : down ? BI.neg : BI.faint
  return (
    <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums" style={{ color }}>
      <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
      {formatPct(value, 0)}
    </span>
  )
}

function BiCard({
  children,
  className = '',
  title,
  hint,
  lead = false,
  menu = true,
}: {
  children: ReactNode
  className?: string
  title?: string
  hint?: string
  lead?: boolean
  menu?: boolean
}) {
  return (
    <section
      className={`relative overflow-hidden rounded bg-white ${className}`}
      style={{
        border: `1px solid ${BI.line}`,
        boxShadow: BI.shadow,
        borderRadius: 4,
      }}
    >
      {lead ? (
        <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: BI.cyan }} aria-hidden="true" />
      ) : null}
      {title ? (
        <div
          className="flex items-start justify-between gap-2 border-b px-4 py-2.5"
          style={{ borderColor: BI.line }}
        >
          <div className="min-w-0">
            <h2 className="text-[13px] font-semibold tracking-tight" style={{ color: BI.ink }}>
              {title}
            </h2>
            {hint ? (
              <p className="mt-0.5 text-[11px]" style={{ color: BI.faint }}>
                {hint}
              </p>
            ) : null}
          </div>
          {menu ? (
            <button
              type="button"
              className="rounded px-1.5 py-0.5 text-[14px] leading-none hover:bg-black/5"
              style={{ color: BI.faint }}
              aria-label="More options"
              title="More"
            >
              ···
            </button>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

function StatusChip({
  label,
  color,
  title,
}: {
  label: string
  color: string
  title?: string
}) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]"
      style={{
        borderColor: `${color}55`,
        background: `${color}12`,
        color,
        borderRadius: 4,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}

function Scorecard({
  label,
  value,
  hint,
  trend,
  lead = false,
}: {
  label: string
  value: string
  hint: string
  trend?: number
  lead?: boolean
}) {
  return (
    <BiCard lead={lead} menu={false} className="p-4">
      <p className="text-[11px] font-normal" style={{ color: BI.mute }}>
        {label}
      </p>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <p
          className="text-[28px] font-semibold leading-none tracking-tight tabular-nums"
          style={{ color: BI.ink }}
        >
          {value}
        </p>
        {trend !== undefined ? <TrendChip value={trend} /> : null}
      </div>
      <p className="mt-2 text-[11px] leading-snug" style={{ color: BI.faint }}>
        {hint}
      </p>
    </BiCard>
  )
}

function ThemeDetailPanel({
  theme,
  mapping,
  workItems,
  deps,
  semesterName,
  roadmap,
  onClose,
  onEvidence,
}: {
  theme: ThemeInsight
  mapping: ThemeSignalMapping | null
  workItems: WorkItem[]
  deps: DependencyRequest[]
  semesterName: string | null
  roadmap: ReturnType<typeof resolveRoadmap>
  onClose: () => void
  onEvidence: () => void
}) {
  const coverage: CoverageStatus = mapping?.coverage ?? 'gap'
  const empty = workItems.length === 0 && deps.length === 0

  return (
    <aside
      className="rounded border bg-white"
      style={{ borderColor: BI.line, boxShadow: BI.shadow, borderRadius: 4 }}
    >
      <div
        className="flex items-start justify-between gap-2 border-b px-4 py-3"
        style={{ borderColor: BI.line }}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: BI.faint }}>
            Theme detail · ADO plan mirror
          </p>
          <h3 className="mt-1 text-[16px] font-semibold tracking-tight" style={{ color: BI.ink }}>
            {theme.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusChip label={coverageLabel(coverage)} color={coverageColor(coverage)} />
            <StatusChip label={roadmap.label} color={roadmap.color} />
            {semesterName ? (
              <span className="text-[11px]" style={{ color: BI.mute }}>
                {semesterName}
              </span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 hover:bg-black/5"
          style={{ color: BI.mute }}
          aria-label="Close detail"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4 px-4 py-3">
        <EvidenceBadge
          mentionCount={theme.mentionCount}
          uniqueAuthors={theme.uniqueAuthorCount}
          volumeClass={theme.volumeClass}
          tone="light"
          onClick={onEvidence}
        />

        {mapping?.notes ? (
          <p className="text-[12px] leading-relaxed" style={{ color: BI.mute }}>
            {mapping.notes}
          </p>
        ) : null}

        {roadmap.kind === 'planned' && roadmap.primaryWi ? (
          <div
            className="rounded border px-3 py-2"
            style={{ borderColor: `${BI.purple}40`, background: `${BI.purple}08`, borderRadius: 4 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: BI.purple }}>
              Planned work item
            </p>
            <p className="mt-1 text-[13px] font-medium" style={{ color: BI.ink }}>
              {roadmap.primaryWi.title}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: BI.mute }}>
              #{roadmap.primaryWi.adoId} · {roadmap.primaryWi.state}
              {roadmap.primaryWi.url ? (
                <>
                  {' · '}
                  <a
                    href={roadmap.primaryWi.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:underline"
                    style={{ color: BI.cyan }}
                  >
                    Open in ADO
                  </a>
                </>
              ) : null}
            </p>
          </div>
        ) : null}

        {empty ? (
          <p className="text-[13px]" style={{ color: BI.mute }}>
            No semester plan, work items, or dependency requests linked for this filter.
          </p>
        ) : (
          <>
            {workItems.length > 0 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: BI.faint }}>
                  Work items
                </p>
                <ul className="mt-2 space-y-2">
                  {workItems.map((wi) => (
                    <li
                      key={wi.id}
                      className="border-l-2 pl-3"
                      style={{ borderColor: isOpenWorkItem(wi) ? BI.purple : BI.teal }}
                    >
                      <p className="text-[10px] uppercase tracking-[0.1em]" style={{ color: BI.faint }}>
                        {wi.type} · {wi.state} · #{wi.adoId}
                      </p>
                      <p className="text-[12px] font-medium" style={{ color: BI.ink }}>
                        {wi.url ? (
                          <a href={wi.url} target="_blank" rel="noreferrer" className="hover:underline">
                            {wi.title}
                          </a>
                        ) : (
                          wi.title
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {deps.length > 0 ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: BI.faint }}>
                  Dependency requests
                </p>
                <ul className="mt-2 space-y-2">
                  {deps.map((dep) => (
                    <li key={dep.id} className="border-l-2 pl-3" style={{ borderColor: BI.purple }}>
                      <p className="text-[10px] uppercase tracking-[0.1em]" style={{ color: BI.faint }}>
                        {dep.state} · {dep.fromTeam} → {dep.toTeam}
                      </p>
                      <p className="text-[12px] font-medium" style={{ color: BI.ink }}>
                        {dep.title}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>
    </aside>
  )
}

function CompetitiveSection({
  features,
  workload,
  themeId,
  themeName,
  onWorkloadTab,
  workloadsWithData,
}: {
  features: CompetitorFeature[]
  workload: LayoutProps['workload']
  themeId: string | null
  themeName: string | null
  onWorkloadTab: (id: WorkloadId | 'all') => void
  workloadsWithData: WorkloadId[]
}) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const summary = useMemo(() => {
    const counts = { ships: 0, planned: 0, gap: 0, unknown: 0 }
    for (const f of features) counts[f.fabricStatus] += 1
    return counts
  }, [features])

  return (
    <BiCard
      title="Competitive analysis"
      hint={
        themeName
          ? `Filtered to theme “${themeName}” · rival × capability × Fabric status`
          : workload === 'all'
            ? 'All workloads · select a tab or theme to narrow'
            : `${WORKLOAD_CATALOG[workload]?.label ?? workload} · rival × capability × Fabric status`
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2" style={{ borderColor: BI.line }}>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onWorkloadTab('all')}
            className="rounded px-2.5 py-1 text-[11px] font-medium transition"
            style={
              workload === 'all'
                ? { background: BI.select, color: BI.purple, boxShadow: `inset 3px 0 0 ${BI.cyan}` }
                : { color: BI.mute }
            }
          >
            All
          </button>
          {workloadsWithData.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onWorkloadTab(id)}
              className="rounded px-2.5 py-1 text-[11px] font-medium transition"
              style={
                workload === id
                  ? { background: BI.select, color: BI.purple, boxShadow: `inset 3px 0 0 ${BI.cyan}` }
                  : { color: BI.mute }
              }
            >
              {WORKLOAD_CATALOG[id]?.shortLabel ?? id}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-[11px]" style={{ color: BI.mute }}>
            <span>
              <strong style={{ color: BI.pos }}>{summary.ships}</strong> ships
            </span>
            <span>
              <strong style={{ color: BI.purple }}>{summary.planned}</strong> planned
            </span>
            <span>
              <strong style={{ color: BI.neg }}>{summary.gap}</strong> gap
            </span>
          </div>
          <div className="flex rounded border" style={{ borderColor: BI.line }}>
            {(
              [
                ['table', 'Table'],
                ['cards', 'Cards'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewMode(id)}
                className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={
                  viewMode === id
                    ? { background: BI.elevated, color: BI.ink }
                    : { color: BI.faint }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {features.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm" style={{ color: BI.mute }}>
          No competitor rows for this filter.
        </p>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((f) => {
            const st = competitorStatusStyle(f.fabricStatus)
            return (
              <article
                key={f.id}
                className="rounded border p-3"
                style={{ borderColor: BI.line, borderRadius: 4, background: BI.elevated }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: BI.teal }}>
                    {f.competitorLabel}
                  </p>
                  <span
                    className="shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                    style={{ borderColor: st.border, background: st.bg, color: st.fg, borderRadius: 4 }}
                  >
                    {competitorStatusLabel(f.fabricStatus)}
                  </span>
                </div>
                <p className="mt-2 text-[13px] font-medium leading-snug" style={{ color: BI.ink }}>
                  {f.capability}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  {f.adoUrl ? (
                    <a
                      href={f.adoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                      style={{ color: BI.purple }}
                    >
                      ADO <ExternalLink size={10} />
                    </a>
                  ) : null}
                  {f.evidenceUrls?.[0] ? (
                    <a
                      href={f.evidenceUrls[0]}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                      style={{ color: BI.cyan }}
                    >
                      Evidence <ExternalLink size={10} />
                    </a>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-[12px]">
            <thead>
              <tr
                className="border-b text-[10px] font-semibold uppercase tracking-[0.1em]"
                style={{ borderColor: BI.line, color: BI.faint, background: BI.elevated }}
              >
                <th className="px-4 py-2.5 font-semibold">Rival</th>
                <th className="px-3 py-2.5 font-semibold">Capability</th>
                <th className="px-3 py-2.5 font-semibold">Workload</th>
                <th className="px-3 py-2.5 font-semibold">Fabric</th>
                <th className="px-4 py-2.5 font-semibold">Links</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => {
                const st = competitorStatusStyle(f.fabricStatus)
                return (
                  <tr key={f.id} className="border-b" style={{ borderColor: BI.line }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: BI.ink }}>
                      {f.competitorLabel}
                    </td>
                    <td className="px-3 py-2.5" style={{ color: BI.mute }}>
                      {f.capability}
                    </td>
                    <td className="px-3 py-2.5" style={{ color: BI.faint }}>
                      {WORKLOAD_CATALOG[f.workload]?.shortLabel ?? f.workload}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase"
                        style={{ borderColor: st.border, background: st.bg, color: st.fg, borderRadius: 4 }}
                      >
                        {competitorStatusLabel(f.fabricStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-2">
                        {f.adoUrl ? (
                          <a
                            href={f.adoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                            style={{ color: BI.purple }}
                          >
                            ADO
                          </a>
                        ) : null}
                        {f.evidenceUrls?.[0] ? (
                          <a
                            href={f.evidenceUrls[0]}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                            style={{ color: BI.cyan }}
                          >
                            Docs
                          </a>
                        ) : (
                          <span style={{ color: BI.faint }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {themeId ? (
        <p className="border-t px-4 py-2 text-[11px]" style={{ borderColor: BI.line, color: BI.faint }}>
          Showing competitors linked to the selected customer theme.
        </p>
      ) : null}
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
  onClearFilters,
}: LayoutProps) {
  const [sortBy, setSortBy] = useState<'volume' | 'sentiment' | 'roadmap'>('volume')
  const [evidenceTheme, setEvidenceTheme] = useState<ThemeInsight | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(true)

  const tooltipStyle = {
    background: BI.panel,
    border: `1px solid ${BI.line}`,
    borderRadius: 4,
    fontSize: 12,
    color: BI.ink,
    boxShadow: BI.shadow,
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

  const themeRows = useMemo(() => {
    return view.themes.map((theme) => {
      const mapping = resolveThemeMapping(theme.id, snapshot.themeMappings, cloud, workload)
      const workItems = workItemsForMapping(mapping, snapshot.workItems)
      const roadmap = resolveRoadmap(mapping, workItems)
      return { theme, mapping, workItems, roadmap }
    })
  }, [view.themes, snapshot.themeMappings, snapshot.workItems, cloud, workload])

  const rankedThemes = useMemo(() => {
    const list = [...themeRows]
    if (sortBy === 'sentiment') {
      list.sort(
        (a, b) =>
          a.theme.sentimentScore - b.theme.sentimentScore ||
          b.theme.mentionCount - a.theme.mentionCount,
      )
    } else if (sortBy === 'roadmap') {
      const order: Record<RoadmapKind, number> = {
        'not-planned': 0,
        planned: 1,
        partial: 2,
        'on-roadmap': 3,
      }
      list.sort(
        (a, b) =>
          (order[a.roadmap.kind] ?? 0) - (order[b.roadmap.kind] ?? 0) ||
          b.theme.mentionCount - a.theme.mentionCount,
      )
    } else {
      list.sort(
        (a, b) =>
          b.theme.mentionCount - a.theme.mentionCount || b.theme.trend - a.theme.trend,
      )
    }
    return list
  }, [themeRows, sortBy])

  const coverageSummary = useMemo(() => {
    const counts: Record<CoverageStatus, number> = { covered: 0, partial: 0, gap: 0 }
    for (const row of themeRows) {
      counts[row.mapping?.coverage ?? 'gap'] += 1
    }
    return counts
  }, [themeRows])

  const roadmapSummary = useMemo(() => {
    const counts: Record<RoadmapKind, number> = {
      'on-roadmap': 0,
      planned: 0,
      partial: 0,
      'not-planned': 0,
    }
    for (const row of themeRows) counts[row.roadmap.kind] += 1
    const total = themeRows.length || 1
    const onPlan = counts['on-roadmap'] + counts.planned + counts.partial
    return {
      ...counts,
      total: themeRows.length,
      onPlanPct: onPlan / total,
      gapPct: counts['not-planned'] / total,
    }
  }, [themeRows])

  const topActions = useMemo(
    () =>
      [...snapshot.actions]
        .filter((a) => (workload === 'all' ? true : a.workload === workload))
        .sort((a, b) => actionRank(b) - actionRank(a))
        .slice(0, 5),
    [snapshot.actions, workload],
  )

  const selectedRow = useMemo(
    () => (themeId ? themeRows.find((r) => r.theme.id === themeId) ?? null : null),
    [themeId, themeRows],
  )

  const selectedDeps = useMemo(() => {
    if (!selectedRow?.mapping?.dependencyIds?.length) return []
    return snapshot.dependencyRequests.filter((d) =>
      selectedRow.mapping!.dependencyIds!.includes(d.id),
    )
  }, [selectedRow, snapshot.dependencyRequests])

  const semesterName = selectedRow?.mapping?.semesterId
    ? snapshot.semesterPlans.find((s) => s.id === selectedRow.mapping!.semesterId)?.name ?? null
    : null

  const evidenceMentions = useMemo(() => {
    if (!evidenceTheme) return []
    const ids = new Set(evidenceTheme.mentionIds)
    return view.mentions.filter((m) => ids.has(m.id))
  }, [evidenceTheme, view.mentions])

  const allCompetitorFeatures = snapshot.competitorFeatures ?? DEMO_COMPETITOR_FEATURES

  const competitorFeatures = useMemo(
    () => featuresForWorkload(workload, themeId, allCompetitorFeatures),
    [workload, themeId, allCompetitorFeatures],
  )

  const workloadsWithCompetitorData = useMemo(() => {
    const ids = new Set(allCompetitorFeatures.map((f) => f.workload))
    return (Object.keys(WORKLOAD_CATALOG) as WorkloadId[]).filter((id) => ids.has(id))
  }, [allCompetitorFeatures])

  const workloadLabel =
    workload === 'all' ? 'All workloads' : (WORKLOAD_CATALOG[workload]?.label ?? workload)
  const cloudLabel = formatCloudBoundary(cloud)
  const themeLabel = view.selectedTheme?.name ?? null
  const refreshedLabel = snapshot.generatedAt
    ? new Date(snapshot.generatedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—'

  return (
    <div
      className="mx-auto w-full max-w-[1600px] px-3 pb-10 pt-2 sm:px-5 lg:px-6"
      style={{ fontFamily: '"Segoe UI", "Segoe UI Variable", system-ui, sans-serif' }}
    >
      {/* Fabric lockup + PBI report chrome */}
      <header className="mb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FabricMark variant="lockup" />
          <div className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: BI.mute }}>
            <span
              className="rounded border px-2 py-0.5 font-semibold uppercase tracking-[0.08em]"
              style={{ borderColor: BI.line, background: BI.elevated, borderRadius: 4 }}
            >
              Certified · Org endorsed
            </span>
            <span>Workspace: Fabric Pulse Demo</span>
            <span aria-hidden="true">·</span>
            <span>Sensitivity: General</span>
          </div>
        </div>

        <div
          className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded border bg-white px-3 py-2"
          style={{ borderColor: BI.line, boxShadow: BI.shadow, borderRadius: 4 }}
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: BI.teal }}>
              Fabric Pulse · Analytics
            </p>
            <h1 className="text-[22px] font-semibold tracking-tight sm:text-[28px]" style={{ color: BI.ink }}>
              BI Dashboard
            </h1>
            <p className="text-[12px]" style={{ color: BI.mute }}>
              {snapshot.dateRange.label}
              <span className="mx-1.5 opacity-40">·</span>
              Published to workspace · Executive sentiment, roadmap &amp; competitive review
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded p-2 hover:bg-black/5"
              style={{ color: BI.mute }}
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className="rounded p-2 hover:bg-black/5"
              style={{ color: filtersOpen ? BI.cyan : BI.mute }}
              title="Filters"
              aria-label="Toggle filters"
            >
              <Filter size={16} />
            </button>
            <button
              type="button"
              className="rounded p-2 hover:bg-black/5"
              style={{ color: BI.mute }}
              title="Full screen"
              aria-label="Full screen"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className={`grid gap-3 ${filtersOpen ? 'xl:grid-cols-[1fr_240px]' : ''}`}>
        <div className="min-w-0 space-y-3">
          {/* Scorecards */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <Scorecard
              lead
              label="Mention volume"
              value={String(view.kpis.volume)}
              hint="Mentions in filtered window"
              trend={view.kpis.volumeTrend}
            />
            <Scorecard
              label="Sentiment mix"
              value={`${formatShare(view.kpis.positiveShare)} / ${formatShare(view.kpis.negativeShare)}`}
              hint={`${formatShare(view.kpis.neutralShare)} neutral · pos / neg`}
            />
            <Scorecard
              label="Net sentiment"
              value={formatNet(view.kpis.netSentiment)}
              hint={`${formatNet(view.kpis.netSentimentTrend)} vs first half`}
              trend={view.kpis.netSentimentTrend * 100}
            />
            <Scorecard
              label="On roadmap"
              value={formatShare(roadmapSummary.onPlanPct)}
              hint={`${roadmapSummary['on-roadmap'] + roadmapSummary.planned + roadmapSummary.partial} of ${roadmapSummary.total} themes · ${roadmapSummary['not-planned']} gaps`}
            />
            <Scorecard
              label="Top rising theme"
              value={view.kpis.topRisingTheme ?? '—'}
              hint="Highest volume growth, H1 → H2"
              trend={view.kpis.topRisingThemeTrend}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <BiCard
              className="xl:col-span-2"
              title="Volume & sentiment over time"
              hint="Daily mention volume with stacked sentiment"
            >
              <div className="h-64 p-3 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={view.daily} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke={BI.grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: BI.mute, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: BI.mute, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [String(value), String(name)]} />
                    <Bar dataKey="positive" stackId="s" fill={BI.pos} name="Positive" />
                    <Bar dataKey="neutral" stackId="s" fill={BI.neu} name="Neutral" />
                    <Bar dataKey="negative" stackId="s" fill={BI.neg} name="Negative" radius={[2, 2, 0, 0]} />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      fill={BI.cyan}
                      fillOpacity={0.08}
                      stroke={BI.cyan}
                      strokeWidth={2}
                      name="Volume"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </BiCard>

            <BiCard title="Sentiment mix" hint={`Net ${formatNet(view.kpis.netSentiment)}`}>
              <div className="flex h-64 flex-col items-center justify-center p-3">
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

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <BiCard
              className="xl:col-span-2"
              title={workload === 'all' ? 'Workload comparison' : 'Workload focus'}
              hint={
                workload === 'all'
                  ? 'Click a bar to filter · volume by workload'
                  : `Showing ${workloadLabel} — use Show all to compare`
              }
            >
              {workload !== 'all' ? (
                <div className="px-4 pt-2">
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
              <div className="h-56 p-3 pt-1">
                {workloadBars.length === 0 ? (
                  <p className="py-16 text-center text-sm" style={{ color: BI.mute }}>
                    No workload volume for this filter.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workloadBars} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid stroke={BI.grid} strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fill: BI.mute, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={88} tick={{ fill: BI.ink, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [String(value), String(name)]} />
                      <Bar
                        dataKey="volume"
                        name="Volume"
                        fill={BI.teal}
                        radius={[0, 2, 2, 0]}
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
              <BiCard title="ADO coverage" hint="Theme → plan mapping">
                <div className="grid grid-cols-3 gap-2 p-3">
                  {(
                    [
                      ['covered', coverageSummary.covered],
                      ['partial', coverageSummary.partial],
                      ['gap', coverageSummary.gap],
                    ] as const
                  ).map(([key, count]) => (
                    <div
                      key={key}
                      className="rounded border px-2 py-2.5 text-center"
                      style={{ borderColor: BI.line, background: BI.elevated, borderRadius: 4 }}
                    >
                      <p className="text-lg font-semibold tabular-nums" style={{ color: BI.ink }}>
                        {count}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: coverageColor(key) }}>
                        {coverageLabel(key)}
                      </p>
                    </div>
                  ))}
                </div>
              </BiCard>

              <BiCard title="Roadmap status" hint="% themes planned vs gaps">
                <div className="space-y-2 p-3">
                  <div className="flex items-end justify-between">
                    <p className="text-[22px] font-semibold tabular-nums" style={{ color: BI.ink }}>
                      {formatShare(roadmapSummary.onPlanPct)}
                    </p>
                    <p className="text-[11px]" style={{ color: BI.mute }}>
                      on plan
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ background: BI.grid }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(roadmapSummary.onPlanPct * 100)}%`,
                        background: `linear-gradient(90deg, ${BI.pos}, ${BI.cyan})`,
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]" style={{ color: BI.mute }}>
                    <span style={{ color: BI.pos }}>{roadmapSummary['on-roadmap']} on roadmap</span>
                    <span style={{ color: BI.purple }}>{roadmapSummary.planned} planned</span>
                    <span style={{ color: BI.amber }}>{roadmapSummary.partial} partial</span>
                    <span style={{ color: BI.neg }}>{roadmapSummary['not-planned']} not planned</span>
                  </div>
                </div>
              </BiCard>

              <BiCard title="Top actions" hint="Highest impact · filtered" className="flex-1">
                <div className="p-3 pt-1">
                  {topActions.length === 0 ? (
                    <p className="text-sm" style={{ color: BI.mute }}>
                      No actions for this filter.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {topActions.map((action) => (
                        <li
                          key={action.id}
                          className="rounded border px-2.5 py-2"
                          style={{ borderColor: BI.line, background: BI.elevated, borderRadius: 4 }}
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
                </div>
              </BiCard>
            </div>
          </div>

          {/* Themes + detail */}
          <div className={`grid gap-3 ${selectedRow ? 'xl:grid-cols-[1fr_320px]' : ''}`}>
            <BiCard menu={false}>
              <div
                className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3"
                style={{ borderColor: BI.line }}
              >
                <div>
                  <h2 className="text-[13px] font-semibold tracking-tight" style={{ color: BI.ink }}>
                    Customer themes
                  </h2>
                  <p className="mt-0.5 text-[11px]" style={{ color: BI.faint }}>
                    Volume, sentiment, ADO coverage &amp; roadmap · click a row for plan detail
                  </p>
                </div>
                <div className="flex gap-1">
                  {(
                    [
                      ['volume', 'By volume'],
                      ['sentiment', 'By sentiment'],
                      ['roadmap', 'By roadmap'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSortBy(id)}
                      className="rounded px-2.5 py-1 text-[11px] font-medium transition"
                      style={
                        sortBy === id
                          ? { background: BI.select, color: BI.purple, boxShadow: `inset 3px 0 0 ${BI.cyan}` }
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
                  <table className="w-full min-w-[880px] text-left text-[12px]">
                    <thead>
                      <tr
                        className="border-b text-[10px] font-semibold uppercase tracking-[0.1em]"
                        style={{ borderColor: BI.line, color: BI.faint, background: BI.elevated }}
                      >
                        <th className="px-4 py-2.5 font-semibold">Theme</th>
                        <th className="px-3 py-2.5 font-semibold">Polarity</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Vol</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Net</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Trend</th>
                        <th className="px-3 py-2.5 font-semibold">Coverage</th>
                        <th className="px-3 py-2.5 font-semibold">Roadmap</th>
                        <th className="px-4 py-2.5 font-semibold">Evidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankedThemes.map(({ theme, mapping, roadmap }) => {
                        const status: CoverageStatus = mapping?.coverage ?? 'gap'
                        const active = theme.id === themeId
                        return (
                          <tr
                            key={theme.id}
                            className="border-b transition"
                            style={{
                              borderColor: BI.line,
                              background: active ? BI.select : undefined,
                              boxShadow: active ? `inset 3px 0 0 ${BI.cyan}` : undefined,
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
                                {roadmap.kind === 'planned' && roadmap.primaryWi ? (
                                  <span className="mt-1 block text-[10px]" style={{ color: BI.purple }}>
                                    Planned · #{roadmap.primaryWi.adoId} {roadmap.primaryWi.title}
                                  </span>
                                ) : null}
                              </button>
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${polarityClass(theme.polarity)}`}
                                style={{ borderRadius: 4 }}
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
                              <StatusChip label={coverageLabel(status)} color={coverageColor(status)} />
                            </td>
                            <td className="px-3 py-2.5">
                              <StatusChip
                                label={roadmap.label}
                                color={roadmap.color}
                                title={
                                  roadmap.primaryWi
                                    ? `#${roadmap.primaryWi.adoId} ${roadmap.primaryWi.title}`
                                    : undefined
                                }
                              />
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

            {selectedRow ? (
              <ThemeDetailPanel
                theme={selectedRow.theme}
                mapping={selectedRow.mapping}
                workItems={selectedRow.workItems}
                deps={selectedDeps}
                semesterName={semesterName}
                roadmap={selectedRow.roadmap}
                onClose={() => setThemeId(null)}
                onEvidence={() => setEvidenceTheme(selectedRow.theme)}
              />
            ) : null}
          </div>

          <CompetitiveSection
            features={competitorFeatures}
            workload={workload}
            themeId={themeId}
            themeName={themeLabel}
            onWorkloadTab={(id) => {
              setWorkload(id)
              if (id !== workload) setThemeId(null)
            }}
            workloadsWithData={workloadsWithCompetitorData}
          />
        </div>

        {/* Filter pane — PBI-style */}
        {filtersOpen ? (
          <aside
            className="h-fit rounded border bg-white xl:sticky xl:top-3"
            style={{ borderColor: BI.line, boxShadow: BI.shadow, borderRadius: 4 }}
          >
            <div
              className="flex items-center justify-between border-b px-3 py-2.5"
              style={{ borderColor: BI.line }}
            >
              <p className="text-[12px] font-semibold" style={{ color: BI.ink }}>
                Filters
              </p>
              <button
                type="button"
                onClick={onClearFilters}
                className="text-[11px] font-medium hover:underline"
                style={{ color: BI.cyan }}
              >
                Clear filters
              </button>
            </div>
            <div className="space-y-4 p-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: BI.faint }}>
                  Workload
                </p>
                <ul className="mt-2 space-y-0.5">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkload('all')
                        setThemeId(null)
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px]"
                      style={
                        workload === 'all'
                          ? { background: BI.select, color: BI.ink, boxShadow: `inset 3px 0 0 ${BI.cyan}` }
                          : { color: BI.mute }
                      }
                    >
                      All workloads
                    </button>
                  </li>
                  {(Object.keys(WORKLOAD_CATALOG) as WorkloadId[]).map((id) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => {
                          setWorkload(id)
                          setThemeId(null)
                        }}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px]"
                        style={
                          workload === id
                            ? { background: BI.select, color: BI.ink, boxShadow: `inset 3px 0 0 ${BI.cyan}` }
                            : { color: BI.mute }
                        }
                      >
                        {WORKLOAD_CATALOG[id].shortLabel}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: BI.faint }}>
                  Environment
                </p>
                <p className="mt-2 rounded border px-2.5 py-1.5 text-[12px]" style={{ borderColor: BI.line, color: BI.ink, borderRadius: 4 }}>
                  {cloudLabel}
                </p>
                <p className="mt-1 text-[10px]" style={{ color: BI.faint }}>
                  Use cloud switcher in the shell to change.
                </p>
                <div className="mt-3">
                  <WhyItMattersChip cloud={cloud} workload={workload} items={snapshot.intelligenceNews} />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: BI.faint }}>
                  Date range
                </p>
                <p className="mt-2 text-[12px]" style={{ color: BI.ink }}>
                  {snapshot.dateRange.label}
                </p>
              </div>

              {themeLabel ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: BI.faint }}>
                    Theme
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-[12px] font-medium" style={{ color: BI.ink }}>
                      {themeLabel}
                    </p>
                    <button
                      type="button"
                      onClick={() => setThemeId(null)}
                      className="text-[11px] hover:underline"
                      style={{ color: BI.cyan }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="border-t pt-3" style={{ borderColor: BI.line }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: BI.faint }}>
                  Active filters
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span
                    className="rounded border px-2 py-0.5 text-[11px]"
                    style={{ borderColor: BI.line, background: BI.elevated, color: BI.mute, borderRadius: 4 }}
                  >
                    {workloadLabel}
                  </span>
                  <span
                    className="rounded border px-2 py-0.5 text-[11px]"
                    style={{ borderColor: BI.line, background: BI.elevated, color: BI.mute, borderRadius: 4 }}
                  >
                    {cloudLabel}
                  </span>
                  {themeLabel ? (
                    <span
                      className="rounded border px-2 py-0.5 text-[11px]"
                      style={{ borderColor: BI.line, background: BI.elevated, color: BI.mute, borderRadius: 4 }}
                    >
                      {themeLabel}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      <footer
        className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[11px]"
        style={{ borderColor: BI.line, color: BI.faint }}
      >
        <span className="inline-flex items-center gap-1.5">
          <Activity size={12} aria-hidden="true" />
          Workspace: Fabric Pulse Demo · Sensitivity: General · Refreshed: {refreshedLabel}
        </span>
        <span>
          {snapshot.demoDisclaimer} · mode: bi-dashboard
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
