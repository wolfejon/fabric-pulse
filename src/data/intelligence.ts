import type { NewsIntelligenceItem } from '../types'

/**
 * Synthetic UNCLASSIFIED / DEMO intelligence packs.
 * Gov desk and commercial desk are strictly separated — never mixed in UI.
 */

const GOV_PACK: NewsIntelligenceItem[] = [
  {
    id: 'intel-gov-01',
    cloudDesk: 'gov',
    workloadIds: ['security-governance', 'onelake'],
    source: 'FedScoop (demo)',
    title: 'DoD data-platform IL uplift chatter centers on governed lakehouse patterns',
    summary:
      'UNCLASSIFIED/DEMO: Mission owners continue to ask how Fabric-style OneLake governance maps to IL6/IL7 control baselines — synthetic digest for product demos only.',
    publishedAt: '2026-09-18T14:00:00Z',
    trustTier: 'trade-press',
    whyItMatters: {
      'security-governance': 'IL control questions land on endorsement, private link, and audit story.',
      onelake: 'Shortcut inheritance and sovereign residency dominate the brief.',
    },
  },
  {
    id: 'intel-gov-02',
    cloudDesk: 'gov',
    workloadIds: ['pipelines', 'data-integration'],
    source: 'DefenseScoop (demo)',
    title: 'Pipeline orchestration RFIs stress air-gapped retry diagnostics',
    summary:
      'UNCLASSIFIED/DEMO: Sample RFI language highlights durable retries and clear failure receipts for mission ETL — not a live solicitation.',
    publishedAt: '2026-09-17T11:30:00Z',
    trustTier: 'trade-press',
    whyItMatters: {
      pipelines: 'Maps directly to ADF→Fabric migration pain and retry diagnostics themes.',
      'data-integration': 'Copy/connectivity posture is named in the synthetic RFI package.',
    },
    relatedCompetitorPageId: 'cp-retry',
  },
  {
    id: 'intel-gov-03',
    cloudDesk: 'gov',
    workloadIds: ['copilot-ai', 'security-governance'],
    source: 'Nextgov (demo)',
    title: 'Agency AI pilots demand grounded Copilot with data boundary proofs',
    summary:
      'UNCLASSIFIED/DEMO: Synthetic briefing notes that Fed AI sandboxes want citation + boundary guarantees before expanding Copilot scope.',
    publishedAt: '2026-09-16T16:45:00Z',
    trustTier: 'trade-press',
    whyItMatters: {
      'copilot-ai': 'Grounding and citation gaps show up in gov VoC alongside this desk.',
      'security-governance': 'Boundary proofs are a compliance narrative, not a chat feature.',
    },
  },
  {
    id: 'intel-gov-04',
    cloudDesk: 'gov',
    workloadIds: ['data-warehouse', 'power-bi'],
    source: 'CISA guidance desk (demo)',
    title: 'Reporting estate guidance echoes Direct Lake tenancy constraints',
    summary:
      'UNCLASSIFIED/DEMO: Illustrative compliance memo linking warehouse endpoints and BI semantic models to tenant isolation expectations.',
    publishedAt: '2026-09-15T09:00:00Z',
    trustTier: 'synthetic',
    whyItMatters: {
      'data-warehouse': 'SQL endpoint tenancy is the warehouse beat on this desk.',
      'power-bi': 'Direct Lake fallback guidance is the BI angle.',
    },
  },
  {
    id: 'intel-gov-05',
    cloudDesk: 'gov',
    workloadIds: ['realtime-analytics', 'pipelines'],
    source: 'Breaking Defense (demo)',
    title: 'Event-driven mission apps push for sovereign Eventstream paths',
    summary:
      'UNCLASSIFIED/DEMO: Synthetic industry note on latency and dead-letter needs inside USGov/IL network envelopes.',
    publishedAt: '2026-09-14T18:20:00Z',
    trustTier: 'trade-press',
    whyItMatters: {
      'realtime-analytics': 'Eventstream observability is the workload hook.',
      pipelines: 'Orchestration still owns the handoff into streaming jobs.',
    },
  },
  {
    id: 'intel-gov-06',
    cloudDesk: 'gov',
    workloadIds: ['data-engineering', 'onelake'],
    source: 'Azure Government blog (demo)',
    title: 'Spark session cold-start still cited in IL capacity planning decks',
    summary:
      'UNCLASSIFIED/DEMO: Demo digest — Livy/session reuse remains a talking point when IL SKUs are scarce.',
    publishedAt: '2026-09-13T13:10:00Z',
    trustTier: 'official',
    whyItMatters: {
      'data-engineering': 'Session startup themes align with this headline.',
      onelake: 'Capacity and lakehouse co-location show up together in IL plans.',
    },
  },
  {
    id: 'intel-gov-07',
    cloudDesk: 'gov',
    workloadIds: ['security-governance', 'pipelines'],
    source: 'FedRAMP watch (demo)',
    title: 'Authorization boundary updates tracked for analytics PaaS patterns',
    summary:
      'UNCLASSIFIED/DEMO: Synthetic FedRAMP posture card — not an ATO status. For UI demos of gov desk only.',
    publishedAt: '2026-09-12T10:00:00Z',
    trustTier: 'synthetic',
    whyItMatters: {
      'security-governance': 'ATO boundary language is the governance beat.',
      pipelines: 'Private networking / managed VNet asks hitch to this digest.',
    },
    relatedCompetitorPageId: 'cp-managed-vnet',
  },
  {
    id: 'intel-gov-08',
    cloudDesk: 'gov',
    workloadIds: ['data-science', 'copilot-ai'],
    source: 'Defense innovation unit desk (demo)',
    title: 'MLOps in mission clouds: experiment tracking without commercial SaaS bleed',
    summary:
      'UNCLASSIFIED/DEMO: Sample note on MLflow-style tracking expectations inside IL slices.',
    publishedAt: '2026-09-11T15:40:00Z',
    trustTier: 'synthetic',
    whyItMatters: {
      'data-science': 'Experiment tracking gaps are the DS hook.',
      'copilot-ai': 'Assistants are expected to stay inside the same boundary.',
    },
  },
  {
    id: 'intel-gov-09',
    cloudDesk: 'gov',
    workloadIds: ['onelake', 'data-integration'],
    source: 'Microsoft gov sample (demo)',
    title: 'Shortcut + Purview pairing remains the IL data-mesh talking point',
    summary:
      'UNCLASSIFIED/DEMO: Illustrative product note — not a roadmap commitment.',
    publishedAt: '2026-09-10T12:00:00Z',
    trustTier: 'official',
    whyItMatters: {
      onelake: 'Shortcuts and catalog are the OneLake story.',
      'data-integration': 'Ingest paths must honor the same catalog controls.',
    },
  },
  {
    id: 'intel-gov-10',
    cloudDesk: 'gov',
    workloadIds: ['power-bi', 'security-governance'],
    source: 'FCW (demo)',
    title: 'Agency BI centers ask for sovereign semantic-model promotion paths',
    summary:
      'UNCLASSIFIED/DEMO: Synthetic press — promotion and endorsement workflows under IL constraints.',
    publishedAt: '2026-09-09T17:25:00Z',
    trustTier: 'trade-press',
    whyItMatters: {
      'power-bi': 'Semantic model lifecycle is the BI workload link.',
      'security-governance': 'Endorsement is the control plane angle.',
    },
  },
  {
    id: 'intel-gov-11',
    cloudDesk: 'gov',
    workloadIds: ['pipelines', 'data-warehouse'],
    source: 'Contract vehicle radar (demo)',
    title: 'Upcoming data-platform vehicle language names orchestration + warehouse',
    summary:
      'UNCLASSIFIED/DEMO: Fake RFP radar card for demos — no live procurement data.',
    publishedAt: '2026-09-08T08:30:00Z',
    trustTier: 'synthetic',
    whyItMatters: {
      pipelines: 'Orchestration requirements map to Pipelines edition.',
      'data-warehouse': 'Warehouse SQL is listed beside orchestration in the sample.',
    },
  },
  {
    id: 'intel-gov-12',
    cloudDesk: 'gov',
    workloadIds: ['realtime-analytics', 'security-governance'],
    source: 'NSA Cybersecurity (demo excerpt)',
    title: 'Streaming telemetry guidance stresses retention and access boundaries',
    summary:
      'UNCLASSIFIED/DEMO: Paraphrased public-style guidance for desk realism only.',
    publishedAt: '2026-09-07T19:00:00Z',
    trustTier: 'synthetic',
    whyItMatters: {
      'realtime-analytics': 'Retention and dead-letter policy is the Eventstream angle.',
      'security-governance': 'Access boundaries close the loop.',
    },
  },
]

const COMMERCIAL_PACK: NewsIntelligenceItem[] = [
  {
    id: 'intel-com-01',
    cloudDesk: 'commercial',
    workloadIds: ['pipelines', 'data-integration'],
    source: 'The New Stack (demo)',
    title: 'Fabric Pipelines vs ADF: migration playbooks dominate community week',
    summary:
      'Commercial desk digest — practitioners trade ADF parity checklists and CI/CD patterns. Synthetic for demo.',
    publishedAt: '2026-09-18T13:00:00Z',
    trustTier: 'trade-press',
    whyItMatters: {
      pipelines: 'ADF migration is the loudest Pipelines theme in VoC.',
      'data-integration': 'Connector parity rides along in the same threads.',
    },
    relatedCompetitorPageId: 'cp-adf-migration',
  },
  {
    id: 'intel-com-02',
    cloudDesk: 'commercial',
    workloadIds: ['onelake', 'data-engineering'],
    source: 'SiliconANGLE (demo)',
    title: 'OneLake shortcuts and open table formats keep analyst week busy',
    summary:
      'Commercial industry note (synthetic): shortcuts, Delta, and catalog UX as the lakehouse conversation.',
    publishedAt: '2026-09-17T15:20:00Z',
    trustTier: 'trade-press',
    whyItMatters: {
      onelake: 'Shortcut UX is the OneLake beat.',
      'data-engineering': 'Spark/lakehouse teams care about table format friction.',
    },
  },
  {
    id: 'intel-com-03',
    cloudDesk: 'commercial',
    workloadIds: ['copilot-ai', 'power-bi'],
    source: 'Microsoft Fabric blog (demo)',
    title: 'Copilot in Warehouse and report authoring hit another GA milestone',
    summary:
      'Official-style commercial announcement digest — demo mirror of public blog cadence.',
    publishedAt: '2026-09-16T10:00:00Z',
    trustTier: 'official',
    whyItMatters: {
      'copilot-ai': 'GA notes set expectations that VoC will test next.',
      'power-bi': 'Report authoring Copilot is the BI hook.',
    },
  },
  {
    id: 'intel-com-04',
    cloudDesk: 'commercial',
    workloadIds: ['data-warehouse', 'power-bi'],
    source: 'InfoQ (demo)',
    title: 'Direct Lake guidance: when fallback is expected (and how to explain it)',
    summary:
      'Commercial analysis digest — synthetic echo of Direct Lake education content.',
    publishedAt: '2026-09-15T14:45:00Z',
    trustTier: 'trade-press',
    whyItMatters: {
      'power-bi': 'Fallback surprises drive BI don’t-likes.',
      'data-warehouse': 'Warehouse teams own the model that feeds Direct Lake.',
    },
    relatedCompetitorPageId: 'cp-direct-lake',
  },
  {
    id: 'intel-com-05',
    cloudDesk: 'commercial',
    workloadIds: ['realtime-analytics'],
    source: 'Confluent / industry (demo)',
    title: 'Eventstream production latency lessons make the rounds on HN',
    summary:
      'Commercial community digest — synthetic aggregation of latency and DLQ chatter.',
    publishedAt: '2026-09-14T20:10:00Z',
    trustTier: 'community',
    whyItMatters: {
      'realtime-analytics': 'Latency and dead-letter themes are the Real-Time beat.',
    },
  },
  {
    id: 'intel-com-06',
    cloudDesk: 'commercial',
    workloadIds: ['data-engineering', 'pipelines'],
    source: 'Databricks blog watch (demo)',
    title: 'Rival Lakeflow messaging keeps Fabric pipeline comparisons loud',
    summary:
      'Commercial competitor-watch digest — synthetic; pairs with Chronicle competitor page.',
    publishedAt: '2026-09-13T11:00:00Z',
    trustTier: 'trade-press',
    whyItMatters: {
      pipelines: 'Competitive framing shows up next to migration VoC.',
      'data-engineering': 'Spark positioning is the DE angle.',
    },
  },
  {
    id: 'intel-com-07',
    cloudDesk: 'commercial',
    workloadIds: ['data-science', 'copilot-ai'],
    source: 'Towards AI / community (demo)',
    title: 'Fabric notebooks vs Databricks assistant: experiment UX comparisons',
    summary:
      'Commercial community roundup (synthetic) on DS assistant ergonomics.',
    publishedAt: '2026-09-12T16:30:00Z',
    trustTier: 'community',
    whyItMatters: {
      'data-science': 'Notebook/ML experiment UX is the DS link.',
      'copilot-ai': 'Assistant comparisons feed Copilot expectations.',
    },
  },
  {
    id: 'intel-com-08',
    cloudDesk: 'commercial',
    workloadIds: ['security-governance', 'onelake'],
    source: 'Gartner/Forrester echo (demo)',
    title: 'Analyst week: data governance platforms and Fabric Purview pairing',
    summary:
      'Commercial analyst-week package (synthetic) — not licensed content.',
    publishedAt: '2026-09-11T09:15:00Z',
    trustTier: 'synthetic',
    whyItMatters: {
      'security-governance': 'Governance platform comparisons are the desk lead.',
      onelake: 'Catalog pairing keeps OneLake in the same package.',
    },
  },
  {
    id: 'intel-com-09',
    cloudDesk: 'commercial',
    workloadIds: ['data-integration'],
    source: 'Airbyte / Fivetran watch (demo)',
    title: 'SaaS connector race reframes Dataflow Gen2 expectations',
    summary:
      'Commercial peer-move digest — synthetic connector cadence notes.',
    publishedAt: '2026-09-10T13:50:00Z',
    trustTier: 'trade-press',
    whyItMatters: {
      'data-integration': 'Connector coverage is the Integration workload story.',
    },
    relatedCompetitorPageId: 'cp-connectors',
  },
  {
    id: 'intel-com-10',
    cloudDesk: 'commercial',
    workloadIds: ['power-bi', 'data-warehouse'],
    source: 'Power BI community (demo)',
    title: 'Semantic model CI and deployment pipelines stay a hot thread',
    summary:
      'Commercial community digest — synthetic forum/blog blend.',
    publishedAt: '2026-09-09T18:00:00Z',
    trustTier: 'community',
    whyItMatters: {
      'power-bi': 'Semantic model devops is a recurring BI want.',
      'data-warehouse': 'Warehouse teams feel the same promotion pain.',
    },
  },
  {
    id: 'intel-com-11',
    cloudDesk: 'commercial',
    workloadIds: ['pipelines', 'security-governance'],
    source: 'Microsoft Learn (demo)',
    title: 'Managed VNet and workspace networking docs refresh',
    summary:
      'Official commercial docs digest — demo mirror for networking asks.',
    publishedAt: '2026-09-08T12:40:00Z',
    trustTier: 'official',
    whyItMatters: {
      pipelines: 'Managed VNet is a Pipelines migration blocker theme.',
      'security-governance': 'Network isolation is the governance twin.',
    },
    relatedCompetitorPageId: 'cp-managed-vnet',
  },
  {
    id: 'intel-com-12',
    cloudDesk: 'commercial',
    workloadIds: ['other', 'copilot-ai'],
    source: 'Capacity & SKU watch (demo)',
    title: 'Fabric capacity sizing threads spike after price-performance posts',
    summary:
      'Commercial industry desk — synthetic capacity chatter for General edition.',
    publishedAt: '2026-09-07T21:00:00Z',
    trustTier: 'community',
    whyItMatters: {
      other: 'Capacity/SKU is the general Fabric beat.',
      'copilot-ai': 'Copilot usage is often blamed in capacity spikes.',
    },
  },
]

export const DEMO_INTELLIGENCE_NEWS: NewsIntelligenceItem[] = [...GOV_PACK, ...COMMERCIAL_PACK]

export const INTEL_COUNTS = {
  gov: GOV_PACK.length,
  commercial: COMMERCIAL_PACK.length,
  total: DEMO_INTELLIGENCE_NEWS.length,
} as const
