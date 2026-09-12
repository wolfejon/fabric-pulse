import type { PulseDataProvider, PulseSnapshot } from '../types'
import { viewFromMentions } from '../lib/aggregate'
import { SAMPLE_ACTIONS } from './actions'
import { SAMPLE_MENTIONS } from './mentions'
import { SAMPLE_NEWS } from './news'
import { THEME_DEFINITIONS } from './themes'

const DEMO_DISCLAIMER = 'Demo data — not live X feed'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export class MockPulseDataProvider implements PulseDataProvider {
  async getSnapshot(): Promise<PulseSnapshot> {
    await delay(280)
    const derived = viewFromMentions(SAMPLE_MENTIONS, THEME_DEFINITIONS)

    return {
      generatedAt: '2026-09-12T21:00:00Z',
      isDemo: true,
      demoDisclaimer: DEMO_DISCLAIMER,
      dateRange: {
        start: '2026-09-05',
        end: '2026-09-12',
        label: 'Sep 5 – Sep 12, 2026',
      },
      mentions: SAMPLE_MENTIONS,
      themeDefinitions: THEME_DEFINITIONS,
      themes: derived.themes,
      actions: SAMPLE_ACTIONS,
      news: SAMPLE_NEWS,
      daily: derived.daily,
      workloads: derived.workloads,
      kpis: derived.kpis,
    }
  }
}

/**
 * Swap this export for a live implementation of PulseDataProvider
 * (no scraping in this prototype — keep the contract, change the class).
 */
export const pulseProvider: PulseDataProvider = new MockPulseDataProvider()
