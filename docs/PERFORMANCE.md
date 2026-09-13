# Fabric Pulse — Performance brief

Audit date: 2026-09-13. Facts from `npm run build`, on-disk sizes, and source inspection. Not vibes.

---

## Current state (honest)

| Metric | Value |
|--------|-------|
| Production JS | **1 chunk**: `dist/assets/index-*.js` **2,020.94 kB** (505.58 kB gzip) |
| Production CSS | **92.57 kB** (15.54 kB gzip) |
| Vite warning | Chunk > 500 kB after minify — suggests dynamic `import()` / code-splitting |
| Code-splitting | **None**. No `React.lazy`, no dynamic `import()` in `src/`. `vite.config.ts` has no manualChunks. |
| Corpus on disk | `src/data/generated/corpus.json` **875,821 bytes (~856 KiB)**; gzip ≈ **142 KiB** |
| Corpus contents | **2000** mentions, **44** themeDefinitions, **52** news, plus actions / ADO / mappings |
| Default layout | `weather` (`DEFAULT_LAYOUT_ID`) |

The app ships a single monolith: atelier + archive dashboards + chart libs + motion + full corpus JSON all parse on first load, even if the user never opens Archive.

---

## 1. Bundle

```
✓ 3350 modules transformed
dist/index.html                     1.46 kB │ gzip:   0.68 kB
dist/assets/index-*.css            92.57 kB │ gzip:  15.54 kB
dist/assets/index-*.js          2,020.94 kB │ gzip: 505.58 kB
(!) Some chunks are larger than 500 kB after minification.
```

**Heavy deps (package.json):**

| Package | Role | Pulled by (static) |
|---------|------|--------------------|
| `recharts` ^3.10.1 | Area/line charts | `Header.tsx`, `SentimentCharts.tsx`, `StoryTimeline.tsx` |
| `@nivo/treemap` + `@nivo/core` ^0.99 | Treemap | `VolumePainMap.tsx` (archive `diagnosis-object`) |
| `motion` ^13.2.0 | Atelier + archive motion | Many atelier layouts + `LetterReceipts`, `VolumePainMap`, `ReceiptsPanel`, … |
| Corpus JSON | Demo data | Eager `import corpus from './generated/corpus.json'` in `provider.ts` (+ re-exports via `mentions.ts`, `themes.ts`, `news.ts`, `actions.ts`, `ado.ts` — Vite dedupes module, still one embed) |

`App.tsx` **statically imports** every atelier layout and every archive layout (`ClassicDashboard`, `VolumePainMap`, `StoryTimeline`, `Header`, …). Archive chart code is therefore in the **initial** chunk whether or not Archive is opened.

First-mention text from `corpus.json` is present in the built JS → corpus is **embedded**, not fetched at runtime.

---

## 2. Corpus loading

**File:** `src/data/provider.ts`

```ts
import corpus from './generated/corpus.json'
const RAW_MENTIONS = corpus.mentions as Mention[]
export const CORPUS_MENTIONS = enrichMentionsWithProvenance(RAW_MENTIONS)
```

| Question | Answer |
|----------|--------|
| Eager import vs fetch? | **Eager static import** — parsed with the main module graph |
| Lazy / `fetch('/corpus.json')`? | **No** |
| All 2000 mentions in memory? | **Yes** — `MockPulseDataProvider.getSnapshot()` returns `mentions: CORPUS_MENTIONS` (full array) after a cosmetic `delay(280)` |
| Client-side filter? | **Yes** — `App.tsx` `useMemo` filters/re-aggregates from `snapshot.mentions` on every workload / cloud / source / theme change |

Startup cost: parse ~2 MB JS (includes ~856 KiB JSON text) + hold ~2000 mention objects + derived theme `mentionIds` arrays in heap for the session.

---

## 3. Motion / transitions

Library: **`motion`** (`motion/react`), not separate `framer-motion` package name (same family).

### Where used (high-signal)

| Surface | Mechanism | Durations (s) | Reduced-motion |
|---------|-----------|---------------|----------------|
| **Dossier** folder open / close | `AnimatePresence` + `motion.div`; `rotateY` / scale | Folder: **0.45** (reduced **0.12**); page flip: **0.38** (reduced **0.1**) | **`useReducedMotion()`** — only atelier layout that does |
| **Dossier** page flip | 3D `rotateY` + `x`, `preserve-3d`, origin left | 0.38 / 0.1 | Yes (above) |
| **Newspaper** story ↔ briefing | `AnimatePresence mode="wait"`; slide `x` / `y` | Story panel **0.32**; edition swap **0.35** | **No** JS hook |
| Mode switch (`ModeSwitcher`) | Instant layout remount in `App`; Tailwind `transition` on chevrons only | CSS default ~**150ms** rotate | N/A (no enter animation between modes) |
| Atelier “hero” modes (Horizon, Weave, Lake, Stage, …) | `AnimatePresence mode="wait"` opacity fades; many **omit** explicit `duration` (Motion default ~0.3s) | Implicit / unset | CSS keyframes gated; **JS motion not gated** |
| **LetterReceipts** | Fade + **`height: 'auto'`** expand | Enter **0.5**; expand **0.28** | No |
| **WeatherReport** | Opacity / y | **0.45** / **0.40** | CSS drift only |
| **Coverage** / **CompetitorBackPage** / **ReceiptsPanel** | Fade / slide | 0.28–0.32; ReceiptsPanel unset duration | No |
| CSS atelier FX | `atelier-draw` 2.2–2.8s, twinkle/ripple/sway loops, credits **48s** scroll | Long ambient | `@media (prefers-reduced-motion: reduce)` disables listed classes |
| Theme / cards | `body` / `.pulse-card` color transitions | **180ms** | Not specially disabled |

### Layout thrash risks

1. **LetterReceipts** `animate={{ height: 'auto' }}` — forces layout measurement each open/close.
2. **Dossier** page flip with `rotateY` + `transformStyle: 'preserve-3d'` — compositor-friendly if only transforms/opacity, but paired with full page remount via `mode="wait"` (exit then enter).
3. **Newspaper** / atelier `mode="wait"` — serializes exit+enter (~2× duration perceived latency).
4. Infinite CSS animations (ripple, twinkle, lantern sway, credits scroll) — cheap alone; stack with Motion on low-end devices.
5. No shared-element / `layout` prop usage found — good (avoids Motion layout projection thrash). Mode changes still **hard-cut remount** the entire experience tree.

Crisp target for MVP UX: **150–200ms** opacity/transform. Current hero/folder paths are often **320–500ms**, and Dossier open is **450ms**.

---

## 4. Re-render / main-thread filter pipeline

`App.tsx` (simplified):

```ts
const view = useMemo(() => {
  const sourceScoped = filterByEnabledSources(snapshot.mentions, enabledSourceIds)
  const scopedMentions = sourceScoped.filter(/* workload + cloud */)
  const derived = viewFromMentions(scopedMentions, snapshot.themeDefinitions) // clusterThemes + daily + workloads + kpis
  const mentions = filterMentions(sourceScoped, workload, selectedTheme, cloud, enabledSourceIds)
  ...
}, [snapshot, themeId, workload, cloud, enabledSourceIds])
```

| Fact | Detail |
|------|--------|
| Sync on main thread? | **Yes** — `useMemo` runs during render; no worker, no `startTransition` |
| Work per toggle | Re-filter ≤2000 mentions, then `clusterThemes`: **44 themes × mentions × ~4.3 keywords** with `text.toLowerCase()` + `includes` per mention |
| Rough cost | Python stand-in of keyword clustering ≈ **~130 ms** per full pass on 2000×44 (order-of-magnitude; JS similar ballpark on mid laptops) |
| Extra work | `filterMentions` may use `theme.mentionIds.includes(id)` (**O(n)** per mention); `filteredSnapshot` rebuilds another source-filtered mention array |
| UI impact | Entire active layout re-renders with new `view` / `snapshot` props; archive `MentionStream` maps **all** filtered mentions to DOM (scroll `max-h-[520px]`, **no virtualization**) |

Toggling sources or workload **does** recompute aggregation synchronously on the main thread. At 2k rows this is “demo-tolerable” on desktop; it will hitch on lower-end devices and will not scale.

---

## 5. Archive charts when user never opens Archive

| Library | Used only in Archive? | In initial bundle today? |
|---------|----------------------|---------------------------|
| Recharts | Yes (`Header`, `SentimentCharts`←classic/ask, `StoryTimeline`) | **Yes** — static import from `App.tsx` |
| Nivo treemap | Yes (`VolumePainMap`) | **Yes** |
| `MentionStream` full list | Classic / Ask archive paths | **Yes** (module graph) |

**Impact if user stays in Atelier forever:** still downloads and parses Recharts + Nivo + archive layout modules. That is pure dead weight on the critical path until code-split.

---

## Top 5 risks

1. **Monolithic ~2.0 MB JS (≈506 kB gzip)** — no route/layout splitting; atelier-first users pay for Archive charts + every mode.
2. **Eager corpus JSON (~856 KiB) inside the main chunk** — blocks parse; all 2000 mentions resident for the session.
3. **Synchronous `viewFromMentions` / `clusterThemes` on every filter toggle** — main-thread keyword scan over the full (scoped) corpus; no transition/deferred update.
4. **Unvirtualized mention lists** (`MentionStream` maps entire filtered set) — DOM cost when Archive classic is open or filters widen.
5. **Transition inconsistency / sluggishness** — many Motion paths 320–500ms + `mode="wait"`; only Dossier honors `useReducedMotion`; LetterReceipts `height: 'auto'` layout animation.

---

## Recommended MVP perf plan

Prioritized for a demo that feels crisp without a rewrite.

### P0 — Bundle shape (biggest win)

1. **Code-split Atelier vs Archive**
   - `React.lazy(() => import('./layouts/ClassicDashboard'))` (and WarRoom, StoryTimeline, VolumePainMap, AskThePulse) behind `isArchiveLayout(layoutId)`.
   - Lazy `Header` / anything that imports `recharts`; lazy `VolumePainMap` for `@nivo/*`.
2. **Code-split atelier modes** (optional follow-on)
   - Dynamic import per `layoutId` from a map so switching to Newspaper doesn’t require LakeRipple’s module up front (keep a small shared shell).
3. **Manual chunks** in Vite for `motion`, `recharts`, `nivo` once dynamic imports exist — verify with build output that Archive libs are absent from the weather entry path.

### P1 — Corpus

4. **Lazy corpus**: move JSON to `public/demo/corpus.json` (or `import()` dynamic); `MockPulseDataProvider.getSnapshot()` `fetch` + parse; show existing loading screen until ready.
5. Keep enrichment (`enrichMentionsWithProvenance`) after fetch; avoid duplicating static imports in `mentions.ts` / `themes.ts` / etc. (single loader module).

### P2 — Interaction jank

6. Wrap filter-driven updates in `startTransition` (or debounce source toggles) so input stays responsive while `clusterThemes` runs.
7. Precompute theme keyword match bitsets / inverted index at snapshot load (mention → themeIds) so toggles only filter + cheap aggregates, not 44× full-text scans.
8. Replace `mentionIds.includes` with `Set` lookups everywhere in the hot path.

### P3 — Lists & motion crispness

9. **Virtualize** `MentionStream` (and any atelier receipt list that can grow large) — window ~20–30 rows.
10. **Normalize Motion** to **150–200ms** opacity/transform; prefer `mode="sync"` or crossfade over `wait` for mode-local panels; drop `height: 'auto'` (use max-height or CSS grid).
11. Call **`useReducedMotion()`** (or a tiny shared hook) in Newspaper + shared atelier shell; skip 3D flips when reduced.
12. Cap ambient CSS loops; ensure reduced-motion media query remains the backstop.

### Out of scope for MVP (but noted)

- Web Worker for clustering
- Dropping one of Recharts/Nivo entirely (product choice)
- SSR / streaming

---

## Verification checklist

After changes, re-run:

```bash
npm run build
# Expect: multiple JS assets; atelier entry << 2 MB; archive/recharts/nivo in separate chunks
ls -la dist/assets/
# Optional: open Network tab — weather load should not request nivo/recharts chunks
```

Confirm:

- [ ] Initial JS gzip well under ~250–300 kB if corpus is fetched separately (stretch); or corpus chunk deferred after first paint
- [ ] Toggling workload does not block typing/clicks for >50ms on a mid laptop (Performance panel)
- [ ] `prefers-reduced-motion: reduce` short-circuits Dossier + Newspaper motion
- [ ] Classic MentionStream does not create 2000 DOM nodes

---

## Source map (audit anchors)

| Topic | Path |
|-------|------|
| Filter pipeline | `src/App.tsx` (`view` `useMemo`) |
| Aggregation | `src/lib/aggregate.ts` (`viewFromMentions`, `clusterThemes`) |
| Corpus provider | `src/data/provider.ts` |
| Corpus file | `src/data/generated/corpus.json` |
| Recharts | `src/components/Header.tsx`, `SentimentCharts.tsx`, `layouts/StoryTimeline.tsx` |
| Nivo | `src/components/layouts/VolumePainMap.tsx` |
| Dossier motion | `src/components/layouts/atelier/Dossier.tsx` |
| Newspaper motion | `src/components/layouts/atelier/Newspaper.tsx` |
| Mode switch | `src/components/ModeSwitcher.tsx` (no page transition) |
| CSS motion / a11y | `src/index.css` (`prefers-reduced-motion` blocks ~410, ~554, ~635) |
