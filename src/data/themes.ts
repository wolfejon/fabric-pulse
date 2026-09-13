import type { ThemeDefinition } from '../types'

/**
 * Keyword theme definitions. Clustering is generalizable: add/edit
 * definitions and mentions are re-assigned by case-insensitive keyword match.
 * polarity marks want vs friction for Coverage / Plan Mirror.
 */
export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'theme-shortcuts',
    name: 'OneLake shortcut reliability',
    description: 'Broken shortcuts after token rotation, S3 permissions, and endorsement of shortcut objects.',
    keywords: ['shortcut', 'shortcuts', 'token rotate', 's3'],
    polarity: 'dont-like',
  },
  {
    id: 'theme-direct-lake',
    name: 'Direct Lake fallback & performance',
    description: 'Direct Lake wins plus painful, quiet fallback to DirectQuery on executive dashboards.',
    keywords: ['direct lake', 'directquery', 'fallback'],
    polarity: 'mixed',
  },
  {
    id: 'theme-copilot',
    name: 'Copilot accuracy & grounding',
    description: 'Strong SQL help next to hallucinated activities and incorrect DAX — users want grounded tool lists.',
    keywords: ['copilot', 'hallucinated', 'dax', 'double counted'],
    polarity: 'mixed',
  },
  {
    id: 'theme-spark-start',
    name: 'Spark / Livy session startup',
    description: 'Cold-start times, kernel crashes, and praise for session reuse.',
    keywords: ['spark session', 'livy', 'notebook', 'cold start', '2xlarge'],
    polarity: 'mixed',
  },
  {
    id: 'theme-dataflow',
    name: 'Dataflow Gen2 refresh trust',
    description: 'Silent refresh failures, staging lakehouse UX, and connector wins.',
    keywords: ['dataflow gen2', 'refresh failed', 'staging lakehouse', 'connector'],
    polarity: 'dont-like',
  },
  {
    id: 'theme-eventstream',
    name: 'Eventstream latency & drops',
    description: 'p99 latency spikes and silent destination drops without dead-lettering.',
    keywords: ['eventstream', 'latency', 'dropped', 'eventhouse', 'kql'],
    polarity: 'dont-like',
  },
  {
    id: 'theme-pipelines',
    name: 'Pipeline orchestration UX',
    description: 'Timeouts, slow run history, child-pipeline parameters, and trigger misses after capacity pause.',
    keywords: ['pipeline', 'trigger', 'foreach', 'child pipeline', 'run history'],
    polarity: 'mixed',
  },
  {
    id: 'theme-capacity',
    name: 'Capacity SKU, billing & metrics',
    description: 'F64 pause traps, warehouse bill spikes, lagging capacity metrics, SKU confusion.',
    keywords: ['f64', 'capacity', 'bill', 'sku', 'bursting', 'metrics app'],
    polarity: 'dont-like',
  },
  {
    id: 'theme-warehouse',
    name: 'Warehouse compute & T-SQL',
    description: 'T-SQL completeness vs inconsistent caching and warehouse-vs-lakehouse guidance.',
    keywords: ['warehouse', 't-sql', 'result set caching', 'sql endpoint'],
    polarity: 'mixed',
  },
  {
    id: 'theme-governance',
    name: 'Endorsement & admin monitoring',
    description: 'Unclear endorsement model and monitoring hub gaps versus workspace truth.',
    keywords: ['endorsed', 'certified', 'endorsement', 'monitoring hub', 'private links'],
    polarity: 'dont-like',
  },
  {
    id: 'theme-positioning',
    name: 'Migration & competitive positioning',
    description: 'ADF migration, Premium-to-Fabric moves, and Fabric vs Databricks for mid-size teams.',
    keywords: ['adf', 'databricks', 'premium', 'migration', 'skus'],
    polarity: 'mixed',
  },
  {
    id: 'theme-naming',
    name: 'Naming, docs & decision trees',
    description: 'Activator vs Reflex, Dataflow vs Copy vs Spark, and conflicting Learn articles.',
    keywords: ['activator', 'reflex', 'decision tree', 'docs', 'guidance', 'naming'],
    polarity: 'dont-like',
  },
  // --- Want themes (requests / praise clusters) ---
  {
    id: 'theme-gov-pipelines',
    name: 'USGov pipeline parity',
    description: 'Government cloud customers want commercial pipeline feature parity — managed VNet, CI/CD, richer diagnostics.',
    keywords: ['usgov', 'gov cloud', 'government', 'il4', 'il5', 'fedramp'],
    polarity: 'want',
    cloudBoundary: 'usgov',
  },
  {
    id: 'theme-gov-private-link',
    name: 'Private link & sovereign networking',
    description: 'Private endpoints, sovereign DNS, and cross-boundary shortcut networking for USNat / USSec estates.',
    keywords: ['private endpoint', 'sovereign', 'usnat', 'ussec', 'air-gapped'],
    polarity: 'want',
  },
  {
    id: 'theme-retry-diagnostics',
    name: 'Richer pipeline retry diagnostics',
    description: 'Authors want actionable retry / timeout diagnostics instead of opaque "failed" states.',
    keywords: ['retry', 'timed out', 'diagnostics', 'failed'],
    polarity: 'want',
  },
  {
    id: 'theme-session-reuse',
    name: 'Default Spark session reuse',
    description: 'Praise for Livy session reuse; request to make it the default cold-start fix.',
    keywords: ['session reuse', 'game changer', 'cold start'],
    polarity: 'want',
  },
  {
    id: 'theme-dead-letter',
    name: 'Eventstream dead-lettering',
    description: 'Silent drops without dead-letter queues; customers ask for durable failure paths.',
    keywords: ['dead-letter', 'silently dropped', 'partition'],
    polarity: 'want',
  },
  {
    id: 'theme-copilot-grounding',
    name: 'Grounded Copilot tool lists',
    description: 'Stop hallucinated pipeline activities; ship workspace-aware, grounded tool catalogs.',
    keywords: ['grounded', 'fuzzylookup', 'hallucinated', 'tool list'],
    polarity: 'want',
  },
]
