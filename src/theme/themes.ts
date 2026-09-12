export type ThemeId =
  | 'pulse'
  | 'fluent'
  | 'paper'
  | 'ops'
  | 'glass'
  | 'narrative'
  | 'enterprise'
  | 'radar'

export type ThemeMeta = {
  id: ThemeId
  name: string
  subtitle: string
  experimental?: boolean
}

export const THEME_STORAGE_KEY = 'fabric-pulse-theme'
export const DEFAULT_THEME_ID: ThemeId = 'pulse'

export const THEMES: ThemeMeta[] = [
  {
    id: 'pulse',
    name: 'Pulse Teal',
    subtitle: 'Baseline dark teal demo',
  },
  {
    id: 'fluent',
    name: 'Fluent Fabric',
    subtitle: 'Neutrals + Fabric cyan moments',
  },
  {
    id: 'paper',
    name: 'Soft Paper',
    subtitle: 'Calm light PM brief',
  },
  {
    id: 'ops',
    name: 'Dense Ops',
    subtitle: 'Compact high-ink console',
  },
  {
    id: 'glass',
    name: 'Marketing Glass',
    subtitle: 'Deep navy glass, purple accent',
  },
  {
    id: 'narrative',
    name: 'Narrative Board',
    subtitle: 'Light leadership slabs',
  },
  {
    id: 'enterprise',
    name: 'Light Enterprise',
    subtitle: 'Teams / SharePoint adjacent',
  },
  {
    id: 'radar',
    name: 'Signal Radar',
    subtitle: 'Experimental HUD',
    experimental: true,
  },
]

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return THEMES.some((theme) => theme.id === value)
}

export function getThemeMeta(id: ThemeId): ThemeMeta {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0]!
}
