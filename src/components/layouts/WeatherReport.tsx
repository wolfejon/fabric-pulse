import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, CloudSun } from 'lucide-react'
import {
  buildWeatherNarrative,
  forecastMentions,
  pickSuggestedMove,
} from '../../lib/narrative'
import { formatDateTime, initials } from '../../lib/format'
import { WORKLOAD_CATALOG } from '../../data/catalog'
import type { LayoutProps } from './types'
import { WhyItMattersChip } from '../atelier/WhyItMattersChip'

export function WeatherReport({ snapshot, view, cloud, workload, nested = false }: LayoutProps & { nested?: boolean }) {
  const [forecastOpen, setForecastOpen] = useState(false)

  const byId = useMemo(
    () => new Map(snapshot.mentions.map((m) => [m.id, m] as const)),
    [snapshot.mentions],
  )

  const weather = useMemo(
    () => buildWeatherNarrative(view.kpis, view.themes, view.workloads),
    [view.kpis, view.themes, view.workloads],
  )

  const evidence = useMemo(
    () => forecastMentions(weather.loudTheme, view.mentions, byId, 3),
    [weather.loudTheme, view.mentions, byId],
  )

  const move = useMemo(
    () => pickSuggestedMove(snapshot.actions, weather.loudTheme),
    [snapshot.actions, weather.loudTheme],
  )

  const dateLabel = snapshot.dateRange.label

  return (
    <div
      className={`weather-stage relative flex min-h-[calc(100svh-5.5rem)] flex-col overflow-hidden ${
        nested ? '' : `bg-gradient-to-b ${weather.skyClass}`
      }`}
    >
      {/* Soft drifting cloud wash */}
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
        <div className="weather-drift absolute -left-1/4 top-[12%] h-40 w-[70%] rounded-full bg-white/25 blur-3xl" />
        <div className="weather-drift-slow absolute -right-1/4 top-[35%] h-52 w-[55%] rounded-full bg-white/15 blur-3xl" />
      </div>

      {/* Thin cyan Fabric horizon */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[28%] h-px bg-gradient-to-r from-transparent via-[#00b7c3]/80 to-transparent"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {!forecastOpen ? (
          <motion.div
            key="sky"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className={`relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-10 text-center ${weather.inkClass}`}
          >
            <p className={`mb-8 text-[11px] uppercase tracking-[0.22em] ${weather.muteClass}`}>
              Fabric estate · {dateLabel}
            </p>

            <h2 className="font-display text-[clamp(3.5rem,12vw,8rem)] font-medium leading-none tracking-tight">
              {weather.mood}
            </h2>

            <p
              className={`mt-8 max-w-md text-lg font-light leading-relaxed sm:text-xl ${weather.muteClass}`}
            >
              {weather.loudLine}
            </p>

            <div className="mt-4">
              <WhyItMattersChip cloud={cloud} workload={workload} items={snapshot.intelligenceNews} />
            </div>

            {/* Sparse data beats — max ~5 including mood + loud line */}
            <div
              className={`mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.16em] ${weather.muteClass}`}
            >
              <span>{weather.rainNote}</span>
              <span className="opacity-40" aria-hidden="true">
                ·
              </span>
              <span>{weather.windNote}</span>
              {weather.loudWorkloadLabel ? (
                <>
                  <span className="opacity-40" aria-hidden="true">
                    ·
                  </span>
                  <span>{weather.loudWorkloadLabel}</span>
                </>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setForecastOpen(true)}
              className={`mt-14 inline-flex items-center gap-2 rounded-full border border-current/20 bg-white/10 px-5 py-2 text-sm backdrop-blur-sm transition hover:bg-white/20 ${weather.inkClass}`}
            >
              <CloudSun size={16} aria-hidden="true" />
              Open forecast
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="forecast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className={`relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-10 ${weather.inkClass}`}
          >
            <button
              type="button"
              onClick={() => setForecastOpen(false)}
              className={`mb-8 inline-flex w-fit items-center gap-2 text-sm ${weather.muteClass} hover:opacity-100`}
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Back to sky
            </button>

            <p className={`text-[11px] uppercase tracking-[0.2em] ${weather.muteClass}`}>
              Forecast detail
            </p>
            <h3 className="font-display mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
              {weather.mood} — sparse evidence
            </h3>
            <p className={`mt-3 text-base ${weather.muteClass}`}>{weather.loudLine}</p>

            <ul className="mt-10 space-y-5">
              {evidence.map((mention) => (
                <li
                  key={mention.id}
                  className="rounded-2xl border border-current/10 bg-white/15 px-5 py-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-current/10 text-[10px] font-semibold">
                      {initials(mention.author)}
                    </span>
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-medium">{mention.author}</p>
                      <p className={`text-[11px] ${weather.muteClass}`}>
                        {WORKLOAD_CATALOG[mention.workload]?.shortLabel} ·{' '}
                        {formatDateTime(mention.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-left text-[15px] leading-relaxed opacity-90">
                    {mention.text}
                  </p>
                </li>
              ))}
            </ul>

            {move ? (
              <div className="mt-8 rounded-2xl border border-[#00b7c3]/35 bg-[#00b7c3]/10 px-5 py-4 text-left">
                <p className={`text-[11px] uppercase tracking-[0.18em] ${weather.muteClass}`}>
                  Suggested move
                </p>
                <p className="mt-1.5 text-base font-medium">{move.title}</p>
                <p className={`mt-2 text-sm leading-relaxed ${weather.muteClass}`}>
                  {move.rationale}
                </p>
                <p className={`mt-2 text-[11px] ${weather.muteClass}`}>
                  Owner hint · {move.ownerHint}
                </p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
