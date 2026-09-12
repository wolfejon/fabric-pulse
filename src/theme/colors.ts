import { useMemo } from 'react'
import { useTheme } from './ThemeProvider'

export type ThemeColors = {
  canvas: string
  panel: string
  elevated: string
  line: string
  ink: string
  mute: string
  faint: string
  teal: string
  tealBright: string
  pos: string
  neg: string
  neu: string
  amber: string
  official: string
  chartGrid: string
}

const COLOR_VARS: Record<keyof ThemeColors, string> = {
  canvas: '--color-canvas',
  panel: '--color-panel',
  elevated: '--color-elevated',
  line: '--color-line',
  ink: '--color-ink',
  mute: '--color-mute',
  faint: '--color-faint',
  teal: '--color-teal',
  tealBright: '--color-teal-bright',
  pos: '--color-pos',
  neg: '--color-neg',
  neu: '--color-neu',
  amber: '--color-amber',
  official: '--color-official',
  chartGrid: '--color-chart-grid',
}

const FALLBACKS: ThemeColors = {
  canvas: '#0b1118',
  panel: '#121a24',
  elevated: '#182230',
  line: '#243040',
  ink: '#e8eef4',
  mute: '#8b9bb0',
  faint: '#5d6d82',
  teal: '#00b7c3',
  tealBright: '#3ee0ea',
  pos: '#3ddc97',
  neg: '#ff6b7a',
  neu: '#8b9bb0',
  amber: '#e8b84a',
  official: '#6ea8ff',
  chartGrid: '#243040',
}

function readCssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export function readThemeColors(): ThemeColors {
  const colors = {} as ThemeColors
  for (const key of Object.keys(COLOR_VARS) as (keyof ThemeColors)[]) {
    colors[key] = readCssVar(COLOR_VARS[key], FALLBACKS[key])
  }
  return colors
}

/** Reactive theme colors for charts / inline styles that cannot use Tailwind classes. */
export function useThemeColors(): ThemeColors {
  const { themeId } = useTheme()
  return useMemo(() => readThemeColors(), [themeId])
}
