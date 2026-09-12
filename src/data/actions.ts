import type { SuggestedAction } from '../types'

export const SAMPLE_ACTIONS: SuggestedAction[] = [
  {
    id: 'a01',
    title: 'Add shortcut health + token-expiry alerts',
    rationale:
      'Broken ADLS/S3 shortcuts after token rotation are the loudest OneLake complaint this week. A health signal and pre-expiry warning would prevent blank reports.',
    workload: 'onelake',
    effort: 'medium',
    impact: 'high',
    relatedThemeIds: ['theme-shortcuts'],
    ownerHint: 'OneLake + Identity',
  },
  {
    id: 'a02',
    title: 'Surface Direct Lake fallback as a first-class report banner',
    rationale:
      'Exec dashboard failures are blamed on Fabric BI when Direct Lake quietly falls back. Authors and viewers need an explicit, timestamped mode change.',
    workload: 'power-bi',
    effort: 'low',
    impact: 'high',
    relatedThemeIds: ['theme-direct-lake'],
    ownerHint: 'Power BI / Direct Lake',
  },
  {
    id: 'a03',
    title: 'Ground Copilot on a live activity / DAX catalog',
    rationale:
      'Hallucinated pipeline activities and double-counted DAX are high-visibility trust failures. Constrain generation to shipped APIs and attach a verification test.',
    workload: 'copilot-ai',
    effort: 'high',
    impact: 'high',
    relatedThemeIds: ['theme-copilot'],
    ownerHint: 'Copilot + Workload partners',
  },
  {
    id: 'a04',
    title: 'Make Livy session reuse the default for notebooks',
    rationale:
      'Cold starts (~8 min) dominate Data Engineering negativity, while session reuse is called a game changer. Flip the default and keep a one-click isolated session.',
    workload: 'data-engineering',
    effort: 'medium',
    impact: 'high',
    relatedThemeIds: ['theme-spark-start'],
    ownerHint: 'Spark runtime',
  },
  {
    id: 'a05',
    title: 'Emit Dataflow Gen2 success only after lakehouse commit',
    rationale:
      'Pipeline-success + empty lakehouse is a silent data-quality incident. Tie activity status to the commit and write a failure row to monitoring hub.',
    workload: 'data-integration',
    effort: 'medium',
    impact: 'high',
    relatedThemeIds: ['theme-dataflow'],
    ownerHint: 'Data Integration',
  },
  {
    id: 'a06',
    title: 'Publish Eventstream p99 SLO + dead-letter destination',
    rationale:
      'Latency spikes and silent partition drops showed up during a launch. Operators want SLOs and a place dropped events go.',
    workload: 'realtime-analytics',
    effort: 'high',
    impact: 'high',
    relatedThemeIds: ['theme-eventstream'],
    ownerHint: 'Real-Time Intelligence',
  },
  {
    id: 'a07',
    title: 'Queue missed pipeline triggers after capacity resume',
    rationale:
      'Weekend F64 pause caused a silent Monday miss. Replay or clearly fail scheduled triggers that should have fired while paused.',
    workload: 'pipelines',
    effort: 'medium',
    impact: 'medium',
    relatedThemeIds: ['theme-pipelines', 'theme-capacity'],
    ownerHint: 'Pipelines + Capacity',
  },
  {
    id: 'a08',
    title: 'Ship near-real-time capacity metrics (≤ 5 min)',
    rationale:
      'Warehouse bill spikes and bursting cannot be operated on a 2-hour-lag app. This theme cuts across warehouse, pipelines, and general Fabric.',
    workload: 'other',
    effort: 'high',
    impact: 'high',
    relatedThemeIds: ['theme-capacity', 'theme-warehouse'],
    ownerHint: 'Capacity platform',
  },
  {
    id: 'a09',
    title: 'Collapse endorsement into one steward-facing model',
    rationale:
      'Endorsed vs certified vs master data is creating governance theater. One badge, one meaning, plus shortcut-level endorsement.',
    workload: 'security-governance',
    effort: 'medium',
    impact: 'medium',
    relatedThemeIds: ['theme-governance', 'theme-shortcuts'],
    ownerHint: 'Purview / Governance',
  },
  {
    id: 'a10',
    title: 'Publish a 2026 decision tree: Dataflow vs Copy vs Spark',
    rationale:
      'Consultants keep asking for an official chooser. A short Learn + in-product guide would cut neutral "how do I" volume.',
    workload: 'data-integration',
    effort: 'low',
    impact: 'medium',
    relatedThemeIds: ['theme-naming', 'theme-dataflow', 'theme-positioning'],
    ownerHint: 'Docs + Data Integration',
  },
  {
    id: 'a11',
    title: 'Retire dual Activator / Reflex naming in product chrome',
    rationale:
      'Workshop leaders say naming still derails Real-Time conversations. Pick one string in UI, Learn, and Copilot.',
    workload: 'realtime-analytics',
    effort: 'low',
    impact: 'low',
    relatedThemeIds: ['theme-naming'],
    ownerHint: 'Real-Time + Docs',
  },
  {
    id: 'a12',
    title: 'Add a Premium → F64 sizing worksheet in-product',
    rationale:
      'Capacity owners describe bursting as folklore. A worksheet tied to the metrics app would support the SKU conversation partners are losing.',
    workload: 'power-bi',
    effort: 'medium',
    impact: 'medium',
    relatedThemeIds: ['theme-capacity', 'theme-positioning'],
    ownerHint: 'Capacity + PMO',
  },
]
