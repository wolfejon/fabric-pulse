export type LayoutId =
  | 'weather'
  | 'letter'
  | 'fabric-horizon'
  | 'weave-thread'
  | 'constellation'
  | 'pulse-stamp'
  | 'lake-ripple'
  | 'stage-light'
  | 'ink-wash'
  | 'desk-globe'
  | 'signal-lantern'
  | 'quiet-credits'
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

/** Bumped so atelier modes land cleanly (v2 → v3). */
export const LAYOUT_STORAGE_KEY = 'fabric-pulse-layout-v3'
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
    id: 'fabric-horizon',
    name: 'Horizon',
    subtitle: 'Shore of OneLake',
    group: 'primary',
  },
  {
    id: 'weave-thread',
    name: 'Weave Thread',
    subtitle: 'One luminous thread',
    group: 'primary',
  },
  {
    id: 'constellation',
    name: 'Constellation',
    subtitle: 'Night sky of names',
    group: 'primary',
  },
  {
    id: 'pulse-stamp',
    name: 'Pulse Stamp',
    subtitle: 'Commemorative week stamp',
    group: 'primary',
  },
  {
    id: 'lake-ripple',
    name: 'Lake Ripple',
    subtitle: 'Mention waves on water',
    group: 'primary',
  },
  {
    id: 'stage-light',
    name: 'Stage Light',
    subtitle: 'One spotlight truth',
    group: 'primary',
  },
  {
    id: 'ink-wash',
    name: 'Ink Wash',
    subtitle: 'One brushstroke week',
    group: 'primary',
  },
  {
    id: 'desk-globe',
    name: 'Desk Globe',
    subtitle: 'Turn the estate',
    group: 'primary',
  },
  {
    id: 'signal-lantern',
    name: 'Signal Lantern',
    subtitle: 'Glow is the pulse',
    group: 'primary',
  },
  {
    id: 'quiet-credits',
    name: 'Quiet Credits',
    subtitle: 'End credits typography',
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
  return getLayoutMeta(id).group === 'primary'
}

export function isArchiveLayout(id: LayoutId): boolean {
  return getLayoutMeta(id).group === 'archive'
}
