import type {
  CloudBoundaryFilter,
  DailyPoint,
  Mention,
  NewsItem,
  PulseKpis,
  PulseSnapshot,
  SuggestedAction,
  ThemeInsight,
  WorkloadFilter,
  WorkloadStat,
} from '../../types'

export type LayoutView = {
  themes: ThemeInsight[]
  daily: DailyPoint[]
  workloads: WorkloadStat[]
  kpis: PulseKpis
  mentions: Mention[]
  selectedTheme: ThemeInsight | null
}

export type LayoutProps = {
  snapshot: PulseSnapshot
  view: LayoutView
  workload: WorkloadFilter
  cloud: CloudBoundaryFilter
  themeId: string | null
  setWorkload: (next: WorkloadFilter) => void
  setCloud: (next: CloudBoundaryFilter) => void
  setThemeId: (id: string | null) => void
  onClearFilters: () => void
}

export type ClassicSectionsProps = {
  snapshot: PulseSnapshot
  view: LayoutView
  workload: WorkloadFilter
  themeId: string | null
  setWorkload: (next: WorkloadFilter) => void
  setThemeId: (id: string | null) => void
  actions?: SuggestedAction[]
  news?: NewsItem[]
}
