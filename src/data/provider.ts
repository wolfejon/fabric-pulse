import type { PulseDataProvider, PulseSnapshot } from '../types'
import { viewFromMentions } from '../lib/aggregate'
import {
  SAMPLE_DEPENDENCY_REQUESTS,
  SAMPLE_SEMESTER_PLANS,
  SAMPLE_THEME_MAPPINGS,
  SAMPLE_WORK_ITEMS,
} from './ado'
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

/**
 * Public demo provider. Swap `pulseProvider` export for a live public API
 * or an internal MS implementation — same PulseSnapshot contract.
 * See docs/PROVIDERS.md.
 */
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
      semesterPlans: SAMPLE_SEMESTER_PLANS,
      workItems: SAMPLE_WORK_ITEMS,
      dependencyRequests: SAMPLE_DEPENDENCY_REQUESTS,
      themeMappings: SAMPLE_THEME_MAPPINGS,
    }
  }
}

/**
 * Swap this export for a live implementation of PulseDataProvider
 * (public APIs or internal MS sources — no scraping in this prototype).
 */
export const pulseProvider: PulseDataProvider = new MockPulseDataProvider()
