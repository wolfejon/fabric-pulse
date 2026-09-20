# Fabric Pulse

Demo social-listening and sentiment dashboard for **Microsoft Fabric** product teams.

> **Demo data — not a live X feed.** Mentions, themes, suggested actions, news, and fake ADO mappings are sample data served by a swappable `PulseDataProvider`. This prototype does not scrape X or call a live social API. Provider swap guide: [`docs/PROVIDERS.md`](docs/PROVIDERS.md).

## Product vision

Per-workload wants vs don’t-likes, optional cloud slices (Commercial / USGov / IL7 / IL6), and ADO covered-vs-gap mapping — see [`docs/PRODUCT-NORTH-STAR.md`](docs/PRODUCT-NORTH-STAR.md).

![Stack](https://img.shields.io/badge/Vite-React_19-00B7C3) ![Lang](https://img.shields.io/badge/TypeScript-Tailwind-0b1118) ![Viz](https://img.shields.io/badge/Nivo-Treemap-3ee0ea)

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

Refresh **live public** intelligence desks (RSS / Atom / public APIs → committed JSON):

```bash
npm run fetch:intelligence
```

See [`docs/INTELLIGENCE-FEEDS.md`](docs/INTELLIGENCE-FEEDS.md) for sources, desk separation, and the UNCLASSIFIED gov banner.

## What this prototype includes

1. **Sample X mentions** about Microsoft Fabric (58 hand-authored posts, Sep 5–12 2026), including Commercial / USGov / IL7 / IL6 cloud slices.
2. **Workload classification** — Pipelines, Data Engineering, Data Integration, OneLake, Data Warehouse, Real-Time Analytics / Eventstream, Data Science, Power BI / Fabric BI, Copilot / AI, Security & Governance, Other / General Fabric.
3. **Sentiment** per mention, rolled up per workload and overall (net score, mix, 7-day trend).
4. **Theme clustering** from configurable keyword definitions (`src/data/themes.ts`) with want / don’t-like polarity. Add or edit definitions to retarget the taxonomy without changing mention records.
5. **ADO plan mirror** — semester plans, work items, dependency requests, and theme ↔ coverage mappings (`src/data/ado.ts`).
6. **Suggested product-team actions** with effort/impact, owner hint, and related themes. Filterable by workload, high impact, or low effort.
7. **News & announcements** — official Microsoft plus community/press samples.
8. **Switchable aesthetic themes** — clickable prototypes for design review (see below).
9. **Atelier experiences** — Weather, Letter, Coverage, Newspaper, and other minimalist modes; Archive keeps old dense layouts.

Opening the app feels like a Weather Report art piece. Flip through atelier modes or open Archive for denser dashboard layouts.

## Experiences (UI reset)

Default landing is **Weather** — a minimalist sky mood piece, not a BI dashboard. The **atelier** mode menu lists Weather, Letter, and ten artistic modes. **Archive** keeps old dense layouts.

Shared atelier shell: Fabric wordmark, sparse **workload switcher** (All · Pipelines · Data Eng · OneLake · Warehouse · RTA · Power BI · Copilot), sparse **cloud pills** (All clouds · USGov · IL7 · IL6 · Commercial), beautiful mode menu, quiet demo honesty. Workload + cloud filter copy/aggregates only — no KPI wall.

Choice persists in `localStorage` (`fabric-pulse-layout-v4`). Atelier modes use their own art direction (theme switcher hidden).

### Try Coverage (Plan Mirror)

1. Open the mode menu → **Coverage**.
2. Pick **Pipelines** in the workload pills.
3. Pick **USGov** in the cloud pills.
4. See want / don’t-like themes with Covered / Partial / Gap cues; click a theme for linked fake ADO work items or “no plan yet.”

| Id | Mode | What you get |
| --- | --- | --- |
| `weather` | Weather (default) | Soft sky gradient, one giant mood word, one loud line, thin cyan horizon, **Open forecast** → sparse evidence + one suggested move |
| `letter` | Letter | Cream paper field, one editorial sentence (templated from top pos vs top neg theme), three expandable receipt chips |
| `fabric-horizon` | Horizon | Cyan→purple dusk shore; horizon line as the only chart |
| `weave-thread` | Weave Thread | Loom grid + one luminous teal thread / knot |
| `constellation` | Constellation | Purple-night sky; product/theme names as stars |
| `pulse-stamp` | Pulse Stamp | Oversized commemorative stamp on kraft |
| `lake-ripple` | Lake Ripple | Top-down lake ripples = mention waves |
| `stage-light` | Stage Light | Empty theater; one cyan spotlight on a sentence |
| `ink-wash` | Ink Wash | Rice-paper ink stroke + Fabric seal |
| `desk-globe` | Desk Globe | Single desk globe of the estate |
| `signal-lantern` | Signal Lantern | Paper lantern glow = pulse |
| `quiet-credits` | Quiet Credits | Cinematic end-credits scroll |
| Archive | Old dashboard | Deprecated escape hatch — Classic, Diagnosis Object, Spike Cinema, Ask the Pulse, War Room |

Legacy stored ids (`morning-brief`, `volume-pain`, `story-timeline`) still migrate inside Archive.

## Aesthetic themes

In **Archive** layouts, use the **theme switcher** in the header to re-skin the old dashboard. Choice persists in `localStorage` (`fabric-pulse-theme`). Weather and Letter ignore color themes and keep their own art direction.

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
| `src/data/provider.ts` | `MockPulseDataProvider` — swap this export for a live / internal source later |
| `docs/PROVIDERS.md` | How to replace mock with public or internal MS data |
| `src/data/mentions.ts` | Sample mention corpus (cloud-tagged) |
| `src/data/themes.ts` | Theme keyword definitions + polarity |
| `src/data/ado.ts` | Demo semester plans, work items, deps, theme mappings |
| `src/data/actions.ts` / `news.ts` | Suggested actions and news items |
| `src/data/intelligence.ts` + `intelligenceLive.ts` | Demo + live-public intelligence desks |
| `docs/INTELLIGENCE-FEEDS.md` | RSS/API sources and `npm run fetch:intelligence` |
| `src/lib/aggregate.ts` | Theme clustering, cloud/workload filters, KPIs, coverage helpers |
| `src/theme/` | Aesthetic theme registry, provider, and chart color helpers |
| `src/layout/` | Presentation layout registry, provider, brief/spike helpers |
| `src/components/layouts/` | Weather, Letter, atelier modes, plus Archive (Classic, Diagnosis Object, Spike Cinema, Ask the Pulse, War Room) |
| `src/lib/narrative.ts` | Mood words, loud lines, letter templates, forecast picks |

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
- Charts: Recharts (Classic / Spike Cinema) + **@nivo/treemap** (Diagnosis Object). Motion (`motion/react`) for layout transitions; **vaul** for the evidence sheet. Icons use lucide-react.
- Aesthetic / IA notes: `wireframe-ia-and-aesthetics.md` (design brief). Layout modes above are clickable prototypes.
