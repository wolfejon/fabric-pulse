export type LayoutId =
  | 'classic'
  | 'diagnosis-object'
  | 'spike-cinema'
  | 'ask-the-pulse'
  | 'war-room'

export type LayoutMeta = {
  id: LayoutId
  name: string
  subtitle: string
}

export const LAYOUT_STORAGE_KEY = 'fabric-pulse-layout'
export const DEFAULT_LAYOUT_ID: LayoutId = 'classic'

/** Prefer switcher order: Classic | Diagnosis Object | Spike Cinema | Ask the Pulse | War Room */
export const LAYOUTS: LayoutMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    subtitle: 'Scroll dashboard (default)',
  },
  {
    id: 'diagnosis-object',
    name: 'Diagnosis Object',
    subtitle: 'Volume×Pain treemap command surface',
  },
  {
    id: 'spike-cinema',
    name: 'Spike Cinema',
    subtitle: 'Timeline spikes → why stories',
  },
  {
    id: 'ask-the-pulse',
    name: 'Ask the Pulse',
    subtitle: 'Prompt-first home + template briefs',
  },
  {
    id: 'war-room',
    name: 'War Room',
    subtitle: 'Dense triage console',
  },
]

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
