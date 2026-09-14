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

/** Cloud boundary on signal / ADO records. Omit ≈ commercial / unspecified. */
export type CloudBoundary = 'commercial' | 'usgov' | 'il7' | 'il6' | 'unknown'

/** Sparse cloud pill filter (All + named slices). */
export type CloudBoundaryFilter = 'all' | 'commercial' | 'usgov' | 'il7' | 'il6'

export type ThemePolarity = 'want' | 'dont-like' | 'mixed'
export type CoverageStatus = 'covered' | 'partial' | 'gap'

/** One voice vs thin vs crowd — derived from unique authors / mention count. */
export type VolumeClass = 'single' | 'thin' | 'crowd'

export type FabricCompetitorStatus = 'ships' | 'planned' | 'gap' | 'unknown'

export type SourceKind =
  | 'rss'
  | 'github-issues'
  | 'reddit'
  | 'x-api'
  | 'stackexchange'
  | 'gdelt'
  | 'status-page'
  | 'ado-rest'
  | 'csv-upload'
  | 'vendor-export'

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
  /** Optional; omit ≈ commercial / unspecified. */
  cloudBoundary?: CloudBoundary
  /** Source registry entry id (toggleable). */
  sourceEntryId?: string
  /** Upstream id when real; synthetic for demo. */
  externalId?: string
  /** Permalink back to original comment (synthetic OK for demo). */
  permalink?: string
}

export interface ThemeDefinition {
  id: string
  name: string
  description: string
  keywords: string[]
  /** Want vs friction taxonomy; cluster inherits when set. */
  polarity?: ThemePolarity
  cloudBoundary?: CloudBoundary
}

export interface ThemeInsight {
  id: string
  name: string
  description: string
  keywords: string[]
  mentionIds: string[]
  mentionCount: number
  /** Distinct authors/handles in the matched set — derived, not random. */
  uniqueAuthorCount: number
  volumeClass: VolumeClass
  sentimentScore: number
  trend: number
  workloads: WorkloadId[]
  polarity: ThemePolarity
  cloudBoundary?: CloudBoundary
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
  sourceEntryId?: string
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

/** ADO semester / planning period. */
export interface SemesterPlan {
  id: string
  name: string
  start: string
  end: string
}

export type WorkItemType = 'feature' | 'bug' | 'task' | 'epic' | string

export interface WorkItem {
  id: string
  adoId: string
  title: string
  type: WorkItemType
  state: string
  workload?: WorkloadId
  semesterId?: string
  cloudBoundary?: CloudBoundary
  url?: string
}

export interface DependencyRequest {
  id: string
  title: string
  fromTeam: string
  toTeam: string
  state: string
  relatedWorkItemIds: string[]
  semesterId?: string
  cloudBoundary?: CloudBoundary
}

/** Bridge: theme signal ↔ ADO work (covered / partial / gap). */
export interface ThemeSignalMapping {
  id: string
  themeId: string
  workItemIds?: string[]
  dependencyIds?: string[]
  semesterId?: string
  coverage: CoverageStatus
  notes?: string
  cloudBoundary?: CloudBoundary
  workload?: WorkloadId
}

/** Volume + receipts for a theme or story claim. */
export interface EvidenceCluster {
  id: string
  themeId: string
  workload?: WorkloadId
  cloudBoundary?: CloudBoundary
  mentionIds: string[]
  mentionCount: number
  uniqueAuthorCount: number
  volumeClass: VolumeClass
  sampleMentionIds: string[]
  windowStart: string
  windowEnd: string
  notes?: string
}

/** Rival capability row tied to a customer theme. */
export interface CompetitorFeature {
  id: string
  workload: WorkloadId
  themeId: string
  competitor: string
  competitorLabel: string
  capability: string
  fabricStatus: FabricCompetitorStatus
  themeMappingId?: string
  workItemIds?: string[]
  /** Optional ADO / plan link when planned. */
  adoUrl?: string
  evidenceUrls?: string[]
  updatedAt: string
  updatedBy?: string
}

/** Chronicle back page for a theme / complaint. */
export interface CompetitorPage {
  id: string
  title: string
  workload: WorkloadId
  themeId: string
  featureIds: string[]
  summary: string
}

/** Toggleable ingest source (demo registry). */
export interface SourceRegistryEntry {
  id: string
  kind: SourceKind
  displayName: string
  enabled: boolean
  lastRefresh?: string
  configBlurb: string
  legalNote?: string
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
  semesterPlans: SemesterPlan[]
  workItems: WorkItem[]
  dependencyRequests: DependencyRequest[]
  themeMappings: ThemeSignalMapping[]
  /** Prototype: evidence clusters derived from themes. */
  evidenceClusters?: EvidenceCluster[]
  competitorFeatures?: CompetitorFeature[]
  competitorPages?: CompetitorPage[]
  sourceRegistry?: SourceRegistryEntry[]
}

/**
 * Swappable data contract. Mock → public live → internal MS sources
 * should all normalize into PulseSnapshot. See docs/PROVIDERS.md.
 */
export interface PulseDataProvider {
  getSnapshot(): Promise<PulseSnapshot>
}
