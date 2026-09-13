import { CloudBoundarySwitcher } from './atelier/CloudBoundarySwitcher'
import { FabricMark } from './atelier/FabricMark'
import { WorkloadSwitcher } from './atelier/WorkloadSwitcher'
import { ModeSwitcher } from './ModeSwitcher'
import type { CloudBoundaryFilter, WorkloadFilter } from '../types'

/** Shared atelier shell: wordmark once, mode switcher, sparse workload + cloud pills. */
export function MinimalChrome({
  inkClass = 'text-[#1a2a3a]',
  workload,
  setWorkload,
  cloud,
  setCloud,
  tone = 'light',
}: {
  inkClass?: string
  workload: WorkloadFilter
  setWorkload: (next: WorkloadFilter) => void
  cloud: CloudBoundaryFilter
  setCloud: (next: CloudBoundaryFilter) => void
  tone?: 'light' | 'dark' | 'inherit'
}) {
  return (
    <div className={`relative z-20 ${inkClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <FabricMark />
        <ModeSwitcher variant="artistic" />
      </div>
      <div className="flex flex-col items-center gap-1.5 px-4 pb-2">
        <WorkloadSwitcher value={workload} onChange={setWorkload} tone={tone} />
        <CloudBoundarySwitcher value={cloud} onChange={setCloud} tone={tone} />
      </div>
    </div>
  )
}
