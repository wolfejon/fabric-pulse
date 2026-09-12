import { useEffect, useMemo, useState } from 'react'
import { DemoBanner } from './components/DemoBanner'
import { Header } from './components/Header'
import { AskThePulse } from './components/layouts/AskThePulse'
import { ClassicDashboard } from './components/layouts/ClassicDashboard'
import { StoryTimeline } from './components/layouts/StoryTimeline'
import { VolumePainMap } from './components/layouts/VolumePainMap'
import { WarRoom } from './components/layouts/WarRoom'
import { pulseProvider } from './data/provider'
import { useLayout } from './layout/LayoutProvider'
import { filterMentions, viewFromMentions } from './lib/aggregate'
import type { PulseSnapshot, WorkloadFilter } from './types'

export default function App() {
  const { layoutId } = useLayout()
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

  const onClearFilters = () => {
    setWorkload('all')
    setThemeId(null)
  }

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

  const layoutProps = {
    snapshot,
    view,
    workload,
    themeId,
    setWorkload,
    setThemeId,
    onClearFilters,
  }

  return (
    <div className="pulse-grid min-h-svh">
      <DemoBanner />
      <Header
        kpis={view.kpis}
        daily={view.daily}
        dateRange={snapshot.dateRange}
        workload={workload}
        themeFilterLabel={view.selectedTheme?.name ?? null}
        onClear={onClearFilters}
      />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-4 pb-10 lg:px-6">
        {layoutId === 'classic' ? <ClassicDashboard {...layoutProps} /> : null}
        {layoutId === 'diagnosis-object' ? <VolumePainMap {...layoutProps} /> : null}
        {layoutId === 'spike-cinema' ? <StoryTimeline {...layoutProps} /> : null}
        {layoutId === 'ask-the-pulse' ? <AskThePulse {...layoutProps} /> : null}
        {layoutId === 'war-room' ? <WarRoom {...layoutProps} /> : null}
        <footer className="pt-2 text-center text-[11px] text-faint">
          Fabric Pulse prototype · {snapshot.demoDisclaimer} · {snapshot.dateRange.label} · layout:{' '}
          {layoutId}
        </footer>
      </main>
    </div>
  )
}
