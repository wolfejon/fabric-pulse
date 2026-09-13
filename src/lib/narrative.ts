import { WORKLOAD_CATALOG } from '../data/catalog'
import type {
  Mention,
  PulseKpis,
  SuggestedAction,
  ThemeInsight,
  WorkloadStat,
} from '../types'

export type WeatherMood = 'Bright' | 'Clear' | 'Unsettled' | 'Stormy'

export type WeatherNarrative = {
  mood: WeatherMood
  /** Soft sky wash — whimsical, not SOC dark */
  skyClass: string
  inkClass: string
  muteClass: string
  loudLine: string
  loudTheme: ThemeInsight | null
  loudWorkloadLabel: string | null
  windNote: string
  rainNote: string
}

export type LetterNarrative = {
  sentence: string
  positiveTheme: ThemeInsight | null
  negativeTheme: ThemeInsight | null
  receipts: LetterReceipt[]
}

export type LetterReceipt = {
  id: string
  label: string
  mention: Mention
}

/** Map net sentiment (−1…1) to a gallery mood word. */
export function weatherMoodFromNet(net: number): WeatherMood {
  if (net >= 0.35) return 'Bright'
  if (net >= 0.12) return 'Clear'
  if (net <= -0.22) return 'Stormy'
  return 'Unsettled'
}

function mostNegativeTheme(themes: ThemeInsight[]): ThemeInsight | null {
  if (themes.length === 0) return null
  return [...themes].sort(
    (a, b) => a.sentimentScore - b.sentimentScore || b.mentionCount - a.mentionCount,
  )[0]!
}

function mostPositiveTheme(themes: ThemeInsight[]): ThemeInsight | null {
  if (themes.length === 0) return null
  return [...themes].sort(
    (a, b) => b.sentimentScore - a.sentimentScore || b.mentionCount - a.mentionCount,
  )[0]!
}

function topRisingTheme(themes: ThemeInsight[]): ThemeInsight | null {
  if (themes.length === 0) return null
  return [...themes].sort((a, b) => b.trend - a.trend || b.mentionCount - a.mentionCount)[0]!
}

function loudestWorkload(workloads: WorkloadStat[]): WorkloadStat | null {
  if (workloads.length === 0) return null
  return [...workloads].sort((a, b) => b.volume - a.volume)[0]!
}

/**
 * Prefer a rising-or-negative theme for the “what’s loud” line;
 * fall back to the busiest Fabric workload name.
 */
export function buildWeatherNarrative(
  kpis: PulseKpis,
  themes: ThemeInsight[],
  workloads: WorkloadStat[],
): WeatherNarrative {
  const mood = weatherMoodFromNet(kpis.netSentiment)
  const rising = topRisingTheme(themes)
  const negative = mostNegativeTheme(themes)
  const loudWorkload = loudestWorkload(workloads)

  // Prefer rising if it’s meaningfully up; else most negative; else volume leader.
  let loudTheme: ThemeInsight | null = null
  if (rising && rising.trend >= 25) loudTheme = rising
  else if (negative && negative.sentimentScore < -0.05) loudTheme = negative
  else loudTheme = rising ?? negative

  const workloadLabel = loudWorkload
    ? WORKLOAD_CATALOG[loudWorkload.id]?.shortLabel ?? loudWorkload.shortLabel
    : null

  let loudLine: string
  if (loudTheme) {
    const name = loudTheme.name
    if (loudTheme.trend >= 40) {
      loudLine = `${name} is rising fast in the Fabric estate.`
    } else if (loudTheme.sentimentScore <= -0.2) {
      loudLine = `${name} is the storm front today.`
    } else if (workloadLabel) {
      loudLine = `${workloadLabel} is loud — mostly about ${name}.`
    } else {
      loudLine = `${name} is what’s loud today.`
    }
  } else if (workloadLabel) {
    loudLine = `${workloadLabel} is loud today.`
  } else {
    loudLine = 'The Fabric estate is quiet this window.'
  }

  const skyByMood: Record<WeatherMood, string> = {
    Bright:
      'from-[#f7e8c8] via-[#c9dff5] to-[#9ec5e8]',
    Clear:
      'from-[#dce9f7] via-[#b8cfe8] to-[#8fb4d9]',
    Unsettled:
      'from-[#c5b8d4] via-[#9aa8c4] to-[#5c6f94]',
    Stormy:
      'from-[#6b7a9a] via-[#3d4a6b] to-[#1e2740]',
  }

  const inkByMood: Record<WeatherMood, string> = {
    Bright: 'text-[#1a2a3a]',
    Clear: 'text-[#162433]',
    Unsettled: 'text-[#f4f0fa]',
    Stormy: 'text-[#f0f4fa]',
  }

  const muteByMood: Record<WeatherMood, string> = {
    Bright: 'text-[#3d5266]/70',
    Clear: 'text-[#3d5266]/75',
    Unsettled: 'text-white/65',
    Stormy: 'text-white/60',
  }

  const volume = kpis.volume
  const rainNote =
    volume >= 40 ? 'Heavy shower of mentions' : volume >= 20 ? 'Steady rain of chatter' : 'Light mist of mentions'

  const windNote =
    kpis.volumeTrend >= 30
      ? 'Wind picking up'
      : kpis.volumeTrend <= -20
        ? 'Wind easing'
        : 'Light breeze'

  return {
    mood,
    skyClass: skyByMood[mood],
    inkClass: inkByMood[mood],
    muteClass: muteByMood[mood],
    loudLine,
    loudTheme,
    loudWorkloadLabel: workloadLabel,
    windNote,
    rainNote,
  }
}

const LETTER_TEMPLATES = [
  (pos: string, neg: string) =>
    `People are kinder about ${pos} than about ${neg} this week.`,
  (pos: string, neg: string) =>
    `The Fabric estate softens on ${pos} — and sharpens its teeth on ${neg}.`,
  (pos: string, neg: string) =>
    `${pos} drew warmth; ${neg} drew the complaints.`,
  (pos: string, neg: string) =>
    `If you only read one sentence: praise leans ${pos}, pain leans ${neg}.`,
] as const

export function buildLetterNarrative(
  themes: ThemeInsight[],
  mentions: Mention[],
  byId: Map<string, Mention>,
): LetterNarrative {
  const positiveTheme = mostPositiveTheme(themes)
  const negativeTheme = mostNegativeTheme(themes)

  const posName = positiveTheme?.name ?? 'Copilot'
  const negName =
    negativeTheme && negativeTheme.id !== positiveTheme?.id
      ? negativeTheme.name
      : themes.find((t) => t.id !== positiveTheme?.id)?.name ?? 'capacity'

  // Stable template pick from theme ids (no LLM, deterministic).
  const seed = (positiveTheme?.id.length ?? 0) + (negativeTheme?.id.length ?? 0)
  const template = LETTER_TEMPLATES[seed % LETTER_TEMPLATES.length]!
  const sentence = template(posName, negName)

  const pickMention = (theme: ThemeInsight | null, prefer: 'positive' | 'negative' | 'any') => {
    if (!theme) return null
    const candidates = theme.mentionIds
      .map((id) => byId.get(id))
      .filter((m): m is Mention => Boolean(m))
    const ranked = [...candidates].sort((a, b) => {
      if (prefer === 'positive') return b.sentimentScore - a.sentimentScore
      if (prefer === 'negative') return a.sentimentScore - b.sentimentScore
      return b.likes + b.reposts - (a.likes + a.reposts)
    })
    return ranked[0] ?? null
  }

  const receipts: LetterReceipt[] = []
  const posM = pickMention(positiveTheme, 'positive')
  if (posM && positiveTheme) {
    receipts.push({ id: 'r-pos', label: positiveTheme.name, mention: posM })
  }
  const negM = pickMention(
    negativeTheme && negativeTheme.id !== positiveTheme?.id ? negativeTheme : null,
    'negative',
  )
  if (negM && negativeTheme) {
    receipts.push({ id: 'r-neg', label: negativeTheme.name, mention: negM })
  }

  // Third receipt: high-engagement leftover, or rising theme
  const rising = topRisingTheme(themes)
  const used = new Set(receipts.map((r) => r.mention.id))
  let third: Mention | null = pickMention(
    rising && rising.id !== positiveTheme?.id && rising.id !== negativeTheme?.id ? rising : null,
    'any',
  )
  if (third && used.has(third.id)) third = null
  if (!third) {
    third =
      [...mentions]
        .filter((m) => !used.has(m.id))
        .sort((a, b) => b.likes + b.reposts - (a.likes + a.reposts))[0] ?? null
  }
  if (third) {
    const label =
      rising && rising.mentionIds.includes(third.id)
        ? rising.name
        : WORKLOAD_CATALOG[third.workload]?.shortLabel ?? 'Mention'
    receipts.push({ id: 'r-third', label, mention: third })
  }

  return {
    sentence,
    positiveTheme,
    negativeTheme:
      negativeTheme && negativeTheme.id !== positiveTheme?.id ? negativeTheme : null,
    receipts: receipts.slice(0, 3),
  }
}

export function forecastMentions(
  loudTheme: ThemeInsight | null,
  mentions: Mention[],
  byId: Map<string, Mention>,
  limit = 3,
): Mention[] {
  if (loudTheme) {
    const fromTheme = loudTheme.mentionIds
      .map((id) => byId.get(id))
      .filter((m): m is Mention => Boolean(m))
      .sort((a, b) => a.sentimentScore - b.sentimentScore || b.likes - a.likes)
    if (fromTheme.length > 0) return fromTheme.slice(0, limit)
  }
  return [...mentions]
    .sort((a, b) => a.sentimentScore - b.sentimentScore || b.likes - a.likes)
    .slice(0, limit)
}

export function pickSuggestedMove(
  actions: SuggestedAction[],
  loudTheme: ThemeInsight | null,
): SuggestedAction | null {
  if (actions.length === 0) return null
  if (loudTheme) {
    const related = actions.filter((a) => a.relatedThemeIds.includes(loudTheme.id))
    if (related.length > 0) {
      return [...related].sort((a, b) => {
        const rank = (x: SuggestedAction) =>
          (x.impact === 'high' ? 3 : x.impact === 'medium' ? 2 : 1) * 10 -
          (x.effort === 'low' ? 0 : x.effort === 'medium' ? 1 : 2)
        return rank(b) - rank(a)
      })[0]!
    }
  }
  return (
    [...actions].sort((a, b) => {
      const impact = (x: SuggestedAction) => (x.impact === 'high' ? 3 : x.impact === 'medium' ? 2 : 1)
      return impact(b) - impact(a)
    })[0] ?? null
  )
}
