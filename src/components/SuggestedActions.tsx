import { useMemo, useState } from 'react'
import type { SuggestedAction, ThemeInsight, WorkloadFilter } from '../types'
import { WORKLOAD_CATALOG } from '../data/catalog'
import { Card, EffortImpact, EmptyState, SectionTitle, ToneBadge } from './ui'

type ImpactFilter = 'all' | 'high' | 'low-effort'

export function SuggestedActions({
  actions,
  themes,
  workload,
}: {
  actions: SuggestedAction[]
  themes: ThemeInsight[]
  workload: WorkloadFilter
}) {
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>('all')
  const themeNames = new Map(themes.map((theme) => [theme.id, theme.name]))

  const visible = useMemo(() => {
    return actions
      .filter((action) => (workload === 'all' ? true : action.workload === workload))
      .filter((action) => {
        if (impactFilter === 'high') return action.impact === 'high'
        if (impactFilter === 'low-effort') return action.effort === 'low'
        return true
      })
      .sort((a, b) => rank(b) - rank(a))
  }, [actions, impactFilter, workload])

  return (
    <Card className="p-4">
      <SectionTitle
        title="Suggested product-team actions"
        hint="Derived from current sentiment + theme clusters. Effort/impact are demo estimates."
        action={
          <div className="flex gap-1">
            {(
              [
                ['all', 'All'],
                ['high', 'High impact'],
                ['low-effort', 'Low effort'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setImpactFilter(id)}
                className={`rounded-full px-2.5 py-1 text-[11px] ${
                  impactFilter === id ? 'bg-teal/20 text-teal-bright' : 'text-mute hover:bg-elevated'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />
      {visible.length === 0 ? (
        <EmptyState label="No suggested actions for this filter." />
      ) : (
        <ul className="max-h-[460px] space-y-2 overflow-auto pr-1">
          {visible.map((action) => (
            <li key={action.id} className="rounded-xl border border-line bg-elevated/40 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium text-ink">{action.title}</p>
                <EffortImpact effort={action.effort} impact={action.impact} />
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-mute">{action.rationale}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <ToneBadge tone="teal" label={WORKLOAD_CATALOG[action.workload].shortLabel} />
                <ToneBadge tone="mute" label={action.ownerHint} />
                {action.relatedThemeIds.map((id) => (
                  <ToneBadge key={id} tone="mute" label={themeNames.get(id) ?? id} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function rank(action: SuggestedAction): number {
  const impact = action.impact === 'high' ? 3 : action.impact === 'medium' ? 2 : 1
  const effort = action.effort === 'low' ? 3 : action.effort === 'medium' ? 2 : 1
  return impact * 10 + effort
}
