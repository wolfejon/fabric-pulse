import type { Mention } from '../types'
import { WORKLOAD_CATALOG } from '../data/catalog'
import { initials, relativeFrom } from '../lib/format'
import { Card, EmptyState, SectionTitle, SentimentPill, ToneBadge } from './ui'

export function MentionStream({
  mentions,
  now,
}: {
  mentions: Mention[]
  now: string
}) {
  const sorted = [...mentions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <Card className="p-4">
      <SectionTitle
        title="Mention stream"
        hint="Sample X posts classified by workload and sentiment. Demo handles only."
      />
      {sorted.length === 0 ? (
        <EmptyState label="No mentions match the current filters." />
      ) : (
        <ul className="max-h-[520px] space-y-2 overflow-auto pr-1">
          {sorted.map((mention) => (
            <li key={mention.id} className="rounded-xl border border-line bg-elevated/40 p-3">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal/15 text-xs font-semibold text-teal-bright">
                  {initials(mention.author)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-medium text-ink">{mention.author}</p>
                    <p className="text-xs text-faint">{mention.handle}</p>
                    <p className="text-[11px] text-faint">{mention.authorRole}</p>
                    <p className="text-[11px] text-faint">{relativeFrom(mention.createdAt, now)}</p>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/90">{mention.text}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <ToneBadge tone="teal" label={WORKLOAD_CATALOG[mention.workload].shortLabel} />
                    <SentimentPill sentiment={mention.sentiment} />
                    <span className="text-[11px] text-faint">
                      {mention.likes} likes · {mention.reposts} reposts · {mention.replies} replies
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
