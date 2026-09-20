import { CloudBoundarySwitcher } from './atelier/CloudBoundarySwitcher'
import { FabricMark } from './atelier/FabricMark'
import { SourcesControl } from './atelier/SourcesPanel'
import { WorkloadSwitcher } from './atelier/WorkloadSwitcher'
import { ModeSwitcher } from './ModeSwitcher'
import { NewsDeskRail } from './atelier/NewsDeskRail'
import type {
  CloudBoundaryFilter,
  NewsIntelligenceItem,
  SourceRegistryEntry,
  WorkloadFilter,
} from '../types'

/** Shared atelier shell: wordmark once, mode switcher, sparse workload + cloud pills + Sources. */
export function MinimalChrome({
  inkClass = 'text-[#1a2a3a]',
  workload,
  setWorkload,
  cloud,
  setCloud,
  tone = 'light',
  sourceRegistry,
  enabledSourceIds,
  setEnabledSourceIds,
  intelligenceNews,
  showNewsDesk = true,
}: {
  inkClass?: string
  workload: WorkloadFilter
  setWorkload: (next: WorkloadFilter) => void
  cloud: CloudBoundaryFilter
  setCloud: (next: CloudBoundaryFilter) => void
  tone?: 'light' | 'dark' | 'inherit'
  sourceRegistry?: SourceRegistryEntry[]
  enabledSourceIds?: Set<string>
  setEnabledSourceIds?: (next: Set<string>) => void
  intelligenceNews?: NewsIntelligenceItem[]
  showNewsDesk?: boolean
}) {
  return (
    <div className={`relative z-20 ${inkClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <FabricMark />
        <div className="flex flex-wrap items-center gap-2">
          {sourceRegistry && enabledSourceIds && setEnabledSourceIds ? (
            <SourcesControl
              registry={sourceRegistry}
              enabledIds={enabledSourceIds}
              onChange={setEnabledSourceIds}
              tone={tone === 'inherit' ? 'light' : tone}
            />
          ) : null}
          <ModeSwitcher variant="artistic" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5 px-4 pb-2">
        <WorkloadSwitcher value={workload} onChange={setWorkload} tone={tone} />
        <CloudBoundarySwitcher value={cloud} onChange={setCloud} tone={tone} />
      </div>
      {showNewsDesk ? (
        <NewsDeskRail
          cloud={cloud}
          workload={workload}
          items={intelligenceNews}
          tone={tone}
          compact
        />
      ) : null}
    </div>
  )
}
