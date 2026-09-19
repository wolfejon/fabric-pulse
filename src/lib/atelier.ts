import { WORKLOAD_CATALOG } from '../data/catalog'
import type {
  Mention,
  PulseKpis,
  ThemeInsight,
  WorkloadFilter,
  WorkloadStat,
} from '../types'
import { weatherMoodFromNet } from './narrative'

export type AtelierPulse = {
  moodWord: string
  calmChoppy: 'calm' | 'choppy' | 'storm'
  sentence: string
  themeName: string | null
  theme: ThemeInsight | null
  risingName: string | null
  volumeNote: string
  velocityNote: string
  net: number
  volume: number
  volumeTrend: number
  workloadLabel: string
  topQuote: Mention | null
  glowHue: 'cyan' | 'purple' | 'warm'
  applause: number // 0..1 soft glow meter
}

function topTheme(themes: ThemeInsight[]): ThemeInsight | null {
  if (themes.length === 0) return null
  return [...themes].sort(
    (a, b) => b.mentionCount - a.mentionCount || Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore),
  )[0]!
}

function risingTheme(themes: ThemeInsight[]): ThemeInsight | null {
  if (themes.length === 0) return null
  return [...themes].sort((a, b) => b.trend - a.trend || b.mentionCount - a.mentionCount)[0]!
}

function loudestWorkload(workloads: WorkloadStat[]): WorkloadStat | null {
  if (workloads.length === 0) return null
  return [...workloads].sort((a, b) => b.volume - a.volume)[0]!
}

function pickQuote(mentions: Mention[], theme: ThemeInsight | null): Mention | null {
  if (theme) {
    const ids = new Set(theme.mentionIds)
    const fromTheme = mentions.filter((m) => ids.has(m.id))
    if (fromTheme.length > 0) {
      return [...fromTheme].sort((a, b) => b.likes + b.reposts - (a.likes + a.reposts))[0]!
    }
  }
  if (mentions.length === 0) return null
  return [...mentions].sort((a, b) => b.likes + b.reposts - (a.likes + a.reposts))[0]!
}

/** Shared ≤5-beat pulse for atelier modes — filters already applied via view. */
export function buildAtelierPulse(
  kpis: PulseKpis,
  themes: ThemeInsight[],
  workloads: WorkloadStat[],
  mentions: Mention[],
  workload: WorkloadFilter,
): AtelierPulse {
  const mood = weatherMoodFromNet(kpis.netSentiment)
  const theme = topTheme(themes)
  const rising = risingTheme(themes)
  const loud = loudestWorkload(workloads)

  const workloadLabel =
    workload === 'all'
      ? 'All workloads'
      : WORKLOAD_CATALOG[workload]?.shortLabel ?? workload

  const focusName =
    workload !== 'all'
      ? WORKLOAD_CATALOG[workload]?.shortLabel ?? workload
      : loud
        ? WORKLOAD_CATALOG[loud.id]?.shortLabel ?? loud.shortLabel
        : 'Fabric'

  let sentence: string
  if (theme) {
    if (kpis.netSentiment <= -0.2) {
      sentence = `${focusName} feels heavy — mostly about ${theme.name}.`
    } else if (kpis.netSentiment >= 0.3) {
      sentence = `${focusName} is soft-spoken; ${theme.name} carries the warmth.`
    } else if (rising && rising.trend >= 30) {
      sentence = `${rising.name} is the thread rising through ${focusName}.`
    } else {
      sentence = `${focusName} holds one clear note: ${theme.name}.`
    }
  } else {
    sentence = `${focusName} is quiet in this window.`
  }

  const calmChoppy: AtelierPulse['calmChoppy'] =
    kpis.netSentiment <= -0.22 ? 'storm' : kpis.netSentiment < 0.12 ? 'choppy' : 'calm'

  const volumeNote =
    kpis.volume >= 40 ? 'High tide of mentions' : kpis.volume >= 20 ? 'Steady volume' : 'Sparse chatter'

  const velocityNote =
    kpis.volumeTrend >= 30
      ? 'Picking up'
      : kpis.volumeTrend <= -20
        ? 'Easing'
        : 'Steady pace'

  const glowHue: AtelierPulse['glowHue'] =
    kpis.netSentiment >= 0.2 ? 'cyan' : kpis.netSentiment <= -0.15 ? 'purple' : 'warm'

  const moodWord =
    calmChoppy === 'storm' ? 'Storm' : calmChoppy === 'choppy' ? 'Choppy' : mood === 'Bright' ? 'Bright' : 'Calm'

  // Applause: blend of positivity and volume (soft 0..1)
  const applause = Math.max(0, Math.min(1, (kpis.netSentiment + 1) / 2 * 0.7 + Math.min(kpis.volume, 50) / 50 * 0.3))

  return {
    moodWord,
    calmChoppy,
    sentence,
    themeName: theme?.name ?? null,
    theme,
    risingName: rising && rising.trend >= 15 ? rising.name : null,
    volumeNote,
    velocityNote,
    net: kpis.netSentiment,
    volume: kpis.volume,
    volumeTrend: kpis.volumeTrend,
    workloadLabel,
    topQuote: pickQuote(mentions, theme),
    glowHue,
    applause,
  }
}

export function atelierReceipts(mentions: Mention[], theme: ThemeInsight | null, limit = 3): Mention[] {
  if (theme) {
    const ids = new Set(theme.mentionIds)
    const fromTheme = mentions.filter((m) => ids.has(m.id))
    if (fromTheme.length > 0) {
      return [...fromTheme]
        .sort((a, b) => a.sentimentScore - b.sentimentScore || b.likes - a.likes)
        .slice(0, limit)
    }
  }
  return [...mentions]
    .sort((a, b) => a.sentimentScore - b.sentimentScore || b.likes - a.likes)
    .slice(0, limit)
}

/** Workloads shown in the sparse atelier switcher (subset + All). */
export const ATELIER_WORKLOAD_ORDER: WorkloadFilter[] = [
  'all',
  'pipelines',
  'data-engineering',
  'data-integration',
  'onelake',
  'data-warehouse',
  'realtime-analytics',
  'data-science',
  'power-bi',
  'copilot-ai',
  'security-governance',
  'other',
]

export function atelierWorkloadShort(id: WorkloadFilter): string {
  if (id === 'all') return 'All'
  if (id === 'realtime-analytics') return 'RTA'
  return WORKLOAD_CATALOG[id]?.shortLabel ?? id
}
