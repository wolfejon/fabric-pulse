import type { WorkloadId, WorkloadMeta } from '../types'

export const WORKLOAD_CATALOG: Record<WorkloadId, WorkloadMeta> = {
  pipelines: {
    id: 'pipelines',
    label: 'Fabric Pipelines',
    shortLabel: 'Pipelines',
    blurb: 'Orchestration, activities, and triggers',
  },
  'data-engineering': {
    id: 'data-engineering',
    label: 'Data Engineering',
    shortLabel: 'Data Eng',
    blurb: 'Lakehouse, Spark, notebooks',
  },
  'data-integration': {
    id: 'data-integration',
    label: 'Data Integration',
    shortLabel: 'Integration',
    blurb: 'Dataflow Gen2, connectors, copy',
  },
  onelake: {
    id: 'onelake',
    label: 'OneLake',
    shortLabel: 'OneLake',
    blurb: 'Shortcuts, explorer, single copy',
  },
  'data-warehouse': {
    id: 'data-warehouse',
    label: 'Data Warehouse',
    shortLabel: 'Warehouse',
    blurb: 'T-SQL warehouse and SQL endpoint',
  },
  'realtime-analytics': {
    id: 'realtime-analytics',
    label: 'Real-Time Analytics / Eventstream',
    shortLabel: 'Real-Time',
    blurb: 'Eventstream, Eventhouse, Activator',
  },
  'data-science': {
    id: 'data-science',
    label: 'Data Science',
    shortLabel: 'Data Science',
    blurb: 'Experiments, models, notebooks',
  },
  'power-bi': {
    id: 'power-bi',
    label: 'Power BI / Fabric BI',
    shortLabel: 'Power BI',
    blurb: 'Semantic models, Direct Lake, reports',
  },
  'copilot-ai': {
    id: 'copilot-ai',
    label: 'Copilot / AI',
    shortLabel: 'Copilot',
    blurb: 'Copilot across workloads',
  },
  'security-governance': {
    id: 'security-governance',
    label: 'Security & Governance',
    shortLabel: 'Governance',
    blurb: 'Endorsement, admin, private links',
  },
  other: {
    id: 'other',
    label: 'Other / General Fabric',
    shortLabel: 'General',
    blurb: 'Capacity, SKUs, positioning',
  },
}

