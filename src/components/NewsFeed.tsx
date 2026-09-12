import type { NewsItem, WorkloadFilter } from '../types'
import { formatDay } from '../lib/format'
import { Card, EmptyState, SectionTitle, SourceBadge } from './ui'

export function NewsFeed({
  news,
  workload,
}: {
  news: NewsItem[]
  workload: WorkloadFilter
}) {
  const visible =
    workload === 'all' ? news : news.filter((item) => item.workloads.includes(workload))

  const sorted = [...visible].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  return (
    <Card className="p-4">
      <SectionTitle
        title="News & announcements"
        hint="Official Microsoft posts plus community and press — sample links only."
      />
      {sorted.length === 0 ? (
        <EmptyState label="No news tagged to this workload." />
      ) : (
        <ul className="max-h-[460px] space-y-2 overflow-auto pr-1">
          {sorted.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-line bg-elevated/40 p-3 transition hover:border-teal/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <SourceBadge type={item.sourceType} />
                  <span className="text-[11px] text-faint">{item.source}</span>
                  <span className="text-[11px] text-faint">{formatDay(item.publishedAt)}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-mute">{item.summary}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
