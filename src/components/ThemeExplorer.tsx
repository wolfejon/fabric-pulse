import { useMemo } from 'react'
import type { Mention, ThemeInsight } from '../types'
import { WORKLOAD_CATALOG } from '../data/catalog'
import { formatNet } from '../lib/format'
import { Card, EmptyState, SectionTitle, SentimentPill } from './ui'

export function ThemeExplorer({
  themes,
  mentions,
  selectedId,
  onSelect,
}: {
  themes: ThemeInsight[]
  mentions: Mention[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const selected = themes.find((theme) => theme.id === selectedId) ?? null
  const samples = useMemo(() => {
    if (!selected) return []
    return mentions.filter((mention) => selected.mentionIds.includes(mention.id)).slice(0, 4)
  }, [mentions, selected])

  return (
    <Card className="p-4">
      <SectionTitle
        title="Theme explorer"
        hint="Keyword clusters — edit theme definitions in src/data/themes.ts to retarget the taxonomy."
      />
      {themes.length === 0 ? (
        <EmptyState label="No themes match this filter." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <ul className="ops-dense max-h-[420px] space-y-1 overflow-auto pr-1">
            {themes.map((theme) => {
              const active = theme.id === selectedId
              return (
                <li key={theme.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(active ? null : theme.id)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                      active ? 'bg-teal/10 ring-1 ring-teal/40' : 'hover:bg-elevated'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-ink">{theme.name}</p>
                      <span className="shrink-0 text-xs text-mute">{theme.mentionCount}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-mute">{theme.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-faint">
                      <span>net {formatNet(theme.sentimentScore)}</span>
                      <span>trend {theme.trend >= 0 ? '+' : ''}{theme.trend.toFixed(0)}%</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="rounded-xl border border-line bg-elevated/50 p-3">
            {selected ? (
              <div>
                <p className="text-sm font-medium text-ink">{selected.name}</p>
                <p className="mt-1 text-xs text-mute">{selected.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selected.keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full bg-canvas px-2 py-0.5 text-[11px] text-mute">
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  {samples.map((mention) => (
                    <article key={mention.id} className="rounded-lg border border-line bg-panel p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-ink">{mention.author}</p>
                        <SentimentPill sentiment={mention.sentiment} />
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-mute">{mention.text}</p>
                      <p className="mt-1 text-[11px] text-faint">
                        {WORKLOAD_CATALOG[mention.workload].shortLabel}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-mute">
                Select a theme to inspect keywords and sample mentions.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
