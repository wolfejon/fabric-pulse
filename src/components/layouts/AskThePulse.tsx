import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Compass,
  MessageCircleQuestion,
  Sparkles,
  TriangleAlert,
  TrendingUp,
} from 'lucide-react'
import { WORKLOAD_CATALOG } from '../../data/catalog'
import {
  actionRank,
  buildBriefLines,
  detectSpikes,
  risingRisks,
  rankActions,
} from '../../layout/brief'
import { formatNet, formatPct, formatShare, initials, relativeFrom } from '../../lib/format'
import { useLayout } from '../../layout/LayoutProvider'
import { Card, EffortImpact, ToneBadge, Trend } from '../ui'
import { ClassicDashboard } from './ClassicDashboard'
import type { LayoutProps } from './types'

type AskId =
  | 'morning-pulse'
  | 'top-risks'
  | 'what-moved'
  | 'copilot-trust'
  | 'best-moves'
  | 'quiet-wins'

type AskDef = {
  id: AskId
  prompt: string
  hint: string
  icon: 'spark' | 'risk' | 'trend' | 'ask' | 'move' | 'win'
}

const ASKS: AskDef[] = [
  {
    id: 'morning-pulse',
    prompt: 'What’s the morning pulse?',
    hint: '3-line editorial brief from KPIs + themes',
    icon: 'spark',
  },
  {
    id: 'top-risks',
    prompt: 'Where is pain rising?',
    hint: 'Top rising-risk themes by volume × negativity',
    icon: 'risk',
  },
  {
    id: 'what-moved',
    prompt: 'What moved this week?',
    hint: 'Volume spikes and net-sentiment shifts',
    icon: 'trend',
  },
  {
    id: 'copilot-trust',
    prompt: 'How is Copilot / AI landing?',
    hint: 'Theme + workload slice for Copilot trust',
    icon: 'ask',
  },
  {
    id: 'best-moves',
    prompt: 'What should we ship next?',
    hint: 'Suggested actions ranked impact × effort',
    icon: 'move',
  },
  {
    id: 'quiet-wins',
    prompt: 'Any quiet wins to amplify?',
    hint: 'Positive themes with solid volume',
    icon: 'win',
  },
]

function AskIcon({ kind }: { kind: AskDef['icon'] }) {
  const cls = 'size-4 shrink-0 text-teal'
  switch (kind) {
    case 'spark':
      return <Sparkles className={cls} />
    case 'risk':
      return <TriangleAlert className={cls} />
    case 'trend':
      return <TrendingUp className={cls} />
    case 'move':
      return <Compass className={cls} />
    case 'win':
      return <Sparkles className={cls} />
    default:
      return <MessageCircleQuestion className={cls} />
  }
}

export function AskThePulse(props: LayoutProps) {
  const { snapshot, view, setThemeId, setWorkload } = props
  const { setLayoutId } = useLayout()
  const [askId, setAskId] = useState<AskId | null>(null)
  const [explore, setExplore] = useState(false)

  const lines = useMemo(() => buildBriefLines(view.kpis, view.themes), [view.kpis, view.themes])
  const risks = useMemo(() => risingRisks(view.themes, 3), [view.themes])
  const spikes = useMemo(() => detectSpikes(view.daily), [view.daily])
  const moves = useMemo(
    () => rankActions(snapshot.actions).slice(0, 3),
    [snapshot.actions],
  )
  const wins = useMemo(
    () =>
      [...view.themes]
        .filter((t) => t.sentimentScore >= 0.15)
        .sort((a, b) => b.mentionCount - a.mentionCount)
        .slice(0, 3),
    [view.themes],
  )
  const copilotTheme = view.themes.find(
    (t) => t.id.includes('copilot') || t.name.toLowerCase().includes('copilot'),
  )
  const copilotMentions = useMemo(() => {
    if (copilotTheme) {
      return view.mentions.filter((m) => copilotTheme.mentionIds.includes(m.id)).slice(0, 4)
    }
    return view.mentions.filter((m) => m.workload === 'copilot-ai').slice(0, 4)
  }, [copilotTheme, view.mentions])

  const evidenceMentions = useMemo(() => {
    if (askId === 'top-risks' && risks[0]) {
      return view.mentions.filter((m) => risks[0]!.mentionIds.includes(m.id)).slice(0, 4)
    }
    if (askId === 'what-moved' && spikes[0]) {
      return view.mentions
        .filter((m) => m.createdAt.slice(0, 10) === spikes[0]!.date)
        .slice(0, 4)
    }
    if (askId === 'copilot-trust') return copilotMentions
    if (askId === 'quiet-wins' && wins[0]) {
      return view.mentions.filter((m) => wins[0]!.mentionIds.includes(m.id)).slice(0, 4)
    }
    return view.mentions
      .slice()
      .sort((a, b) => b.likes + b.reposts - (a.likes + a.reposts))
      .slice(0, 4)
  }, [askId, risks, spikes, copilotMentions, wins, view.mentions])

  const topAction = useMemo(() => {
    return [...snapshot.actions].sort((a, b) => actionRank(b) - actionRank(a))[0] ?? null
  }, [snapshot.actions])

  const activeAsk = ASKS.find((a) => a.id === askId) ?? null

  const briefTitle = activeAsk?.prompt ?? 'Pick an ask'
  const briefBody = useMemo(() => {
    if (!askId) return [] as string[]
    switch (askId) {
      case 'morning-pulse':
        return [...lines]
      case 'top-risks':
        if (risks.length === 0) return ['Quiet window — no rising negative themes in the demo set.']
        return risks.map(
          (t, i) =>
            `${i + 1}. ${t.name}: ${t.mentionCount} mentions, net ${formatNet(t.sentimentScore)}, velocity ${formatPct(t.trend)}.`,
        )
      case 'what-moved':
        if (spikes.length === 0) {
          return [
            `Net sentiment ${formatNet(view.kpis.netSentiment)} (${formatNet(view.kpis.netSentimentTrend)} vs first half). No strong volume spikes vs window mean.`,
          ]
        }
        return [
          `Biggest spike: ${spikes[0]!.label} with ${spikes[0]!.volume} mentions (z=${spikes[0]!.zScore.toFixed(1)}), net ${formatNet(spikes[0]!.net)}.`,
          `Window volume ${view.kpis.volume} · pos/neg ${formatShare(view.kpis.positiveShare)} / ${formatShare(view.kpis.negativeShare)}.`,
          view.kpis.topRisingTheme
            ? `Top rising theme: ${view.kpis.topRisingTheme} (${formatPct(view.kpis.topRisingThemeTrend)}).`
            : 'No single rising theme dominated.',
        ]
      case 'copilot-trust':
        return [
          copilotTheme
            ? `Copilot theme “${copilotTheme.name}”: ${copilotTheme.mentionCount} mentions, net ${formatNet(copilotTheme.sentimentScore)}, ${formatPct(copilotTheme.trend)} velocity.`
            : 'No dedicated Copilot theme in this filter — showing workload=Copilot/AI mentions.',
          `Overall net ${formatNet(view.kpis.netSentiment)}. Trust issues usually show up as negative + high-engagement posts.`,
          topAction && topAction.workload === 'copilot-ai'
            ? `Suggested move: ${topAction.title}`
            : 'Pair with Suggested moves ask for Copilot-scoped actions.',
        ]
      case 'best-moves':
        return moves.map(
          (a, i) =>
            `${i + 1}. ${a.title} — impact ${a.impact}, effort ${a.effort} (${WORKLOAD_CATALOG[a.workload].shortLabel}).`,
        )
      case 'quiet-wins':
        if (wins.length === 0) return ['Few clearly positive themes in the demo window.']
        return wins.map(
          (t, i) =>
            `${i + 1}. ${t.name}: net ${formatNet(t.sentimentScore)}, ${t.mentionCount} mentions — candidate to amplify.`,
        )
    }
  }, [askId, lines, risks, spikes, view.kpis, copilotTheme, topAction, moves, wins])

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="border-b border-line bg-elevated/40 px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-wrap items-center gap-2">
            <ToneBadge tone="amber" label="Demo · no live LLM" />
            <span className="text-[11px] uppercase tracking-wider text-faint">
              {snapshot.dateRange.label}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Ask the Pulse
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-mute">
            Prompt-first home. Suggested asks return template briefs from demo KPIs and themes —
            not a live model. Open Classic when you want the full canvas.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ASKS.map((ask) => {
              const active = ask.id === askId
              return (
                <button
                  key={ask.id}
                  type="button"
                  onClick={() => {
                    setAskId(ask.id)
                    setExplore(false)
                    if (ask.id === 'copilot-trust') {
                      setWorkload('copilot-ai')
                      setThemeId(copilotTheme?.id ?? null)
                    } else if (ask.id === 'top-risks' && risks[0]) {
                      setThemeId(risks[0].id)
                    }
                  }}
                  className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? 'border-teal/50 bg-teal/15'
                      : 'border-line bg-panel/60 hover:border-teal/30 hover:bg-elevated/50'
                  }`}
                >
                  <AskIcon kind={ask.icon} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{ask.prompt}</span>
                    <span className="mt-0.5 block text-[11px] text-mute">{ask.hint}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {activeAsk ? (
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <section className="border-b border-line p-5 lg:border-b-0 lg:border-r sm:p-6">
              <p className="text-[11px] uppercase tracking-wider text-faint">Template brief</p>
              <h3 className="mt-1 text-lg font-semibold text-ink">{briefTitle}</h3>
              <ol className="mt-4 space-y-3">
                {briefBody.map((line, index) => (
                  <li key={index} className="flex gap-3 text-sm leading-relaxed text-ink/90">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal/15 text-[10px] font-semibold text-teal-bright">
                      {index + 1}
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>

              {askId === 'best-moves' ? (
                <ul className="mt-4 space-y-2">
                  {moves.map((action) => (
                    <li key={action.id} className="rounded-xl border border-line bg-elevated/30 px-3 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-medium text-ink">{action.title}</p>
                        <EffortImpact effort={action.effort} impact={action.impact} />
                      </div>
                      <p className="mt-1 text-xs text-mute">{action.rationale}</p>
                    </li>
                  ))}
                </ul>
              ) : null}

              {askId === 'top-risks' ? (
                <ul className="mt-4 space-y-2">
                  {risks.map((theme) => (
                    <li key={theme.id}>
                      <button
                        type="button"
                        onClick={() => setThemeId(theme.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-elevated/30 px-3 py-2 text-left hover:border-neg/40"
                      >
                        <span className="text-sm font-medium text-ink">{theme.name}</span>
                        <Trend value={theme.trend} invert />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setExplore(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-teal/20 px-4 py-2 text-sm font-medium text-teal-bright hover:bg-teal/30"
                >
                  <Compass size={16} />
                  Open Classic / Explore canvas
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutId('classic')}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink hover:bg-elevated"
                >
                  Switch layout to Classic
                  <ArrowRight size={14} />
                </button>
              </div>
            </section>

            <section className="p-5 sm:p-6">
              <p className="text-[11px] uppercase tracking-wider text-faint">Evidence cards</p>
              <ul className="mt-3 space-y-2">
                {evidenceMentions.map((mention) => (
                  <li key={mention.id} className="rounded-xl border border-line bg-elevated/40 p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-teal/15 text-[10px] font-semibold text-teal-bright">
                        {initials(mention.author)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-ink">{mention.handle}</p>
                        <p className="text-[10px] text-faint">
                          {relativeFrom(mention.createdAt, snapshot.generatedAt)} ·{' '}
                          {WORKLOAD_CATALOG[mention.workload].shortLabel}
                        </p>
                      </div>
                      <ToneBadge
                        tone={
                          mention.sentiment === 'positive'
                            ? 'pos'
                            : mention.sentiment === 'negative'
                              ? 'neg'
                              : 'mute'
                        }
                        label={mention.sentiment}
                      />
                    </div>
                    <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink/90">
                      {mention.text}
                    </p>
                  </li>
                ))}
              </ul>
              {topAction && askId !== 'best-moves' ? (
                <div className="mt-3 rounded-xl border border-line bg-elevated/30 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-faint">Linked action</p>
                  <p className="mt-1 text-sm font-medium text-ink">{topAction.title}</p>
                  <div className="mt-1.5">
                    <EffortImpact effort={topAction.effort} impact={topAction.impact} />
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-mute sm:px-8">
            Select a suggested ask to generate a template brief and evidence cards.
          </div>
        )}
      </Card>

      {explore ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wider text-faint">Explore · classic canvas</p>
            <button
              type="button"
              onClick={() => setExplore(false)}
              className="text-xs text-mute underline-offset-2 hover:text-ink hover:underline"
            >
              Hide Explore
            </button>
          </div>
          <ClassicDashboard {...props} />
        </div>
      ) : null}
    </>
  )
}
