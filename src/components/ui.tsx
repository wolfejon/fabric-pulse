import type { ReactNode } from 'react'
import type { EffortLevel, ImpactLevel, NewsSourceType, SentimentLabel } from '../types'
import { sentimentWord } from '../lib/format'
import { useThemeColors } from '../theme/colors'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`pulse-card border border-line ${className}`}>
      {children}
    </section>
  )
}

export function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-ink">{title}</h2>
        {hint ? <p className="mt-1 text-xs text-mute">{hint}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function SentimentPill({ sentiment }: { sentiment: SentimentLabel }) {
  const colors = useThemeColors()
  const color =
    sentiment === 'positive' ? colors.pos : sentiment === 'negative' ? colors.neg : colors.neu
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
      style={{ background: `${color}1f`, color }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {sentiment}
    </span>
  )
}

export function ScorePill({ score }: { score: number }) {
  const sentiment = sentimentWord(score)
  return <SentimentPill sentiment={sentiment} />
}

export function ToneBadge({
  label,
  tone,
}: {
  label: string
  tone: 'teal' | 'amber' | 'pos' | 'neg' | 'mute' | 'official' | 'community' | 'press'
}) {
  const map = {
    teal: 'bg-teal/15 text-teal-bright',
    amber: 'bg-amber/15 text-amber',
    pos: 'bg-pos/15 text-pos',
    neg: 'bg-neg/15 text-neg',
    mute: 'bg-elevated text-mute',
    official: 'bg-official/15 text-official',
    community: 'bg-amber/15 text-amber',
    press: 'bg-elevated text-ink',
  } as const
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${map[tone]}`}>
      {label}
    </span>
  )
}

export function EffortImpact({
  effort,
  impact,
}: {
  effort: EffortLevel
  impact: ImpactLevel
}) {
  const impactTone = impact === 'high' ? 'pos' : impact === 'medium' ? 'teal' : 'mute'
  const effortTone = effort === 'low' ? 'pos' : effort === 'medium' ? 'amber' : 'neg'
  return (
    <div className="flex flex-wrap gap-1.5">
      <ToneBadge tone={impactTone} label={`Impact ${impact}`} />
      <ToneBadge tone={effortTone} label={`Effort ${effort}`} />
    </div>
  )
}

export function SourceBadge({ type }: { type: NewsSourceType }) {
  const label = type === 'official' ? 'Official' : type === 'community' ? 'Community' : 'Press'
  return <ToneBadge tone={type} label={label} />
}

export function Trend({ value, invert = false }: { value: number; invert?: boolean }) {
  const up = value >= 0
  const good = invert ? !up : up
  return (
    <span className={`text-xs font-medium ${good ? 'text-pos' : 'text-neg'}`}>
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(0)}%
    </span>
  )
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-mute">
      {label}
    </div>
  )
}
