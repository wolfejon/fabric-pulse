# Data providers

Fabric Pulse keeps a single data contract so the UI never forks when the source changes.

## Contract

```ts
interface PulseDataProvider {
  getSnapshot(): Promise<PulseSnapshot>
}
```

`PulseSnapshot` (see `src/types.ts`) includes:

| Slice | Fields |
| --- | --- |
| Signals | `mentions`, `themeDefinitions`, `themes`, `actions`, `news` |
| Aggregates | `daily`, `workloads`, `kpis`, `dateRange` |
| ADO alignment | `semesterPlans`, `workItems`, `dependencyRequests`, `themeMappings` |

Normalize every source into these shapes. Mentions and themes may carry optional `cloudBoundary` (`commercial` \| `usgov` \| `il7` \| `il6` \| `unknown`). Themes carry `polarity` (`want` \| `dont-like` \| `mixed`). Theme ↔ ADO links use `ThemeSignalMapping.coverage`: `covered` \| `partial` \| `gap`.

## Implementations

| Provider | Status | Role |
| --- | --- | --- |
| `MockPulseDataProvider` | **Shipped** (`src/data/provider.ts`) | Demo corpus + fake ADO mappings |
| Public / OSINT live | Not wired | Licensed listening APIs or DIY public feeds → same snapshot |
| Internal Microsoft | Not in this repo | Customer-facing engineer reports, support tickets, VoC, live ADO — connect in an **internal** fork |

## How to swap

1. Implement `PulseDataProvider.getSnapshot()`.
2. Map upstream records into `Mention`, `ThemeDefinition` / clustered `ThemeInsight`, and ADO entities.
3. Export your instance as `pulseProvider` from `src/data/provider.ts` (or inject via a thin factory).
4. Leave clustering helpers in `src/lib/aggregate.ts` reusable — or pre-compute `themes` server-side and still return the same snapshot fields.

```ts
// src/data/provider.ts
export const pulseProvider: PulseDataProvider = new MockPulseDataProvider()
// later:
// export const pulseProvider: PulseDataProvider = new InternalMsPulseProvider({ … })
```

## Guardrails

- No scraping and no corp auth in the public prototype.
- Keep PII / tenant identifiers out of public snapshots.
- UI filters (`workload` + `cloudBoundary`) are client-side on the snapshot — providers may also pre-filter, but must remain schema-compatible.
- Coverage / Plan Mirror reads `themeMappings` + `workItems` + `dependencyRequests`; empty arrays are valid (everything shows as gap).

## Mock data locations

| File | Contents |
| --- | --- |
| `src/data/mentions.ts` | Sample mentions (incl. USGov / IL7 / IL6 / commercial) |
| `src/data/themes.ts` | Keyword theme definitions + polarity |
| `src/data/ado.ts` | Semester plans, work items, dependency requests, theme mappings |
| `src/data/actions.ts` / `news.ts` | Suggested actions and news |

## Prototype status (2026-09-13)

- **Evidence:** `ThemeInsight.uniqueAuthorCount` / `volumeClass` derived in `clusterThemes`; Newspaper + Coverage badges open an evidence sheet with synthetic permalinks.
- **Competitors:** `competitorFeatures` / `competitorPages` seeded for Pipelines (Glue, Lakeflow, Informatica, ADF-classic); Newspaper jump → Chronicle back page.
- **Sources:** Demo `sourceRegistry` + MinimalChrome Sources drawer; enabled ids in `localStorage`; mentions/news filtered by `sourceEntryId`.
