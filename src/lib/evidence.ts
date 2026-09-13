import type { EvidenceCluster, Mention, ThemeInsight, VolumeClass } from '../types'

/** Heuristic from STRATEGY-ARCHITECTURE.md §4. */
export function classifyVolume(uniqueAuthors: number, mentionCount: number): VolumeClass {
  if (uniqueAuthors <= 2 || mentionCount <= 3) return 'single'
  if (uniqueAuthors <= 8) return 'thin'
  return 'crowd'
}

export function uniqueAuthorsFrom(mentions: Mention[]): number {
  const keys = new Set<string>()
  for (const m of mentions) {
    keys.add(m.handle || m.author || m.id)
  }
  return keys.size
}

export function volumeClassLabel(cls: VolumeClass): string {
  if (cls === 'single') return 'single voice'
  if (cls === 'thin') return 'thin but recurring'
  return 'crowd'
}

export function evidenceBadgeText(
  mentionCount: number,
  uniqueAuthors: number,
  volumeClass: VolumeClass,
): string {
  const authorWord = uniqueAuthors === 1 ? 'author' : 'authors'
  const mentionWord = mentionCount === 1 ? 'mention' : 'mentions'
  const cue =
    volumeClass === 'single'
      ? 'single voice'
      : volumeClass === 'thin'
        ? 'thin'
        : 'crowd'
  return `${mentionCount} ${mentionWord} · ${uniqueAuthors} ${authorWord} · ${cue}`
}

export function buildEvidenceCluster(
  theme: ThemeInsight,
  mentions: Mention[],
  sampleSize = 5,
): EvidenceCluster {
  const related = mentions.filter((m) => theme.mentionIds.includes(m.id))
  const sorted = [...related].sort(
    (a, b) => b.likes + b.reposts - (a.likes + a.reposts),
  )
  const times = related.map((m) => m.createdAt).sort()
  return {
    id: `ev-${theme.id}`,
    themeId: theme.id,
    workload: theme.workloads[0],
    cloudBoundary: theme.cloudBoundary,
    mentionIds: theme.mentionIds,
    mentionCount: theme.mentionCount,
    uniqueAuthorCount: theme.uniqueAuthorCount,
    volumeClass: theme.volumeClass,
    sampleMentionIds: sorted.slice(0, sampleSize).map((m) => m.id),
    windowStart: times[0] ?? '',
    windowEnd: times[times.length - 1] ?? '',
  }
}

export function buildEvidenceClusters(
  themes: ThemeInsight[],
  mentions: Mention[],
): EvidenceCluster[] {
  return themes.map((t) => buildEvidenceCluster(t, mentions))
}
