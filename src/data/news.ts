import type { NewsItem } from '../types'

export const SAMPLE_NEWS: NewsItem[] = [
  {
    id: 'n01',
    title: 'Microsoft Fabric September 2026 feature summary',
    source: 'Microsoft Fabric blog',
    sourceType: 'official',
    publishedAt: '2026-09-11T15:00:00Z',
    summary:
      'Official monthly roundup: Copilot in Warehouse expansion, OneLake catalog polish, Eventstream observability preview, and admin monitoring additions.',
    url: 'https://blog.fabric.microsoft.com/',
    workloads: ['other', 'copilot-ai', 'onelake', 'realtime-analytics'],
  },
  {
    id: 'n02',
    title: 'Copilot in Fabric Data Warehouse generally available',
    source: 'Microsoft Learn',
    sourceType: 'official',
    publishedAt: '2026-09-10T16:30:00Z',
    summary:
      'Natural-language-to-SQL in the warehouse editor is GA, with workspace grounding and admin tenant switches documented.',
    url: 'https://learn.microsoft.com/fabric/',
    workloads: ['copilot-ai', 'data-warehouse'],
  },
  {
    id: 'n03',
    title: 'OneLake security inheritance for shortcuts',
    source: 'Microsoft Fabric blog',
    sourceType: 'official',
    publishedAt: '2026-09-08T14:00:00Z',
    summary:
      'Shortcut ACLs now inherit workspace and OneLake roles more consistently, aimed at multi-domain mesh setups and audit findings.',
    url: 'https://blog.fabric.microsoft.com/',
    workloads: ['onelake', 'security-governance'],
  },
  {
    id: 'n04',
    title: 'Direct Lake guidance: when fallback is expected',
    source: 'SQLBI',
    sourceType: 'community',
    publishedAt: '2026-09-09T09:00:00Z',
    summary:
      'Community walkthrough of Direct Lake vs DirectQuery fallback, framing, and model design choices that keep exec packs on Direct Lake.',
    url: 'https://www.sqlbi.com/',
    workloads: ['power-bi', 'onelake'],
  },
  {
    id: 'n05',
    title: 'Eventstream in production: latency lessons',
    source: 'The New Stack',
    sourceType: 'press',
    publishedAt: '2026-09-10T11:20:00Z',
    summary:
      'Press look at Real-Time Intelligence customers, including p99 latency expectations and how Eventhouse sits on OneLake.',
    url: 'https://thenewstack.io/',
    workloads: ['realtime-analytics'],
  },
  {
    id: 'n06',
    title: 'Guy in a Cube: Premium to F64 without surprises',
    source: 'Guy in a Cube',
    sourceType: 'community',
    publishedAt: '2026-09-07T18:00:00Z',
    summary:
      'Community video on capacity units, bursting, and what actually moves when a Premium workspace lands on Fabric F64.',
    url: 'https://guyinacube.com/',
    workloads: ['power-bi', 'other'],
  },
  {
    id: 'n07',
    title: 'Fabric vs Databricks for mid-size data teams',
    source: 'InfoWorld',
    sourceType: 'press',
    publishedAt: '2026-09-06T13:45:00Z',
    summary:
      'Comparison piece arguing Fabric wins when Power BI and OneLake are the center of gravity, Databricks when the ML platform is.',
    url: 'https://www.infoworld.com/',
    workloads: ['other', 'data-science', 'power-bi'],
  },
  {
    id: 'n08',
    title: 'Dataflow Gen2 refresh contracts — what “succeeded” means',
    source: 'Microsoft Learn',
    sourceType: 'official',
    publishedAt: '2026-09-05T17:10:00Z',
    summary:
      'Updated Learn article on Dataflow Gen2 refresh status, staging lakehouses, and how pipeline activity result maps to commit.',
    url: 'https://learn.microsoft.com/fabric/data-factory/',
    workloads: ['data-integration', 'pipelines'],
  },
  {
    id: 'n09',
    title: 'Endorsement in Fabric: a steward’s field guide',
    source: 'Community blog',
    sourceType: 'community',
    publishedAt: '2026-09-08T08:30:00Z',
    summary:
      'Practitioner notes on endorsed vs certified vs promoted, and why shortcut-level badges are the next governance request.',
    url: 'https://www.microsoft.com/en-us/power-platform/blog/',
    workloads: ['security-governance', 'onelake'],
  },
]
