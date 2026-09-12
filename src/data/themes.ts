import type { ThemeDefinition } from '../types'

/**
 * Keyword theme definitions. Clustering is generalizable: add/edit
 * definitions and mentions are re-assigned by case-insensitive keyword match.
 */
export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'theme-shortcuts',
    name: 'OneLake shortcut reliability',
    description: 'Broken shortcuts after token rotation, S3 permissions, and endorsement of shortcut objects.',
    keywords: ['shortcut', 'shortcuts', 'token rotate', 's3'],
  },
  {
    id: 'theme-direct-lake',
    name: 'Direct Lake fallback & performance',
    description: 'Direct Lake wins plus painful, quiet fallback to DirectQuery on executive dashboards.',
    keywords: ['direct lake', 'directquery', 'fallback'],
  },
  {
    id: 'theme-copilot',
    name: 'Copilot accuracy & grounding',
    description: 'Strong SQL help next to hallucinated activities and incorrect DAX — users want grounded tool lists.',
    keywords: ['copilot', 'hallucinated', 'dax', 'double counted'],
  },
  {
    id: 'theme-spark-start',
    name: 'Spark / Livy session startup',
    description: 'Cold-start times, kernel crashes, and praise for session reuse.',
    keywords: ['spark session', 'livy', 'notebook', 'cold start', '2xlarge'],
  },
  {
    id: 'theme-dataflow',
    name: 'Dataflow Gen2 refresh trust',
    description: 'Silent refresh failures, staging lakehouse UX, and connector wins.',
    keywords: ['dataflow gen2', 'refresh failed', 'staging lakehouse', 'connector'],
  },
  {
    id: 'theme-eventstream',
    name: 'Eventstream latency & drops',
    description: 'p99 latency spikes and silent destination drops without dead-lettering.',
    keywords: ['eventstream', 'latency', 'dropped', 'eventhouse', 'kql'],
  },
  {
    id: 'theme-pipelines',
    name: 'Pipeline orchestration UX',
    description: 'Timeouts, slow run history, child-pipeline parameters, and trigger misses after capacity pause.',
    keywords: ['pipeline', 'trigger', 'foreach', 'child pipeline', 'run history'],
  },
  {
    id: 'theme-capacity',
    name: 'Capacity SKU, billing & metrics',
    description: 'F64 pause traps, warehouse bill spikes, lagging capacity metrics, SKU confusion.',
    keywords: ['f64', 'capacity', 'bill', 'sku', 'bursting', 'metrics app'],
  },
  {
    id: 'theme-warehouse',
    name: 'Warehouse compute & T-SQL',
    description: 'T-SQL completeness vs inconsistent caching and warehouse-vs-lakehouse guidance.',
    keywords: ['warehouse', 't-sql', 'result set caching', 'sql endpoint'],
  },
  {
    id: 'theme-governance',
    name: 'Endorsement & admin monitoring',
    description: 'Unclear endorsement model and monitoring hub gaps versus workspace truth.',
    keywords: ['endorsed', 'certified', 'endorsement', 'monitoring hub', 'private links'],
  },
  {
    id: 'theme-positioning',
    name: 'Migration & competitive positioning',
    description: 'ADF migration, Premium-to-Fabric moves, and Fabric vs Databricks for mid-size teams.',
    keywords: ['adf', 'databricks', 'premium', 'migration', 'skus'],
  },
  {
    id: 'theme-naming',
    name: 'Naming, docs & decision trees',
    description: 'Activator vs Reflex, Dataflow vs Copy vs Spark, and conflicting Learn articles.',
    keywords: ['activator', 'reflex', 'decision tree', 'docs', 'guidance', 'naming'],
  },
]
