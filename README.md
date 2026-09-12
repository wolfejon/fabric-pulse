# Fabric Pulse

Demo social-listening and sentiment dashboard for **Microsoft Fabric** product teams.

> **Demo data — not a live X feed.** Mentions, themes, suggested actions, and news are sample data served by a swappable `PulseDataProvider`. This prototype does not scrape X or call a live social API.

![Stack](https://img.shields.io/badge/Vite-React_19-00B7C3) ![Lang](https://img.shields.io/badge/TypeScript-Tailwind-0b1118)

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build
npm run preview
```

## What this prototype includes

1. **Sample X mentions** about Microsoft Fabric (48 hand-authored posts, Sep 5–12 2026).
2. **Workload classification** — Pipelines, Data Engineering, Data Integration, OneLake, Data Warehouse, Real-Time Analytics / Eventstream, Data Science, Power BI / Fabric BI, Copilot / AI, Security & Governance, Other / General Fabric.
3. **Sentiment** per mention, rolled up per workload and overall (net score, mix, 7-day trend).
4. **Theme clustering** from configurable keyword definitions (`src/data/themes.ts`). Add or edit definitions to retarget the taxonomy without changing mention records.
5. **Suggested product-team actions** with effort/impact, owner hint, and related themes. Filterable by workload, high impact, or low effort.
6. **News & announcements** — official Microsoft plus community/press samples.
7. **Switchable aesthetic themes** — clickable prototypes for design review (see below).

The dashboard is desktop-first and responsive: header, KPI row, volume/sentiment charts, click-to-filter workload breakdown, theme explorer with sample mentions, actions, news, and a mention stream.

## Aesthetic themes

Use the **theme switcher** in the header (palette control) to re-skin the whole dashboard. Choice persists in `localStorage` (`fabric-pulse-theme`). The demo banner stays visible in every theme.

| Id | Name | Notes |
| --- | --- | --- |
| `pulse` | Pulse Teal | Baseline dark teal (current demo look) |
| `fluent` | Fluent Fabric | Neutrals + Fabric cyan brand moments |
| `paper` | Soft Paper | Calm light PM brief |
| `ops` | Dense Ops | Compact ops console, 12px dense lists, no glow |
| `glass` | Marketing Glass | Deep navy/purple glass chrome; matte data panes |
| `narrative` | Narrative Board | Light leadership slabs |
| `enterprise` | Light Enterprise | Teams / SharePoint adjacent |
| `radar` | Signal Radar | Experimental HUD (labeled Experimental) |

Tokens live as CSS variables on `[data-theme="…"]` in `src/index.css` (canvas/panel/elevated/line/ink/mute/accent via `teal`, pos/neg/neu, amber, official, chart grid). `ThemeProvider` + `useThemeColors()` keep Recharts and inline styles in sync.

## Architecture

| Path | Role |
| --- | --- |
| `src/types.ts` | Shared typed models and the `PulseDataProvider` contract |
| `src/data/provider.ts` | `MockPulseDataProvider` — swap this export for a live source later |
| `src/data/mentions.ts` | Sample mention corpus |
| `src/data/themes.ts` | Generalizable theme keyword definitions |
| `src/data/actions.ts` / `news.ts` | Suggested actions and news items |
| `src/lib/aggregate.ts` | Theme clustering, daily series, KPIs, workload rollups |
| `src/theme/` | Aesthetic theme registry, provider, and chart color helpers |

A future live provider should implement:

```ts
interface PulseDataProvider {
  getSnapshot(): Promise<PulseSnapshot>
}
```

and be exported as `pulseProvider`. Keep classification and theme clustering on the same snapshot shape so the UI does not change.

## Notes

- All handles, names, and post text are fictional samples.
- News URLs point at public section homepages, not specific live articles.
- Charts use Recharts. Icons use lucide-react.
- Aesthetic wireframe notes: `wireframe-ia-and-aesthetics.md` (design brief; layout IA concepts not all implemented yet).
