import type { Mention } from '../types'
import corpus from './generated/corpus.json'

/** Demo mentions from generated corpus. Fiction only — not a live feed. */
export const SAMPLE_MENTIONS = corpus.mentions as Mention[]
