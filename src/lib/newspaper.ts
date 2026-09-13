import { WORKLOAD_CATALOG } from '../data/catalog'
import type {
  Mention,
  NewsItem,
  PulseKpis,
  SuggestedAction,
  ThemeInsight,
  WorkloadFilter,
} from '../types'
import { formatNet, formatShare } from './format'

export type NewspaperStory = {
  id: string
  kind: 'lead' | 'secondary' | 'news' | 'brief' | 'editorial'
  headline: string
  dek: string
  byline: string
  sectionLabel: string
  jumpLabel: string
  body: string[]
  pullQuote?: string
  pageMark: string
}

export type NewspaperEdition = {
  paperName: string
  dateLine: string
  editionLabel: string
  volumeNote: string
  stories: NewspaperStory[]
  briefing: { label: string; text: string }[]
  pullQuote: { text: string; attribution: string } | null
}

function sentimentTone(score: number): 'warm' | 'tense' | 'even' {
  if (score >= 0.2) return 'warm'
  if (score <= -0.15) return 'tense'
  return 'even'
}

function workloadLabel(workload: WorkloadFilter): string {
  if (workload === 'all') return 'All Fabric'
  return WORKLOAD_CATALOG[workload]?.shortLabel ?? workload
}

function mentionsForTheme(theme: ThemeInsight, mentions: Mention[]): Mention[] {
  const ids = new Set(theme.mentionIds)
  return mentions.filter((m) => ids.has(m.id))
}

function loudestMention(mentions: Mention[]): Mention | null {
  if (mentions.length === 0) return null
  return [...mentions].sort((a, b) => b.likes + b.reposts - (a.likes + a.reposts))[0]!
}

function themeHeadline(theme: ThemeInsight, tone: ReturnType<typeof sentimentTone>): string {
  switch (tone) {
    case 'warm':
      return `${theme.name} Draws Quiet Applause Across the Estate`
    case 'tense':
      return `${theme.name} Dominates the Week’s Hardest Conversations`
    default:
      return `${theme.name}: The Thread Holding This Week’s Pulse`
  }
}

function themeDek(theme: ThemeInsight, volume: number, tone: ReturnType<typeof sentimentTone>): string {
  const count = theme.mentionCount
  const trendBit =
    theme.trend >= 25
      ? 'rising sharply'
      : theme.trend <= -20
        ? 'easing off'
        : 'holding steady'
  if (tone === 'tense') {
    return `${count} mentions this window — ${trendBit} — as teams press for clearer diagnostics and fewer surprises.`
  }
  if (tone === 'warm') {
    return `${count} mentions, ${trendBit}, with practitioners trading wins instead of workarounds.`
  }
  return `A ${volume}-mention week keeps ${theme.name.toLowerCase()} at the center of the Fabric conversation — ${trendBit}.`
}

function themeBody(
  theme: ThemeInsight,
  related: Mention[],
  quote: Mention | null,
  workload: WorkloadFilter,
  kpis: PulseKpis,
): string[] {
  const focus = workloadLabel(workload)
  const tone = sentimentTone(theme.sentimentScore)
  const opening =
    tone === 'tense'
      ? `In the ${focus} edition this week, the loudest ink belongs to ${theme.name}. Product teams reading the pulse will recognize the pattern: volume is not sparse (${kpis.volume} mentions in-window), and the net score sits at ${formatNet(kpis.netSentiment)}.`
      : tone === 'warm'
        ? `The ${focus} pages carry a softer register. ${theme.name} is the story practitioners keep returning to — not as a complaint mill, but as proof that something in the product is clicking.`
        : `Turn the page on ${focus} and the lead column still belongs to ${theme.name}. It is neither a triumph nor a crisis; it is the steady drumbeat of a platform under real use.`

  const context = `${theme.description} That framing matches what showed up in ${theme.mentionCount} sample mentions this window${
    theme.trend >= 15 ? `, with the thread ${theme.trend >= 30 ? 'surging' : 'climbing'} week over week` : ''
  }.`

  const grafs: string[] = [opening, context]

  if (quote) {
    grafs.push(
      `One voice carried farther than most. ${quote.author} (${quote.handle}), writing as a ${quote.authorRole.toLowerCase()}, put it plainly: “${quote.text}” The line drew ${quote.likes} likes and ${quote.reposts} reposts in the demo sample — enough to earn the jump.`,
    )
  }

  if (related.length > 1) {
    const second = related.find((m) => m.id !== quote?.id) ?? related[1]!
    grafs.push(
      `Nearby in the same column, ${second.author} (@${second.handle.replace(/^@/, '')}) added: “${second.text}” Together the receipts sketch a week that product managers can brief without a dashboard.`,
    )
  }

  const close =
    tone === 'tense'
      ? `Editorial note: the paper is demo data, not a live wire. Still, the shape of the complaint is familiar — clearer signals beat silent failure, every time.`
      : `This is a broadsheet of sample sentiment, not a wire service. Read it as mood and texture: what the estate is talking about when the charts are put away.`

  grafs.push(close)
  return grafs
}

function newsStory(item: NewsItem, index: number): NewspaperStory {
  return {
    id: `news-${item.id}`,
    kind: 'news',
    headline: item.title,
    dek: item.summary,
    byline: `${item.source} · Staff rewrite`,
    sectionLabel: item.sourceType === 'official' ? 'Official' : item.sourceType === 'press' ? 'Press' : 'Community',
    jumpLabel: `Continued on B${index + 1}`,
    pageMark: `B${index + 1}`,
    body: [
      `${item.source} filed this item on the Fabric beat. ${item.summary}`,
      `In this demo edition we treat external headlines as color for the sentiment pages — not as a live news API. The original piece sits at ${item.url}, should a reader want the primary source.`,
      `Workload tags on the desk copy: ${item.workloads.map((w) => WORKLOAD_CATALOG[w]?.shortLabel ?? w).join(', ')}.`,
    ],
  }
}

function actionStory(action: SuggestedAction): NewspaperStory {
  return {
    id: `action-${action.id}`,
    kind: 'editorial',
    headline: `Editorial: ${action.title}`,
    dek: action.rationale,
    byline: 'The Chronicle Board · Staff',
    sectionLabel: 'Opinion',
    jumpLabel: 'Continued on Op-Ed',
    pageMark: 'Op-Ed',
    body: [
      `The board recommends a clear next step for ${WORKLOAD_CATALOG[action.workload]?.label ?? action.workload}: ${action.title}.`,
      action.rationale,
      `Effort reads ${action.effort}; impact reads ${action.impact}. Suggested owners on the masthead slate: ${action.ownerHint}. As always in this prototype, the recommendation is illustrative — assembled from demo themes, not a live backlog.`,
    ],
  }
}

function briefFromMention(m: Mention): { label: string; text: string } {
  const short = m.text.length > 110 ? `${m.text.slice(0, 107).trim()}…` : m.text
  return {
    label: WORKLOAD_CATALOG[m.workload]?.shortLabel ?? m.workload,
    text: short,
  }
}

/**
 * Assemble 5–8 editorial stories from filtered themes, mentions, news, and actions.
 * No LLM — templated prose over demo aggregates.
 */
export function buildNewspaperEdition(
  kpis: PulseKpis,
  themes: ThemeInsight[],
  mentions: Mention[],
  news: NewsItem[],
  actions: SuggestedAction[],
  workload: WorkloadFilter,
  dateLabel: string,
): NewspaperEdition {
  const focus = workloadLabel(workload)
  const sortedThemes = [...themes].sort(
    (a, b) => b.mentionCount - a.mentionCount || Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore),
  )

  const stories: NewspaperStory[] = []
  let page = 2

  // Lead from top theme
  if (sortedThemes[0]) {
    const theme = sortedThemes[0]
    const related = mentionsForTheme(theme, mentions)
    const quote = loudestMention(related.length ? related : mentions)
    const tone = sentimentTone(theme.sentimentScore)
    stories.push({
      id: `theme-${theme.id}`,
      kind: 'lead',
      headline: themeHeadline(theme, tone),
      dek: themeDek(theme, kpis.volume, tone),
      byline: quote ? `${quote.handle} · Staff` : 'Pulse Desk · Staff',
      sectionLabel: focus,
      jumpLabel: `Continued on A${page}`,
      pageMark: `A${page}`,
      pullQuote: quote ? quote.text : undefined,
      body: themeBody(theme, related, quote, workload, kpis),
    })
    page += 1
  }

  // Secondary theme stories
  for (const theme of sortedThemes.slice(1, 4)) {
    const related = mentionsForTheme(theme, mentions)
    const quote = loudestMention(related.length ? related : [])
    const tone = sentimentTone(theme.sentimentScore)
    stories.push({
      id: `theme-${theme.id}`,
      kind: 'secondary',
      headline: themeHeadline(theme, tone),
      dek: themeDek(theme, theme.mentionCount, tone),
      byline: quote ? `${quote.handle} · Staff` : 'Pulse Desk · Staff',
      sectionLabel: WORKLOAD_CATALOG[theme.workloads[0] ?? 'other']?.shortLabel ?? 'Fabric',
      jumpLabel: `Continued on A${page}`,
      pageMark: `A${page}`,
      pullQuote: quote?.text,
      body: themeBody(theme, related, quote, workload, kpis),
    })
    page += 1
  }

  // News filtered by workload
  const scopedNews =
    workload === 'all'
      ? news
      : news.filter((n) => n.workloads.includes(workload))
  scopedNews.slice(0, 2).forEach((item, i) => {
    stories.push(newsStory(item, i))
  })

  // One editorial from actions
  const scopedActions =
    workload === 'all'
      ? actions
      : actions.filter((a) => a.workload === workload || a.relatedThemeIds.some((id) => sortedThemes.some((t) => t.id === id)))
  if (scopedActions[0]) {
    stories.push(actionStory(scopedActions[0]))
  }

  // Mood brief as a short secondary if we still need density
  if (stories.length < 5) {
    const mood =
      kpis.netSentiment <= -0.2
        ? 'Storm warnings on the Fabric beat'
        : kpis.netSentiment >= 0.25
          ? 'Fair skies over the estate'
          : 'Mixed weather on the lake'
    stories.push({
      id: 'mood-brief',
      kind: 'brief',
      headline: mood,
      dek: `Net ${formatNet(kpis.netSentiment)} · volume ${kpis.volume} · ${formatShare(kpis.positiveShare)} positive share.`,
      byline: 'Weather Desk · Staff',
      sectionLabel: 'Briefing',
      jumpLabel: 'Continued on A7',
      pageMark: 'A7',
      body: [
        `The Pulse weather desk reads net sentiment at ${formatNet(kpis.netSentiment)} on ${kpis.volume} mentions this window. Positive share is ${formatShare(kpis.positiveShare)}; negative share ${formatShare(kpis.negativeShare)}.`,
        `Volume trend ${kpis.volumeTrend >= 0 ? 'up' : 'down'} ${Math.abs(Math.round(kpis.volumeTrend))}%. ${kpis.topRisingTheme ? `Rising theme on the slate: ${kpis.topRisingTheme}.` : 'No single theme is sprinting ahead of the pack.'}`,
        `Edition filter: ${focus}. This brief is templated from demo aggregates — ink for the page, not a live forecast.`,
      ],
    })
  }

  // Cap at 8
  const trimmed = stories.slice(0, 8)

  const briefingMentions = [...mentions]
    .sort((a, b) => b.likes + b.reposts - (a.likes + a.reposts))
    .slice(0, 4)
    .map(briefFromMention)

  const briefing = [
    {
      label: 'Net',
      text: `${formatNet(kpis.netSentiment)} sentiment · ${kpis.volume} mentions`,
    },
    {
      label: 'Share',
      text: `${formatShare(kpis.positiveShare)} pos · ${formatShare(kpis.negativeShare)} neg`,
    },
    ...briefingMentions,
  ]

  const leadQuote = trimmed.find((s) => s.pullQuote)?.pullQuote
  const leadAttr = trimmed.find((s) => s.pullQuote)?.byline ?? 'Staff'

  return {
    paperName: 'The Fabric Chronicle',
    dateLine: dateLabel,
    editionLabel: workload === 'all' ? 'National Edition' : `${focus} Edition`,
    volumeNote: `Vol. I · Demo Issue · ${focus}`,
    stories: trimmed,
    briefing,
    pullQuote: leadQuote
      ? { text: leadQuote, attribution: leadAttr }
      : null,
  }
}
