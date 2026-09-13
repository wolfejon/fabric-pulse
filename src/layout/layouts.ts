export type LayoutId =
  | 'weather'
  | 'letter'
  | 'classic'
  | 'diagnosis-object'
  | 'spike-cinema'
  | 'ask-the-pulse'
  | 'war-room'

export type LayoutMeta = {
  id: LayoutId
  name: string
  subtitle: string
  /** Primary artistic experiences vs deprecated archive dashboards */
  group: 'primary' | 'archive'
}

/** Bumped so the UI reset lands everyone on Weather, not a stale Classic id. */
export const LAYOUT_STORAGE_KEY = 'fabric-pulse-layout-v2'
export const DEFAULT_LAYOUT_ID: LayoutId = 'weather'

export const LAYOUTS: LayoutMeta[] = [
  {
    id: 'weather',
    name: 'Weather',
    subtitle: 'Sky mood + one loud line',
    group: 'primary',
  },
  {
    id: 'letter',
    name: 'Letter',
    subtitle: 'One sentence + receipts',
    group: 'primary',
  },
  {
    id: 'classic',
    name: 'Classic',
    subtitle: 'Deprecated — old scroll dashboard',
    group: 'archive',
  },
  {
    id: 'diagnosis-object',
    name: 'Diagnosis Object',
    subtitle: 'Deprecated — Volume×Pain treemap',
    group: 'archive',
  },
  {
    id: 'spike-cinema',
    name: 'Spike Cinema',
    subtitle: 'Deprecated — timeline spikes',
    group: 'archive',
  },
  {
    id: 'ask-the-pulse',
    name: 'Ask the Pulse',
    subtitle: 'Deprecated — prompt-first brief',
    group: 'archive',
  },
  {
    id: 'war-room',
    name: 'War Room',
    subtitle: 'Deprecated — dense triage console',
    group: 'archive',
  },
]

export const PRIMARY_LAYOUTS = LAYOUTS.filter((l) => l.group === 'primary')
export const ARCHIVE_LAYOUTS = LAYOUTS.filter((l) => l.group === 'archive')

/** Older layout ids from prior prototypes → current ids */
const LEGACY_LAYOUT_MAP: Record<string, LayoutId> = {
  'morning-brief': 'ask-the-pulse',
  'volume-pain': 'diagnosis-object',
  'story-timeline': 'spike-cinema',
}

export function isLayoutId(value: string | null | undefined): value is LayoutId {
  return LAYOUTS.some((layout) => layout.id === value)
}

export function resolveLayoutId(value: string | null | undefined): LayoutId | null {
  if (isLayoutId(value)) return value
  if (value && value in LEGACY_LAYOUT_MAP) return LEGACY_LAYOUT_MAP[value]!
  return null
}

export function getLayoutMeta(id: LayoutId): LayoutMeta {
  return LAYOUTS.find((layout) => layout.id === id) ?? LAYOUTS[0]!
}

export function isArtisticLayout(id: LayoutId): boolean {
  return id === 'weather' || id === 'letter'
}

export function isArchiveLayout(id: LayoutId): boolean {
  return getLayoutMeta(id).group === 'archive'
}
