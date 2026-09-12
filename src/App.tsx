import { useEffect, useMemo, useState } from 'react'
import { DemoBanner } from './components/DemoBanner'
import { Header } from './components/Header'
import { KpiRow } from './components/KpiRow'
import { MentionStream } from './components/MentionStream'
import { NewsFeed } from './components/NewsFeed'
import { SentimentCharts } from './components/SentimentCharts'
import { SuggestedActions } from './components/SuggestedActions'
import { ThemeExplorer } from './components/ThemeExplorer'
import { WorkloadBreakdown } from './components/WorkloadBreakdown'
import { pulseProvider } from './data/provider'
import { filterMentions, viewFromMentions } from './lib/aggregate'
import type { PulseSnapshot, WorkloadFilter } from './types'

export default function App() {
  const [snapshot, setSnapshot] = useState<PulseSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [workload, setWorkload] = useState<WorkloadFilter>('all')
  const [themeId, setThemeId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    pulseProvider
      .getSnapshot()
      .then((data) => {
        if (!cancelled) setSnapshot(data)
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Failed to load demo data')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const view = useMemo(() => {
    if (!snapshot) return null
    const scopedMentions = snapshot.mentions.filter((mention) =>
      workload === 'all' ? true : mention.workload === workload,
    )
    const derived = viewFromMentions(scopedMentions, snapshot.themeDefinitions)
    const selectedTheme = derived.themes.find((theme) => theme.id === themeId) ?? null
    const mentions = filterMentions(snapshot.mentions, workload, selectedTheme)
    return {
      ...derived,
      mentions,
      selectedTheme,
    }
  }, [snapshot, themeId, workload])

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-canvas px-6 text-neg">
        {error}
      </div>
    )
  }

  if (!snapshot || !view) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-canvas text-mute">
        <p className="text-sm">Loading Fabric Pulse demo…</p>
      </div>
    )
  }

  return (
    <div className="pulse-grid min-h-svh">
      <DemoBanner />
      <Header
        kpis={view.kpis}
        daily={view.daily}
        dateRange={snapshot.dateRange}
        workload={workload}
        onClear={() => {
          setWorkload('all')
          setThemeId(null)
        }}
      />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-4 pb-10 lg:px-6">
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
        <footer className="pt-2 text-center text-[11px] text-faint">
          Fabric Pulse prototype · {snapshot.demoDisclaimer} · {snapshot.dateRange.label}
        </footer>
      </main>
    </div>
  )
}
