export const WORKLOAD_IDS = [
  'pipelines',
  'data-engineering',
  'data-integration',
  'onelake',
  'data-warehouse',
  'realtime-analytics',
  'data-science',
  'power-bi',
  'copilot-ai',
  'security-governance',
  'other',
] as const

export type WorkloadId = (typeof WORKLOAD_IDS)[number]

export type SentimentLabel = 'positive' | 'neutral' | 'negative'
export type EffortLevel = 'low' | 'medium' | 'high'
export type ImpactLevel = 'low' | 'medium' | 'high'
export type NewsSourceType = 'official' | 'community' | 'press'
export type WorkloadFilter = WorkloadId | 'all'

export interface WorkloadMeta {
  id: WorkloadId
  label: string
  shortLabel: string
  blurb: string
}

export interface Mention {
  id: string
  author: string
  handle: string
  authorRole: string
  text: string
  createdAt: string
  workload: WorkloadId
  sentiment: SentimentLabel
  sentimentScore: number
  likes: number
  reposts: number
  replies: number
}

export interface ThemeDefinition {
  id: string
  name: string
  description: string
  keywords: string[]
}

export interface ThemeInsight {
  id: string
  name: string
  description: string
  keywords: string[]
  mentionIds: string[]
  mentionCount: number
  sentimentScore: number
  trend: number
  workloads: WorkloadId[]
}

export interface SuggestedAction {
  id: string
  title: string
  rationale: string
  workload: WorkloadId
  effort: EffortLevel
  impact: ImpactLevel
  relatedThemeIds: string[]
  ownerHint: string
}

export interface NewsItem {
  id: string
  title: string
  source: string
  sourceType: NewsSourceType
  publishedAt: string
  summary: string
  url: string
  workloads: WorkloadId[]
}

export interface DailyPoint {
  date: string
  label: string
  volume: number
  positive: number
  neutral: number
  negative: number
  net: number
}

export interface WorkloadStat {
  id: WorkloadId
  label: string
  shortLabel: string
  blurb: string
  volume: number
  positive: number
  neutral: number
  negative: number
  netSentiment: number
  trend: number
}

export interface PulseKpis {
  volume: number
  volumeTrend: number
  positiveShare: number
  neutralShare: number
  negativeShare: number
  netSentiment: number
  netSentimentTrend: number
  topRisingTheme: string | null
  topRisingThemeTrend: number
}

export interface DateRange {
  start: string
  end: string
  label: string
}

export interface PulseSnapshot {
  generatedAt: string
  isDemo: true
  demoDisclaimer: string
  dateRange: DateRange
  mentions: Mention[]
  themeDefinitions: ThemeDefinition[]
  themes: ThemeInsight[]
  actions: SuggestedAction[]
  news: NewsItem[]
  daily: DailyPoint[]
  workloads: WorkloadStat[]
  kpis: PulseKpis
}

/** Swappable data contract. A live provider would implement the same shape. */
export interface PulseDataProvider {
  getSnapshot(): Promise<PulseSnapshot>
}
