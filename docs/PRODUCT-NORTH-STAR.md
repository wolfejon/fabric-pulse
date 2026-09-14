# Fabric Pulse — Product North Star

Concise product brief for where this demo is headed. Engineering-friendly; not a dashboard redesign.

## Aspiration

Help Microsoft Fabric product teams answer, per workload and cloud boundary:

1. **What do customers want?**
2. **What do they dislike?**
3. **Are we already working on it in Azure DevOps** (semester plan, work items, dependency requests) — **covered vs gaps?**

Presentation stays **atelier / minimalist**. Cloud and ADO are sparse controls (pills / edition selectors), not a KPI wall.

---

## 1. Per-workload themes

Roll signal up by Fabric workload (Pipelines, Data Engineering, OneLake, Warehouse, RTA, Power BI, Copilot, …).

For each workload, surface **theme clusters** as:

| Side | Meaning |
| --- | --- |
| **Wants** | Positive / request themes — what customers ask for or praise |
| **Don’t like** | Negative / friction themes — pain, confusion, regressions |

Themes are generalizable (keyword / taxonomy definitions), not one-off post labels. Filtering by workload should change copy and aggregates only — same sparse UI shell.

---

## 2. Cloud slices

Signals and ADO coverage should be filterable by cloud boundary:

| Slice | Intent |
| --- | --- |
| **All** | Cross-cloud / default |
| **Commercial** | Public commercial Fabric |
| **USGov** | Azure Government |
| **IL7** | Impact Level 7 |
| **IL6** | Impact Level 6 |

UI: one sparse pill / edition control — not a cloud KPI matrix. Mentions and themes may carry an optional `cloudBoundary`; omit = commercial / unspecified.

---

## 3. Data sources & swappable provider

| Layer | This prototype | Internal handoff |
| --- | --- | --- |
| **Public / OSINT** | Sample mentions, themes, news via `PulseDataProvider` | Keep / extend with licensed or DIY public APIs |
| **Internal Microsoft** | Not wired here | Customer-facing engineer reports, support tickets, VoC exports, etc. — connected by the user in their **internal** repo |

**Design rule:** keep a stable provider + schema so swapping mock → public live → internal corp sources is a data-plane change, not a UI rewrite.

```ts
// Existing contract — extend snapshot; do not fork the UI
interface PulseDataProvider {
  getSnapshot(): Promise<PulseSnapshot>
}
```

Normalize every source into the same mention / theme / ADO mapping shapes below. Internal PII and tenant identifiers stay out of the public prototype.

---

## 4. Azure DevOps alignment

Map theme signals to what the team is **actually shipping**:

- **Semester planning** — which semester / planning period owns the work
- **Work items** — features, bugs, tasks already filed
- **Dependency requests** — cross-team blockers / asks

For each want / don’t-like theme, show:

| Status | Meaning |
| --- | --- |
| **Covered** | Mapped to one or more ADO entities in an active semester |
| **Gap** | Strong signal, no (or stale) ADO mapping |

Goal: close the loop from complaint/want → backlog reality without dumping a full ADO board into the atelier UI. Sparse “covered / gap” cues next to themes are enough.

---

## Suggested data model (sketch)

Keep types thin; grow `PulseSnapshot` rather than parallel apps.

```ts
type CloudBoundary = 'all' | 'commercial' | 'usgov' | 'il7' | 'il6'

// Signal side (extends today’s Mention / ThemeInsight)
interface Mention {
  /* …existing fields… */
  cloudBoundary?: CloudBoundary  // optional; default commercial/unspecified
}

interface ThemeInsight {
  /* …existing fields… */
  polarity?: 'want' | 'dont-like' | 'mixed'
  cloudBoundary?: CloudBoundary
}

// ADO side
interface SemesterPlan {
  id: string
  name: string           // e.g. "FY27 H1"
  start: string
  end: string
}

interface WorkItem {
  id: string
  adoId: string          // Azure DevOps id / URL key
  title: string
  type: 'feature' | 'bug' | 'task' | 'epic' | string
  state: string
  workload?: WorkloadId
  semesterId?: string
  cloudBoundary?: CloudBoundary
  url?: string
}

interface DependencyRequest {
  id: string
  title: string
  fromTeam: string
  toTeam: string
  state: string
  relatedWorkItemIds: string[]
  semesterId?: string
  cloudBoundary?: CloudBoundary
}

// Bridge: theme signal ↔ ADO
interface ThemeSignalMapping {
  id: string
  themeId: string
  workItemIds?: string[]
  dependencyIds?: string[]
  semesterId?: string
  coverage: 'covered' | 'partial' | 'gap'
  notes?: string
}
```

Provider snapshot can later include `semesterPlans`, `workItems`, `dependencyRequests`, and `themeMappings` alongside mentions/themes. Mock provider ships empty or sample mappings; internal provider fills from ADO + corp sources.

---

## UI guardrails

- Prefer **Weather / Letter / atelier** modes; Archive stays the dense escape hatch.
- Cloud + ADO = **pills / edition**, not charts of charts.
- One loud line + sparse evidence beats a KPI wall.
- Workload switcher already exists — cloud / coverage should feel the same weight.

---

## Out of scope for this brief

- Full ADO board clone or semester planning UI redesign
- Live scraping or corp auth in the public repo
- Dense executive dashboards

Ship signal clarity and covered-vs-gap honesty first; presentation stays quiet and editorial.
