import { KpiRow } from '../KpiRow'
import { MentionStream } from '../MentionStream'
import { NewsFeed } from '../NewsFeed'
import { SentimentCharts } from '../SentimentCharts'
import { SuggestedActions } from '../SuggestedActions'
import { ThemeExplorer } from '../ThemeExplorer'
import { WorkloadBreakdown } from '../WorkloadBreakdown'
import type { LayoutProps } from './types'

/** Current scroll dashboard — preserved as Classic layout. */
export function ClassicDashboard({
  snapshot,
  view,
  workload,
  themeId,
  setWorkload,
  setThemeId,
}: LayoutProps) {
  return (
    <>
      <KpiRow kpis={view.kpis} />
      <SentimentCharts daily={view.daily} kpis={view.kpis} />
      <WorkloadBreakdown
        workloads={view.workloads}
        selected={workload}
        onSelect={(next) => {
          setWorkload(next)
          setThemeId(null)
        }}
      />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <ThemeExplorer
          themes={view.themes}
          mentions={view.mentions}
          selectedId={themeId}
          onSelect={setThemeId}
        />
        <SuggestedActions actions={snapshot.actions} themes={view.themes} workload={workload} />
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <NewsFeed news={snapshot.news} workload={workload} />
        <MentionStream mentions={view.mentions} now={snapshot.generatedAt} />
      </div>
    </>
  )
}
