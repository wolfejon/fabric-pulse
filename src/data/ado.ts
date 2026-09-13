import type {
  DependencyRequest,
  SemesterPlan,
  ThemeSignalMapping,
  WorkItem,
} from '../types'
import corpus from './generated/corpus.json'

/** Demo semester plans — not live ADO. */
export const SAMPLE_SEMESTER_PLANS = corpus.semesterPlans as SemesterPlan[]

/** Fake Azure DevOps work items mapped to themes. */
export const SAMPLE_WORK_ITEMS = corpus.workItems as WorkItem[]

export const SAMPLE_DEPENDENCY_REQUESTS = corpus.dependencyRequests as DependencyRequest[]

/**
 * Theme ↔ ADO coverage. Gaps are intentional demo signals
 * (strong customer noise, thin or missing backlog).
 */
export const SAMPLE_THEME_MAPPINGS = corpus.themeMappings as ThemeSignalMapping[]
