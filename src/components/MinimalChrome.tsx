import { FabricMark } from './atelier/FabricMark'
import { WorkloadSwitcher } from './atelier/WorkloadSwitcher'
import { ModeSwitcher } from './ModeSwitcher'
import type { WorkloadFilter } from '../types'

/** Shared atelier shell: wordmark once, mode switcher, sparse workload pills. */
export function MinimalChrome({
  inkClass = 'text-[#1a2a3a]',
  workload,
  setWorkload,
  tone = 'light',
}: {
  inkClass?: string
  workload: WorkloadFilter
  setWorkload: (next: WorkloadFilter) => void
  tone?: 'light' | 'dark' | 'inherit'
}) {
  return (
    <div className={`relative z-20 ${inkClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <FabricMark />
        <ModeSwitcher variant="artistic" />
      </div>
      <div className="flex justify-center px-4 pb-2">
        <WorkloadSwitcher value={workload} onChange={setWorkload} tone={tone} />
      </div>
    </div>
  )
}
