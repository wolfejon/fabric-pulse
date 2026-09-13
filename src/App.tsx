import { useEffect, useMemo, useState } from 'react'
import { DemoBanner } from './components/DemoBanner'
import { Header } from './components/Header'
import { MinimalChrome } from './components/MinimalChrome'
import { ModeSwitcher } from './components/ModeSwitcher'
import { AskThePulse } from './components/layouts/AskThePulse'
import { ClassicDashboard } from './components/layouts/ClassicDashboard'
import { LetterReceipts } from './components/layouts/LetterReceipts'
import { StoryTimeline } from './components/layouts/StoryTimeline'
import { VolumePainMap } from './components/layouts/VolumePainMap'
import { WarRoom } from './components/layouts/WarRoom'
import { WeatherReport } from './components/layouts/WeatherReport'
import { pulseProvider } from './data/provider'
import { useLayout } from './layout/LayoutProvider'
import { isArtisticLayout } from './layout/layouts'
import { filterMentions, viewFromMentions } from './lib/aggregate'
import { buildWeatherNarrative } from './lib/narrative'
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

  const artistic = isArtisticLayout(layoutId)

  const weather = useMemo(() => {
    if (!view) return null
    return buildWeatherNarrative(view.kpis, view.themes, view.workloads)
  }, [view])

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

  if (artistic && layoutId === 'weather' && weather) {
    return (
      <div
        className={`min-h-svh bg-gradient-to-b ${weather.skyClass} ${weather.inkClass}`}
        data-experience="weather"
      >
        <DemoBanner quiet />
        <MinimalChrome inkClass={weather.inkClass} />
        <WeatherReport {...layoutProps} nested />
      </div>
    )
  }

  if (artistic && layoutId === 'letter') {
    return (
      <div className="min-h-svh bg-[#f3eee6] text-[#1c1915]" data-experience="letter">
        <DemoBanner quiet />
        <MinimalChrome inkClass="text-[#1c1915]" />
        <LetterReceipts {...layoutProps} nested />
      </div>
    )
  }

  return (
    <div className="pulse-grid min-h-svh">
      <DemoBanner />
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-amber">
          Old dashboard archive · deprecated
        </p>
        <ModeSwitcher variant="archive" />
      </div>
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
          Fabric Pulse prototype · {snapshot.demoDisclaimer} · {snapshot.dateRange.label} · archive:{' '}
          {layoutId}
        </footer>
      </main>
    </div>
  )
}
