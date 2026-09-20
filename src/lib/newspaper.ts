import { WORKLOAD_CATALOG } from '../data/catalog'
import {
  competitorPageForTheme,
  defaultCompetitorPageForWorkload,
} from '../data/competitors'
import type {
  Mention,
  NewsItem,
  PulseKpis,
  SuggestedAction,
  ThemeInsight,
  WorkloadFilter,
  WorkloadStat,
} from '../types'
import { formatNet, formatShare } from './format'

export type NewspaperStory = {
  id: string
  kind: 'lead' | 'secondary' | 'news' | 'brief' | 'editorial'
  headline: string
  /** Optional shorter jump hed on the continuation page */
  jumpHed?: string
  dek: string
  byline: string
  sectionLabel: string
  /** Genre slug above the hed — ANALYSIS / EXCLUSIVE / THE THREAD / EDITORIAL */
  kicker?: string
  /** Classic dateline opener, e.g. REDMOND — */
  dateline?: string
  jumpLabel: string
  /** Shown on article page: Continued from A1 */
  continuedFrom?: string
  body: string[]
  pullQuote?: string
  pageMark: string
  themeId?: string
  mentionCount?: number
  uniqueAuthorCount?: number
  volumeClass?: 'single' | 'thin' | 'crowd'
  competitorPageId?: string
  /** Cutline under a photo hole when present */
  cutline?: string
  /** Hed size ladder for tombstone patrol: 1 largest … 3 smallest */
  hedRank?: 1 | 2 | 3
  isOpinion?: boolean
}

export type NewspaperIndexItem = {
  page: string
  label: string
  storyId?: string
}

export type NewspaperRefer = {
  text: string
  page: string
  storyId?: string
}

export type NewspaperMarketTick = {
  label: string
  change: string
  direction: 'up' | 'down' | 'flat'
}

export type NewspaperClassified = {
  headline: string
  body: string
  tag: string
}

export type NewspaperLetter = {
  title: string
  body: string
  signoff: string
}

export type NewspaperEdition = {
  paperName: string
  dateLine: string
  /** Compact folio date, e.g. Sep 12, 2026 */
  folioDate: string
  editionLabel: string
  volumeNote: string
  stories: NewspaperStory[]
  /** @deprecated KPI briefing removed — kept empty for compatibility */
  briefing: { label: string; text: string }[]
  pullQuote: { text: string; attribution: string } | null
  newsIndex: NewspaperIndexItem[]
  dispatchLine: string
  weatherBug: { word: string; detail: string; icon: 'storm' | 'clear' | 'mixed' }
  markets: NewspaperMarketTick[]
  refers: NewspaperRefer[]
  classifieds: NewspaperClassified[]
  letters: NewspaperLetter[]
  cartoonCaption: string
  leadCutline: string
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

function weatherFromNet(net: number): NewspaperEdition['weatherBug'] {
  if (net <= -0.2) {
    return { word: 'Stormy', detail: 'Stormy over the estate', icon: 'storm' }
  }
  if (net >= 0.25) {
    return { word: 'Clear', detail: 'Clear skies across Fabric', icon: 'clear' }
  }
  return { word: 'Unsettled', detail: 'Mixed weather on the lake', icon: 'mixed' }
}

function folioFromDateLabel(dateLabel: string): string {
  // Prefer a short print date; fall back to the range label.
  const m = dateLabel.match(/([A-Za-z]{3}\.?\s+\d{1,2},?\s+\d{4})/)
  if (m?.[1]) return m[1].replace(/\./g, '')
  if (dateLabel.length <= 18) return dateLabel
  return dateLabel.split(/[–—-]/)[0]?.trim() || dateLabel
}

function staffByline(handleOrName: string | null, folioDate: string): string {
  const who = handleOrName?.replace(/^@/, '') || 'Casey Quinn'
  return `By ${who} · Staff writer · ${folioDate}`
}

function themeKicker(tone: ReturnType<typeof sentimentTone>, kind: NewspaperStory['kind']): string {
  if (kind === 'editorial') return 'EDITORIAL'
  if (tone === 'tense') return 'ANALYSIS'
  if (tone === 'warm') return 'EXCLUSIVE'
  return 'THE THREAD'
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

function shortJumpHed(theme: ThemeInsight, tone: ReturnType<typeof sentimentTone>): string {
  switch (tone) {
    case 'warm':
      return `${theme.name} Wins Quiet Fans`
    case 'tense':
      return `${theme.name} Still Dominates`
    default:
      return `More on ${theme.name}`
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
  dateline: string,
): string[] {
  const focus = workloadLabel(workload)
  const tone = sentimentTone(theme.sentimentScore)
  const openingCore =
    tone === 'tense'
      ? `In the ${focus} edition this week, the loudest ink belongs to ${theme.name}. Product teams reading the pulse will recognize the pattern: volume is not sparse (${kpis.volume} mentions in-window), and the net score sits at ${formatNet(kpis.netSentiment)}.`
      : tone === 'warm'
        ? `The ${focus} pages carry a softer register. ${theme.name} is the story practitioners keep returning to — not as a complaint mill, but as proof that something in the product is clicking.`
        : `Turn the page on ${focus} and the lead column still belongs to ${theme.name}. It is neither a triumph nor a crisis; it is the steady drumbeat of a platform under real use.`

  const opening = `${dateline} ${openingCore}`

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

function pickDateline(workload: WorkloadFilter, kind: NewspaperStory['kind']): string {
  if (kind === 'editorial') return 'FROM THE BOARD —'
  if (kind === 'news') return 'FROM THE WIRE —'
  if (workload === 'pipelines') return 'REDMOND —'
  if (workload === 'onelake') return 'SEATTLE —'
  if (workload === 'copilot-ai') return 'FROM THE FEED —'
  return 'REDMOND —'
}

function newsStory(item: NewsItem, index: number, folioDate: string): NewspaperStory {
  const dateline = 'FROM THE WIRE —'
  return {
    id: `news-${item.id}`,
    kind: 'news',
    headline: item.title,
    jumpHed: item.title.length > 48 ? `${item.title.slice(0, 45).trim()}…` : item.title,
    dek: item.summary,
    byline: staffByline(item.source, folioDate),
    sectionLabel: item.sourceType === 'official' ? 'Official' : item.sourceType === 'press' ? 'Press' : 'Community',
    kicker: item.sourceType === 'official' ? 'DISPATCH' : 'PRESS',
    dateline,
    jumpLabel: `Continued on B${index + 1}`,
    continuedFrom: 'A1',
    pageMark: `B${index + 1}`,
    hedRank: 2,
    body: [
      `${dateline} ${item.source} filed this item on the Fabric beat. ${item.summary}`,
      `In this demo edition we treat external headlines as color for the sentiment pages — not as a live news API. The original piece sits at ${item.url}, should a reader want the primary source.`,
      `Workload tags on the desk copy: ${item.workloads.map((w) => WORKLOAD_CATALOG[w]?.shortLabel ?? w).join(', ')}.`,
    ],
  }
}

function actionStory(action: SuggestedAction, folioDate: string): NewspaperStory {
  const dateline = 'FROM THE BOARD —'
  return {
    id: `action-${action.id}`,
    kind: 'editorial',
    headline: action.title,
    jumpHed: `Editorial: ${action.title}`,
    dek: action.rationale,
    byline: `By The Chronicle Board · Editorial · ${folioDate}`,
    sectionLabel: 'Opinion',
    kicker: 'EDITORIAL',
    dateline,
    jumpLabel: 'Continued on Op-Ed',
    continuedFrom: 'A1',
    pageMark: 'Op-Ed',
    isOpinion: true,
    hedRank: 1,
    body: [
      `${dateline} The board recommends a clear next step for ${WORKLOAD_CATALOG[action.workload]?.label ?? action.workload}: ${action.title}.`,
      action.rationale,
      `Effort reads ${action.effort}; impact reads ${action.impact}. Suggested owners on the masthead slate: ${action.ownerHint}. As always in this prototype, the recommendation is illustrative — assembled from demo themes, not a live backlog.`,
    ],
  }
}

function marketsFromWorkloads(workloads: WorkloadStat[], themes: ThemeInsight[]): NewspaperMarketTick[] {
  const fromWl = [...workloads]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)
    .map((w) => {
      const change = formatNet(w.netSentiment)
      const direction: NewspaperMarketTick['direction'] =
        w.netSentiment > 0.05 ? 'up' : w.netSentiment < -0.05 ? 'down' : 'flat'
      return {
        label: w.shortLabel.toUpperCase(),
        change,
        direction,
      }
    })
  if (fromWl.length >= 3) return fromWl
  return [...themes]
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 5)
    .map((t) => {
      const change = formatNet(t.sentimentScore)
      const direction: NewspaperMarketTick['direction'] =
        t.sentimentScore > 0.05 ? 'up' : t.sentimentScore < -0.05 ? 'down' : 'flat'
      return {
        label: t.name.split(/\s+/)[0]!.toUpperCase().slice(0, 12),
        change,
        direction,
      }
    })
}

function classifiedsFromActions(actions: SuggestedAction[]): NewspaperClassified[] {
  return actions.slice(0, 3).map((a) => ({
    headline: `WANTED: ${a.title}`,
    body: a.rationale.length > 90 ? `${a.rationale.slice(0, 87).trim()}…` : a.rationale,
    tag: `${a.impact} impact · See Actions`,
  }))
}

function lettersFromMentions(mentions: Mention[], kpis: PulseKpis): NewspaperLetter[] {
  const contrary = [...mentions]
    .sort((a, b) => a.sentimentScore - b.sentimentScore || b.likes - a.likes)[0]
  const letters: NewspaperLetter[] = [
    {
      title: 'Corrections',
      body: `We over-weighted demo volume yesterday. Net sentiment reprints at ${formatNet(kpis.netSentiment)} on ${kpis.volume} dispatches — not a live wire.`,
      signoff: '— The Editors',
    },
  ]
  if (contrary) {
    letters.push({
      title: 'Letters',
      body: `“${contrary.text.length > 140 ? `${contrary.text.slice(0, 137).trim()}…` : contrary.text}”`,
      signoff: `— ${contrary.author}, ${contrary.handle}`,
    })
  }
  return letters
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
  workloads: WorkloadStat[] = [],
): NewspaperEdition {
  const focus = workloadLabel(workload)
  const folioDate = folioFromDateLabel(dateLabel)
  const sortedThemes = [...themes].sort(
    (a, b) => b.mentionCount - a.mentionCount || Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore),
  )

  const stories: NewspaperStory[] = []
  let page = 2
  const weather = weatherFromNet(kpis.netSentiment)
  if (workload !== 'all') {
    weather.detail =
      weather.icon === 'storm'
        ? `Stormy over ${focus}`
        : weather.icon === 'clear'
          ? `Clear skies ${focus}`
          : `Unsettled over ${focus}`
  }

  // Lead from top theme
  if (sortedThemes[0]) {
    const theme = sortedThemes[0]
    const related = mentionsForTheme(theme, mentions)
    const quote = loudestMention(related.length ? related : mentions)
    const tone = sentimentTone(theme.sentimentScore)
    const leadPage =
      competitorPageForTheme(theme.id) ??
      (workload !== 'all' ? defaultCompetitorPageForWorkload(workload) : undefined)
    const dateline = pickDateline(workload, 'lead')
    const pageMark = `A${page}`
    stories.push({
      id: `theme-${theme.id}`,
      kind: 'lead',
      headline: themeHeadline(theme, tone),
      jumpHed: shortJumpHed(theme, tone),
      dek: themeDek(theme, kpis.volume, tone),
      byline: staffByline(quote?.author ?? 'Casey Quinn', folioDate),
      sectionLabel: focus,
      kicker: themeKicker(tone, 'lead'),
      dateline,
      jumpLabel: `Continued on ${pageMark}`,
      continuedFrom: 'A1',
      pageMark,
      pullQuote: quote ? quote.text : undefined,
      body: themeBody(theme, related, quote, workload, kpis, dateline),
      themeId: theme.id,
      mentionCount: theme.mentionCount,
      uniqueAuthorCount: theme.uniqueAuthorCount,
      volumeClass: theme.volumeClass,
      competitorPageId: leadPage?.id,
      cutline: quote
        ? `Readers describe the beat as “${quote.text.slice(0, 64)}${quote.text.length > 64 ? '…' : ''}” — staff illustration.`
        : `Sentiment weather: ${weather.detail} — staff illustration.`,
      hedRank: 1,
    })
    page += 1
  }

  // Secondary theme stories — alternate hed ranks to avoid tombstones
  let secondaryRank: 1 | 2 | 3 = 2
  for (const theme of sortedThemes.slice(1, 4)) {
    const related = mentionsForTheme(theme, mentions)
    const quote = loudestMention(related.length ? related : [])
    const tone = sentimentTone(theme.sentimentScore)
    const secPage =
      competitorPageForTheme(theme.id) ??
      (workload !== 'all' ? defaultCompetitorPageForWorkload(workload) : undefined)
    const dateline = pickDateline(theme.workloads[0] ?? workload, 'secondary')
    const pageMark = `A${page}`
    stories.push({
      id: `theme-${theme.id}`,
      kind: 'secondary',
      headline: themeHeadline(theme, tone),
      jumpHed: shortJumpHed(theme, tone),
      dek: themeDek(theme, theme.mentionCount, tone),
      byline: staffByline(quote?.author ?? 'Pulse Desk', folioDate),
      sectionLabel: WORKLOAD_CATALOG[theme.workloads[0] ?? 'other']?.shortLabel ?? 'Fabric',
      kicker: themeKicker(tone, 'secondary'),
      dateline,
      jumpLabel: `Continued on ${pageMark}`,
      continuedFrom: 'A1',
      pageMark,
      pullQuote: quote?.text,
      body: themeBody(theme, related, quote, workload, kpis, dateline),
      themeId: theme.id,
      mentionCount: theme.mentionCount,
      uniqueAuthorCount: theme.uniqueAuthorCount,
      volumeClass: theme.volumeClass,
      competitorPageId: secPage?.id,
      hedRank: secondaryRank,
    })
    secondaryRank = secondaryRank === 2 ? 3 : secondaryRank === 3 ? 1 : 2
    page += 1
  }

  // News filtered by workload
  const scopedNews =
    workload === 'all' ? news : news.filter((n) => n.workloads.includes(workload))
  scopedNews.slice(0, 2).forEach((item, i) => {
    stories.push(newsStory(item, i, folioDate))
  })

  // One editorial from actions
  const scopedActions =
    workload === 'all'
      ? actions
      : actions.filter(
          (a) =>
            a.workload === workload ||
            a.relatedThemeIds.some((id) => sortedThemes.some((t) => t.id === id)),
        )
  if (scopedActions[0]) {
    stories.push(actionStory(scopedActions[0], folioDate))
  }

  // Mood brief as a short secondary if we still need density
  if (stories.length < 5) {
    const mood =
      kpis.netSentiment <= -0.2
        ? 'Storm warnings on the Fabric beat'
        : kpis.netSentiment >= 0.25
          ? 'Fair skies over the estate'
          : 'Mixed weather on the lake'
    const dateline = 'FROM THE FEED —'
    stories.push({
      id: 'mood-brief',
      kind: 'brief',
      headline: mood,
      jumpHed: mood,
      dek: `Net ${formatNet(kpis.netSentiment)} · volume ${kpis.volume} · ${formatShare(kpis.positiveShare)} positive share.`,
      byline: staffByline('Weather Desk', folioDate),
      sectionLabel: 'Briefing',
      kicker: 'WEATHER',
      dateline,
      jumpLabel: 'Continued on A7',
      continuedFrom: 'A1',
      pageMark: 'A7',
      hedRank: 3,
      body: [
        `${dateline} The Pulse weather desk reads net sentiment at ${formatNet(kpis.netSentiment)} on ${kpis.volume} mentions this window. Positive share is ${formatShare(kpis.positiveShare)}; negative share ${formatShare(kpis.negativeShare)}.`,
        `Volume trend ${kpis.volumeTrend >= 0 ? 'up' : 'down'} ${Math.abs(Math.round(kpis.volumeTrend))}%. ${kpis.topRisingTheme ? `Rising theme on the slate: ${kpis.topRisingTheme}.` : 'No single theme is sprinting ahead of the pack.'}`,
        `Edition filter: ${focus}. This brief is templated from demo aggregates — ink for the page, not a live forecast.`,
      ],
    })
  }

  const trimmed = stories.slice(0, 8)

  const newsIndex: NewspaperIndexItem[] = [
    { page: 'A1', label: 'Lead', storyId: trimmed.find((s) => s.kind === 'lead')?.id },
    ...trimmed
      .filter((s) => s.kind !== 'lead')
      .slice(0, 5)
      .map((s) => ({
        page: s.pageMark,
        label:
          s.kind === 'editorial'
            ? 'Opinion'
            : s.sectionLabel.length > 14
              ? s.sectionLabel.slice(0, 12) + '…'
              : s.sectionLabel,
        storyId: s.id,
      })),
    { page: 'B1', label: 'Competitors' },
    { page: 'B2', label: 'Intelligence' },
  ]

  const refers: NewspaperRefer[] = [
    {
      text: 'Intelligence desk — market & mission digest',
      page: 'B2',
    },
    ...trimmed.slice(1, 4).map((s) => ({
      text: s.headline.length > 52 ? `${s.headline.slice(0, 49).trim()}…` : s.headline,
      page: s.pageMark,
      storyId: s.id,
    })),
  ]

  const leadQuote = trimmed.find((s) => s.pullQuote)?.pullQuote
  const leadAttr = trimmed.find((s) => s.pullQuote)?.byline ?? 'Staff'
  const lead = trimmed.find((s) => s.kind === 'lead')

  const sentimentWord =
    kpis.netSentiment <= -0.2 ? 'unsettled' : kpis.netSentiment >= 0.25 ? 'fair' : 'mixed'

  return {
    paperName: 'The Fabric Chronicle',
    dateLine: dateLabel,
    folioDate,
    editionLabel: workload === 'all' ? 'National Edition' : `${focus} Edition`,
    volumeNote: `Vol. I · Demo Issue · ${focus}`,
    stories: trimmed,
    briefing: [],
    pullQuote: leadQuote ? { text: leadQuote, attribution: leadAttr } : null,
    newsIndex,
    dispatchLine: `Sentiment ${sentimentWord} · ${kpis.volume} dispatches.`,
    weatherBug: weather,
    markets: marketsFromWorkloads(workloads, themes),
    refers,
    classifieds: classifiedsFromActions(scopedActions.length ? scopedActions : actions),
    letters: lettersFromMentions(mentions, kpis),
    cartoonCaption:
      weather.icon === 'storm'
        ? 'The capacity knot: when pipelines weather meets a thin SKU umbrella.'
        : weather.icon === 'clear'
          ? 'OneLake ripple: fair weather, single copy, fewer umbrellas needed.'
          : 'Mixed forecast: Copilot sunshine, pipeline clouds on the horizon.',
    leadCutline:
      lead?.cutline ??
      `A week on the Fabric beat — ${kpis.volume} dispatches filed. Staff illustration.`,
  }
}

/** Print-style sources line (replaces chip badges in Chronicle UI). */
export function sourcesLineText(
  mentionCount: number,
  uniqueAuthors: number,
): string {
  const d = mentionCount === 1 ? 'dispatch' : 'dispatches'
  const v = uniqueAuthors === 1 ? 'voice' : 'voices'
  return `Based on ${mentionCount} ${d} · ${uniqueAuthors} ${v} · Staff reporting`
}
