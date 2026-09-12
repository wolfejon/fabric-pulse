import type {
  DailyPoint,
  Mention,
  NewsItem,
  PulseKpis,
  SuggestedAction,
  ThemeInsight,
} from '../types'
import { formatNet, formatPct, formatShare } from '../lib/format'

export function riskScore(theme: ThemeInsight): number {
  const negShare = theme.sentimentScore < 0 ? Math.abs(theme.sentimentScore) : 0.05
  const velocity = Math.max(0, theme.trend) / 100
  return theme.mentionCount * (0.4 + negShare) * (1 + velocity)
}

export function risingRisks(themes: ThemeInsight[], limit = 3): ThemeInsight[] {
  return [...themes]
    .filter((theme) => theme.sentimentScore <= 0.1 || theme.trend > 20)
    .sort((a, b) => riskScore(b) - riskScore(a))
    .slice(0, limit)
}

export function rankActions(actions: SuggestedAction[]): SuggestedAction[] {
  return [...actions].sort((a, b) => actionRank(b) - actionRank(a))
}

export function actionRank(action: SuggestedAction): number {
  const impact = action.impact === 'high' ? 3 : action.impact === 'medium' ? 2 : 1
  const effort = action.effort === 'low' ? 3 : action.effort === 'medium' ? 2 : 1
  return impact * 10 + effort
}

export function buildBriefLines(kpis: PulseKpis, themes: ThemeInsight[]): [string, string, string] {
  const word =
    kpis.netSentiment >= 0.15 ? 'constructive' : kpis.netSentiment <= -0.15 ? 'strained' : 'mixed'
  const mom =
    kpis.netSentimentTrend >= 0
      ? `up ${formatNet(kpis.netSentimentTrend)} vs the first half of the window`
      : `down ${formatNet(Math.abs(kpis.netSentimentTrend))} vs the first half of the window`
  const line1 = `Overall Fabric conversation is ${word} at net ${formatNet(kpis.netSentiment)} (${mom}) across ${kpis.volume} demo mentions.`

  const risks = risingRisks(themes, 1)
  const topRisk = risks[0]
  const line2 = topRisk
    ? `Top risk: ${topRisk.name} — ${topRisk.mentionCount} mentions, net ${formatNet(topRisk.sentimentScore)}, velocity ${formatPct(topRisk.trend)}.`
    : 'Top risk: quiet window — no rising negative themes in the demo set.'

  const opportunity = [...themes]
    .filter((theme) => theme.sentimentScore >= 0.15)
    .sort((a, b) => b.mentionCount - a.mentionCount)[0]
  const line3 = opportunity
    ? `Opportunity: lean into ${opportunity.name} (net ${formatNet(opportunity.sentimentScore)}, ${opportunity.mentionCount} mentions) while ${formatShare(kpis.negativeShare)} of volume stays negative.`
    : `Opportunity: ${formatShare(kpis.positiveShare)} positive share — watch for praise clusters to amplify.`

  return [line1, line2, line3]
}

export type SpikeWindow = {
  date: string
  label: string
  volume: number
  net: number
  zScore: number
  positive: number
  neutral: number
  negative: number
}

export function detectSpikes(daily: DailyPoint[]): SpikeWindow[] {
  if (daily.length < 2) return []
  const volumes = daily.map((d) => d.volume)
  const mean = volumes.reduce((s, v) => s + v, 0) / volumes.length
  const variance = volumes.reduce((s, v) => s + (v - mean) ** 2, 0) / volumes.length
  const std = Math.sqrt(variance) || 1

  return daily
    .map((point) => ({
      date: point.date,
      label: point.label,
      volume: point.volume,
      net: point.net,
      zScore: (point.volume - mean) / std,
      positive: point.positive,
      neutral: point.neutral,
      negative: point.negative,
    }))
    .filter((spike) => spike.zScore >= 0.75)
    .sort((a, b) => b.zScore - a.zScore)
}

export function mentionsOnDay(mentions: Mention[], date: string): Mention[] {
  return mentions.filter((mention) => mention.createdAt.slice(0, 10) === date)
}

export function themesForMentions(
  themes: ThemeInsight[],
  dayMentions: Mention[],
): ThemeInsight[] {
  const ids = new Set(dayMentions.map((m) => m.id))
  return themes
    .map((theme) => {
      const overlap = theme.mentionIds.filter((id) => ids.has(id)).length
      return { theme, overlap }
    })
    .filter((row) => row.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .map((row) => row.theme)
}

export function newsNearDay(news: NewsItem[], date: string, padDays = 1): NewsItem[] {
  const center = new Date(`${date}T12:00:00Z`).getTime()
  const pad = padDays * 86_400_000
  return news.filter((item) => {
    const t = new Date(item.publishedAt).getTime()
    return Math.abs(t - center) <= pad
  })
}

export function severityInbox(
  themes: ThemeInsight[],
  actions: SuggestedAction[],
  mentions: Mention[],
  spikes: SpikeWindow[],
): Array<{
  id: string
  kind: 'spike' | 'theme' | 'mention'
  title: string
  severity: 'critical' | 'high' | 'medium'
  detail: string
  themeId?: string
  actionId?: string
  mentionIds: string[]
  date?: string
}> {
  const items: Array<{
    id: string
    kind: 'spike' | 'theme' | 'mention'
    title: string
    severity: 'critical' | 'high' | 'medium'
    detail: string
    themeId?: string
    actionId?: string
    mentionIds: string[]
    date?: string
  }> = []

  for (const spike of spikes.slice(0, 3)) {
    items.push({
      id: `spike-${spike.date}`,
      kind: 'spike',
      title: `Volume spike ${spike.label}`,
      severity: spike.zScore >= 1.5 ? 'critical' : 'high',
      detail: `${spike.volume} mentions (z=${spike.zScore.toFixed(1)}), net ${formatNet(spike.net)}`,
      mentionIds: mentions.filter((m) => m.createdAt.slice(0, 10) === spike.date).map((m) => m.id),
      date: spike.date,
    })
  }

  for (const theme of risingRisks(themes, 5)) {
    const related = actions.find((a) => a.relatedThemeIds.includes(theme.id))
    items.push({
      id: `theme-${theme.id}`,
      kind: 'theme',
      title: theme.name,
      severity: theme.sentimentScore <= -0.3 ? 'critical' : theme.trend > 50 ? 'high' : 'medium',
      detail: `${theme.mentionCount} mentions · net ${formatNet(theme.sentimentScore)} · ${formatPct(theme.trend)} velocity`,
      themeId: theme.id,
      actionId: related?.id,
      mentionIds: theme.mentionIds.slice(0, 8),
    })
  }

  const hotNeg = [...mentions]
    .filter((m) => m.sentiment === 'negative')
    .sort((a, b) => b.likes + b.reposts * 2 - (a.likes + a.reposts * 2))
    .slice(0, 3)

  for (const mention of hotNeg) {
    items.push({
      id: `mention-${mention.id}`,
      kind: 'mention',
      title: `High-engagement neg · ${mention.handle}`,
      severity: mention.likes + mention.reposts > 40 ? 'high' : 'medium',
      detail: mention.text.slice(0, 120) + (mention.text.length > 120 ? '…' : ''),
      mentionIds: [mention.id],
    })
  }

  const order = { critical: 0, high: 1, medium: 2 }
  return items.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 12)
}
