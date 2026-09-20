import type {
  DependencyRequest,
  Mention,
  NewsItem,
  PulseDataProvider,
  PulseSnapshot,
  SemesterPlan,
  SuggestedAction,
  ThemeDefinition,
  ThemeSignalMapping,
  WorkItem,
} from '../types'
import { viewFromMentions } from '../lib/aggregate'
import { buildEvidenceClusters } from '../lib/evidence'
import { DEMO_COMPETITOR_FEATURES, DEMO_COMPETITOR_PAGES } from './competitors'
import { MERGED_INTELLIGENCE_NEWS } from './intelligenceLive'
import corpus from './generated/corpus.json'
import { enrichMentionsWithProvenance, enrichNewsWithProvenance } from './provenance'
import { DEMO_SOURCE_REGISTRY } from './sources'

const DEMO_DISCLAIMER = 'Demo data — not live X feed'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

/** Generated synthetic corpus (see `npm run generate:demo`). */
const RAW_MENTIONS = corpus.mentions as Mention[]
export const CORPUS_MENTIONS = enrichMentionsWithProvenance(RAW_MENTIONS)
export const CORPUS_THEME_DEFINITIONS = corpus.themeDefinitions as ThemeDefinition[]
export const CORPUS_ACTIONS = corpus.actions as SuggestedAction[]
export const CORPUS_NEWS = enrichNewsWithProvenance(corpus.news as NewsItem[])
export const CORPUS_SEMESTER_PLANS = corpus.semesterPlans as SemesterPlan[]
export const CORPUS_WORK_ITEMS = corpus.workItems as WorkItem[]
export const CORPUS_DEPENDENCY_REQUESTS = corpus.dependencyRequests as DependencyRequest[]
export const CORPUS_THEME_MAPPINGS = corpus.themeMappings as ThemeSignalMapping[]

/**
 * Public demo provider. Swap `pulseProvider` export for a live public API
 * or an internal MS implementation — same PulseSnapshot contract.
 * See docs/PROVIDERS.md.
 *
 * Prototype status: evidence clusters derived from mentions; competitor back-page
 * + source registry seeded for Pipelines / strategy MVP demos.
 */
export class MockPulseDataProvider implements PulseDataProvider {
  async getSnapshot(): Promise<PulseSnapshot> {
    await delay(280)
    const derived = viewFromMentions(CORPUS_MENTIONS, CORPUS_THEME_DEFINITIONS)
    const evidenceClusters = buildEvidenceClusters(derived.themes, CORPUS_MENTIONS)

    return {
      generatedAt: corpus.generatedAt,
      isDemo: true,
      demoDisclaimer: DEMO_DISCLAIMER,
      dateRange: corpus.dateRange,
      mentions: CORPUS_MENTIONS,
      themeDefinitions: CORPUS_THEME_DEFINITIONS,
      themes: derived.themes,
      actions: CORPUS_ACTIONS,
      news: CORPUS_NEWS,
      daily: derived.daily,
      workloads: derived.workloads,
      kpis: derived.kpis,
      semesterPlans: CORPUS_SEMESTER_PLANS,
      workItems: CORPUS_WORK_ITEMS,
      dependencyRequests: CORPUS_DEPENDENCY_REQUESTS,
      themeMappings: CORPUS_THEME_MAPPINGS,
      evidenceClusters,
      competitorFeatures: DEMO_COMPETITOR_FEATURES,
      competitorPages: DEMO_COMPETITOR_PAGES,
      sourceRegistry: DEMO_SOURCE_REGISTRY,
      intelligenceNews: MERGED_INTELLIGENCE_NEWS,
    }
  }
}

/**
 * Swap this export for a live implementation of PulseDataProvider
 * (public APIs or internal MS sources — no scraping in this prototype).
 */
export const pulseProvider: PulseDataProvider = new MockPulseDataProvider()
