import type { SourceRegistryEntry } from '../types'

/**
 * Demo source registry — strategy MVP names (STRATEGY-ARCHITECTURE.md §3).
 * Toggles persist in localStorage; defaults live here.
 */
export const DEMO_SOURCE_REGISTRY: SourceRegistryEntry[] = [
  {
    id: 'rss-fabric-updates',
    kind: 'rss',
    displayName: 'Blog RSS — Fabric Updates',
    enabled: true,
    lastRefresh: '2026-09-13T15:00:00Z',
    configBlurb: 'https://blog.fabric.microsoft.com/en-us/blog/feed/',
    legalNote: 'Official RSS',
  },
  {
    id: 'github-fabric-cicd-issues',
    kind: 'github-issues',
    displayName: 'GitHub — microsoft/fabric-cicd',
    enabled: true,
    lastRefresh: '2026-09-13T14:30:00Z',
    configBlurb: 'Issues API · microsoft/fabric-cicd',
    legalNote: 'Official GitHub API',
  },
  {
    id: 'reddit-microsoft-fabric',
    kind: 'reddit',
    displayName: 'Reddit — r/MicrosoftFabric',
    enabled: true,
    lastRefresh: '2026-09-13T14:00:00Z',
    configBlurb: 'r/MicrosoftFabric via Reddit Data API',
    legalNote: 'Official Data API',
  },
  {
    id: 'x-api-fabric',
    kind: 'x-api',
    displayName: 'X — Fabric keywords (capped)',
    enabled: false,
    lastRefresh: '2026-09-12T18:00:00Z',
    configBlurb: 'Capped keyword set · deferred for MVP spend',
    legalNote: 'Official X API — cost-gated',
  },
  {
    id: 'stackexchange-fabric',
    kind: 'stackexchange',
    displayName: 'Stack Overflow — [microsoft-fabric]',
    enabled: false,
    lastRefresh: '2026-09-10T12:00:00Z',
    configBlurb: 'Stack Exchange API · tag microsoft-fabric',
    legalNote: 'Official API — deferred',
  },
  {
    id: 'gdelt-fabric-news',
    kind: 'gdelt',
    displayName: 'GDELT — Fabric / ADF press',
    enabled: false,
    lastRefresh: '2026-09-11T08:00:00Z',
    configBlurb: 'News / press color for Newspaper',
    legalNote: 'GDELT public — deferred',
  },
]

export const SOURCES_STORAGE_KEY = 'fabric-pulse:sources-enabled'

/** Enabled source ids from localStorage, falling back to registry defaults. */
export function loadEnabledSourceIds(
  registry: SourceRegistryEntry[] = DEMO_SOURCE_REGISTRY,
): Set<string> {
  const defaults = new Set(registry.filter((s) => s.enabled).map((s) => s.id))
  if (typeof window === 'undefined') return defaults
  try {
    const raw = window.localStorage.getItem(SOURCES_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Record<string, boolean>
    const next = new Set<string>()
    for (const entry of registry) {
      const override = parsed[entry.id]
      if (override === undefined ? entry.enabled : override) {
        next.add(entry.id)
      }
    }
    return next
  } catch {
    return defaults
  }
}

export function persistEnabledSourceIds(
  enabled: Set<string>,
  registry: SourceRegistryEntry[] = DEMO_SOURCE_REGISTRY,
): void {
  if (typeof window === 'undefined') return
  const map: Record<string, boolean> = {}
  for (const entry of registry) {
    map[entry.id] = enabled.has(entry.id)
  }
  window.localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(map))
}
