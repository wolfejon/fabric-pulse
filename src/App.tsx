import { useEffect, useMemo, useState, type ReactNode } from 'react'
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
import {
  ConstellationName,
  Coverage,
  DeskGlobe,
  FabricHorizon,
  InkWash,
  LakeRipple,
  PulseStamp,
  Newspaper,
  QuietCredits,
  SignalLantern,
  StageLight,
  WeaveThread,
} from './components/layouts/atelier'
import { pulseProvider } from './data/provider'
import { useLayout } from './layout/LayoutProvider'
import { isArtisticLayout, type LayoutId } from './layout/layouts'
import { filterMentions, matchesCloudFilter, viewFromMentions } from './lib/aggregate'
import { buildWeatherNarrative } from './lib/narrative'
import type { CloudBoundaryFilter, PulseSnapshot, WorkloadFilter } from './types'

type ShellTone = 'light' | 'dark' | 'inherit'

const ATELIER_SHELL: Partial<
  Record<LayoutId, { className: string; ink: string; tone: ShellTone; experience: string }>
> = {
  weather: {
    className: '',
    ink: 'text-[#1a2a3a]',
    tone: 'inherit',
    experience: 'weather',
  },
  letter: {
    className: 'bg-[#f3eee6] text-[#1c1915]',
    ink: 'text-[#1c1915]',
    tone: 'light',
    experience: 'letter',
  },
  'fabric-horizon': {
    className: 'bg-[#1a2a3a] text-white',
    ink: 'text-white',
    tone: 'dark',
    experience: 'horizon',
  },
  'weave-thread': {
    className: 'bg-[#f7f4ef] text-[#1a2a3a]',
    ink: 'text-[#1a2a3a]',
    tone: 'light',
    experience: 'weave',
  },
  constellation: {
    className: 'bg-[#12081f] text-[#f0eaf8]',
    ink: 'text-[#f0eaf8]',
    tone: 'dark',
    experience: 'constellation',
  },
  'pulse-stamp': {
    className: 'bg-[#d4c4a8] text-[#1c1915]',
    ink: 'text-[#1c1915]',
    tone: 'light',
    experience: 'stamp',
  },
  'lake-ripple': {
    className: 'bg-[#0c3d4a] text-white',
    ink: 'text-white',
    tone: 'dark',
    experience: 'ripple',
  },
  'stage-light': {
    className: 'bg-[#0a0812] text-[#f5f0ff]',
    ink: 'text-[#f5f0ff]',
    tone: 'dark',
    experience: 'stage',
  },
  'ink-wash': {
    className: 'bg-[#f6f1e8] text-[#1a1814]',
    ink: 'text-[#1a1814]',
    tone: 'light',
    experience: 'ink',
  },
  'desk-globe': {
    className: 'bg-[#ebe6dc] text-[#1a2a3a]',
    ink: 'text-[#1a2a3a]',
    tone: 'light',
    experience: 'globe',
  },
  'signal-lantern': {
    className: 'bg-[#121018] text-[#f0eaf8]',
    ink: 'text-[#f0eaf8]',
    tone: 'dark',
    experience: 'lantern',
  },
  'quiet-credits': {
    className: 'bg-[#0b0a10] text-[#f5f0ff]',
    ink: 'text-[#f5f0ff]',
    tone: 'dark',
    experience: 'credits',
  },
  newspaper: {
    className: 'bg-[#f2ebe0] text-[#1a1a18]',
    ink: 'text-[#1a1a18]',
    tone: 'light',
    experience: 'newspaper',
  },
  coverage: {
    className: 'bg-[#f3eee6] text-[#1c1915]',
    ink: 'text-[#1c1915]',
    tone: 'light',
    experience: 'coverage',
  },
}

function AtelierFrame({
  layoutId,
  weatherSky,
  weatherInk,
  workload,
  setWorkload,
  cloud,
  setCloud,
  children,
}: {
  layoutId: LayoutId
  weatherSky?: string
  weatherInk?: string
  workload: WorkloadFilter
  setWorkload: (next: WorkloadFilter) => void
  cloud: CloudBoundaryFilter
  setCloud: (next: CloudBoundaryFilter) => void
  children: ReactNode
}) {
  const shell = ATELIER_SHELL[layoutId]
  if (!shell) return null

  const className =
    layoutId === 'weather' && weatherSky
      ? `min-h-svh bg-gradient-to-b ${weatherSky} ${weatherInk ?? shell.ink}`
      : `min-h-svh ${shell.className}`

  return (
    <div className={className} data-experience={shell.experience}>
      <DemoBanner quiet />
      <MinimalChrome
        inkClass={layoutId === 'weather' && weatherInk ? weatherInk : shell.ink}
        workload={workload}
        setWorkload={setWorkload}
        cloud={cloud}
        setCloud={setCloud}
        tone={shell.tone}
      />
      {children}
    </div>
  )
}

export default function App() {
  const { layoutId } = useLayout()
  const [snapshot, setSnapshot] = useState<PulseSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [workload, setWorkload] = useState<WorkloadFilter>('all')
  const [cloud, setCloud] = useState<CloudBoundaryFilter>('all')
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
    const scopedMentions = snapshot.mentions.filter((mention) => {
      if (workload !== 'all' && mention.workload !== workload) return false
      if (!matchesCloudFilter(mention.cloudBoundary, cloud)) return false
      return true
    })
    const derived = viewFromMentions(scopedMentions, snapshot.themeDefinitions)
    const selectedTheme = derived.themes.find((theme) => theme.id === themeId) ?? null
    const mentions = filterMentions(snapshot.mentions, workload, selectedTheme, cloud)
    return {
      ...derived,
      mentions,
      selectedTheme,
    }
  }, [snapshot, themeId, workload, cloud])

  const onClearFilters = () => {
    setWorkload('all')
    setCloud('all')
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
    cloud,
    themeId,
    setWorkload,
    setCloud,
    setThemeId,
    onClearFilters,
  }

  if (artistic) {
    let body: ReactNode = null
    if (layoutId === 'weather') body = <WeatherReport {...layoutProps} nested />
    else if (layoutId === 'letter') body = <LetterReceipts {...layoutProps} nested />
    else if (layoutId === 'fabric-horizon') body = <FabricHorizon {...layoutProps} />
    else if (layoutId === 'weave-thread') body = <WeaveThread {...layoutProps} />
    else if (layoutId === 'constellation') body = <ConstellationName {...layoutProps} />
    else if (layoutId === 'pulse-stamp') body = <PulseStamp {...layoutProps} />
    else if (layoutId === 'lake-ripple') body = <LakeRipple {...layoutProps} />
    else if (layoutId === 'stage-light') body = <StageLight {...layoutProps} />
    else if (layoutId === 'ink-wash') body = <InkWash {...layoutProps} />
    else if (layoutId === 'desk-globe') body = <DeskGlobe {...layoutProps} />
    else if (layoutId === 'signal-lantern') body = <SignalLantern {...layoutProps} />
    else if (layoutId === 'quiet-credits') body = <QuietCredits {...layoutProps} />
    else if (layoutId === 'newspaper') body = <Newspaper {...layoutProps} />
    else if (layoutId === 'coverage') body = <Coverage {...layoutProps} />

    return (
      <AtelierFrame
        layoutId={layoutId}
        weatherSky={weather?.skyClass}
        weatherInk={weather?.inkClass}
        workload={workload}
        setWorkload={setWorkload}
        cloud={cloud}
        setCloud={setCloud}
      >
        {body}
      </AtelierFrame>
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
