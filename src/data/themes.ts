import type { ThemeDefinition } from '../types'
import corpus from './generated/corpus.json'

/**
 * Keyword theme definitions from the generated demo corpus.
 * Regenerate with `npm run generate:demo` (see src/data/README.md).
 * Clustering assigns mentions by case-insensitive keyword match.
 */
export const THEME_DEFINITIONS = corpus.themeDefinitions as ThemeDefinition[]
