# Fabric Pulse — Wireframe IA (all 16) + Aesthetic Systems

Maps onto current SPA sections: `DemoBanner` · `Header` · `KpiRow` · `SentimentCharts` · `WorkloadBreakdown` · `ThemeExplorer` · `SuggestedActions` · `NewsFeed` · `MentionStream` (+ shared `ui.tsx` primitives).

---

## Part A — Deepened concepts (wireframe-level IA)

### 1. Volume×Pain Command Surface ★
**Replaces / reshapes:** `SentimentCharts` + part of `WorkloadBreakdown` / `ThemeExplorer` as the primary canvas; KPIs stay thin above.

**Regions**
- Top: thin `KpiRow` (4 metrics, no duplicate net/donut)
- Main: full-width **treemap** (default grain = Theme; toggle Workload)
- Under: **ridgeline / sparkline strip** (velocity per top-N cells)
- Right drawer (xl): selected cell → keywords, net, sample mentions, 1 suggested action

**Interactions**
- Hover: tooltip volume / net / Δ7d / workloads[]
- Click cell: open drawer + set global filter (theme or workload)
- Toggle Size: volume | engagement; Color: net | %neg | velocity
- Breadcrumb: All → Theme cluster → subtheme (if nested later)

**States**
- Loading: skeleton treemap tiles + pulse shimmer
- Empty: “No themes in range” + clear filters CTA
- Error: inline banner on canvas (“Couldn’t load theme aggregates”) + Retry

**Data needs**
- Per theme/workload: volume, pos/neu/neg counts, net, Δ7d, engagement sum, workloads[]
- Extends `aggregate.ts` theme/workload rollups (already have volume/net/trend)

**Map:** New `VolumePainMap` component; demote stacked bars/donut to optional “Classic charts” disclosure or Compare mode only.

---

### 2. Action-Closing VoC Stack ★
**Replaces / reshapes:** Whole page becomes layered IA; today’s widgets become layer panes.

**Regions**
- Left sticky **layer nav** (icons+labels): Pulse · Themes · Context · Actions
- Main pane swaps by layer
- Bottom **persistent action strip** (3–5 cards for current filter) — always visible

**Layer contents**
- Pulse: KPIs + treemap or charts + spike timeline
- Themes: today’s `ThemeExplorer`
- Context: who/workload/role mix, Enterprise weight if available, news correlate
- Actions: enriched `SuggestedActions` with owner/status

**Interactions**
- Layer change preserves filters
- Click theme in Themes → Context pre-scoped; Actions filtered to related
- Keyboard 1–4 switch layers

**States**
- Loading: pane skeleton; strip shows last-known actions dimmed
- Empty Actions: “No open actions for this scope — generate from top theme?”
- Error: per-pane error, strip independent

**Data needs**
- Existing themes/actions/mentions/news
- New: action `owner`, `status`, `updatedAt`; optional account tier on mentions

**Map:** `App.tsx` shell → `VocStackLayout`; relocate existing sections into panes; keep `DemoBanner` above shell.

---

### 3. Morning Brief (not scroll wall)
**Replaces / reshapes:** Default route/home; current scroll becomes **Explore** mode.

**Regions**
- Hero **Brief card**: 3 lines (overall net + MoM, top risk, top opportunity)
- **Rising risks** list (5): theme, velocity, severity
- **Suggested moves** (3): from actions ranked impact×effort
- Footer links: Open Explore · Open Severity Inbox · Export brief

**Interactions**
- Risk row → Explore scoped to theme
- Move card → Action detail / assign
- Mode toggle in Header: Brief | Explore

**States**
- Loading: brief skeleton lines
- Empty risks: “Quiet window — no rising negative themes”
- Error: brief card error + still show last demo snapshot timestamp

**Data needs**
- Same aggregates; ranked “risk score” = f(volume, neg, velocity)
- Brief copy can be template-generated (no LLM required for v1)

**Map:** New `MorningBrief`; Header mode switch; Explore = today’s `App` stack.

---

### 4. Classification Triage Tabs
**Replaces / reshapes:** Vertical scroll → horizontal IA tabs.

**Regions**
- Tab bar under Header: Overview · Workload · Theme · Entity · Sentiment
- Tab bodies reuse existing widgets in focused combos

**Tab IA**
- Overview: KPIs + Volume×Pain or charts + spike strip
- Workload: `WorkloadBreakdown` + scoped charts + mentions
- Theme: `ThemeExplorer` + actions
- Entity: constellation (concept 14) + table
- Sentiment: mix KPIs + donut + intent facets + feed

**Interactions**
- Tab remembers scroll; filters global
- Deep link `?tab=theme&themeId=`

**States**
- Loading/empty/error per tab body
- Entity empty: “Entity extraction off in demo” + explanation

**Data needs**
- Existing + entity list (can stub from keyword/workload labels in demo)

**Map:** `App.tsx` tabs wrapper; don’t delete sections — rehome them.

---

### 5. Metric Tree Mode
**Replaces / reshapes:** Alternate Explore mode / tab — does not remove listening home.

**Regions**
- Canvas: horizontal/vertical **tree** (North Star → Themes → Initiatives/Actions)
- Right: node inspector (metrics, pinned mentions, logbook note)
- Top: tree picker (which North Star)

**Interactions**
- Click node: select + highlight path
- Drag optional later; v1 click-only
- “Pin report” attaches a scoped Pulse view

**States**
- Loading: tree skeleton
- Empty: “Define a North Star to map themes” + starter templates (Shortcut reliability, Copilot trust, …)
- Error: canvas banner

**Data needs**
- Manual or seeded edges: themeId → actionId; optional KPI ids
- MoM per node from aggregates

**Map:** New `MetricTreeView`; actions/themes as leaf nodes; Header mode Brief | Explore | Tree.

---

### 6. Spike-to-Why Brief ★
**Replaces / reshapes:** Extends `SentimentCharts` time series + Header sparkline behavior.

**Regions**
- Chart: volume/sentiment series with **spike markers**
- **Why panel** (right or bottom sheet): title, 3 driver bullets, themes, top 5 mentions, CTA “Filter feed to window”

**Interactions**
- Click spike → open Why panel for that window
- Hover spike → mini preview (Δ volume, top theme)
- “Apply window filter” sets date brush (needs date control — concept 7)

**States**
- Loading panel: skeleton bullets
- Empty (no spike): hide markers; help text “Spikes appear when volume > 2σ”
- Error: toast “Brief unavailable” ; markers still clickable to raw feed window

**Data needs**
- Daily series (exists); spike detection rule; windowed theme/mention query
- v1 brief = deterministic templates from top themes in window (LLM later)

**Map:** Enhance `SentimentCharts`; new `SpikeWhyPanel`; wire MentionStream window filter.

---

### 7. Global Filter Bar + Compare
**Replaces / reshapes:** Header clear-filter chip + workload-only model → first-class bar.

**Regions**
- Sticky bar under Header: Workload · Theme · Sentiment · Intent · Date range · Search
- **Compare** toggle → dual series / split KPI deltas
- Active chips row

**Interactions**
- Any control updates all subscribers (context provider already pattern)
- Compare: Period (WoW) or Segment (workload A vs B)
- Clear all; URL sync

**States**
- Loading: bar enabled; widgets skeleton
- Invalid compare: inline “Pick two segments”
- Error: non-blocking; show stale data badge

**Data needs**
- Date-bounded aggregates (provider must accept range — today static Sep 5–12)
- Dual aggregate queries for compare

**Map:** New `FilterBar`; Header loses ad-hoc clear chip; `PulseDataProvider` gains filter/compare params; date label becomes control.

---

### 8. Saved Scopes
**Depends on:** Filter bar (7).

**Regions**
- Scope switcher in Header (dropdown): All Fabric · My scopes · Team scopes
- Save dialog: name, visibility (personal/team)

**Interactions**
- Select scope → apply filter set
- Star current filters → save
- Manage: rename/delete

**States**
- Empty: “No saved scopes — star filters to create one”
- Error: “Couldn’t save” toast
- Loading: switcher disabled briefly

**Data needs**
- LocalStorage for demo; later user/team API
- Scope = serialized filter model

**Map:** `ScopeSwitcher` in Header; no change to section widgets beyond reacting to filters.

---

### 9. Chart → Feed → AI Toggle
**Replaces / reshapes:** Coupling between charts/themes and `MentionStream`; adds summary pane.

**Regions**
- On each aggregate card/chart: toolbar **Feed | Summary**
- Feed: impact-ranked mentions (reuse `MentionStream` item)
- Summary: cited bullets with mention chips

**Interactions**
- Feed sort: engagement × recency (default), newest, most negative
- Click citation chip → scroll/highlight mention
- Summary follow-up chips (v1 canned): “Show only Enterprise”, “Show questions”

**States**
- Feed empty: EmptyState already exists
- Summary loading: 3 skeleton lines
- Summary error: “Summary failed — view feed instead”

**Data needs**
- Mentions + engagement fields (exist); ranking function
- Summary v1 template from top themes/keywords in selection

**Map:** Toolbar on `SentimentCharts`, `ThemeExplorer`, treemap drawer; shared `EvidencePanel`.

---

### 10. Dynamic Cross-Filter Brushing
**Depends on:** Filter bar (7); enhances all charts.

**Regions**
- No new major region — behavior layer + chip tray in FilterBar

**Interactions**
- Click bar segment / treemap cell / workload row / donut slice → push filter chip
- Cmd-click multi-brush (optional v2)
- Esc / chip X clears

**States**
- Over-constrained empty: EmptyState “Nothing matches — loosen filters” + chip tray highlight
- Loading: brushed widgets grey-out then refresh

**Data needs**
- Same as filters; ensure all sections honor full filter model (today theme doesn’t filter actions/news — **fix asymmetry**)

**Map:** Unify filter subscriptions in provider; WorkloadBreakdown/ThemeExplorer/Charts emit brush events.

---

### 11. Impact-Weighted Theme Board
**Replaces / reshapes:** Default ranking inside `ThemeExplorer` (and Morning Brief risks).

**Regions**
- Table/rail: rank · theme · impact score · volume · net · Δ7d · workloads
- Expand row: keywords, samples, linked action

**Interactions**
- Sort: impact (default) | volume | velocity | net
- Weight toggle: Equal | Enterprise-weighted (demo: role/handle heuristic or stub weight)
- Row click = theme filter

**States**
- Loading: table skeleton rows
- Empty: dashed empty
- Error: section error banner

**Data needs**
- impact = volume × negShare × weight; weight field on mention or theme (stub OK)

**Map:** Refactor `ThemeExplorer` list to board; detail pane stays.

---

### 12. Severity Inbox
**Replaces / reshapes:** New primary entry beside Brief; not a chart.

**Regions**
- Left: list “Needs owner” (spike, rising neg theme, unanswered high-engagement neg)
- Right: evidence (chart snippet, mentions, suggested action) + Assign

**Interactions**
- Claim / assign / snooze / dismiss
- “Create work item” (deep link stub)
- Duplicate suggestion if similar open item

**States**
- Empty: calm illustration “All clear for this scope”
- Loading: list skeletons
- Error: retry on list

**Data needs**
- Derived inbox items from spikes + theme velocity + action linkage
- assignee, status local state for demo

**Map:** New `SeverityInbox`; Header badge count; can live as Brief module or tab.

---

### 13. News ↔ Sentiment Correlate
**Replaces / reshapes:** Relationship between `NewsFeed` and `SentimentCharts`.

**Regions**
- Timeline overlays **event diamonds** (Official / Community / Press)
- Popover: headline, pre/post net Δ, top themes in window
- Optional split view: news list filtered to events near spikes

**Interactions**
- Click diamond → popover + optional brush window
- From NewsFeed row → “Show on timeline”

**States**
- No news in range: hide overlay; toggle off
- Error fetching news: charts still work; overlay disabled badge

**Data needs**
- News timestamps (have day); windowed sentiment before/after (±48h)
- Join logic in aggregate helper

**Map:** Extend `SentimentCharts` + small API on `NewsFeed` rows.

---

### 14. Entity Constellation
**Replaces / reshapes:** New body for Entity tab (4) or alternate to workload bars.

**Regions**
- Center: bubble map (entity name, size volume, color net)
- Side: table (entity, type, volume, net, Δ) + CSV export stub
- Type filters: Product · Feature · Competitor · Person

**Interactions**
- Click bubble → scope filter `entity=`
- Brush linked themes

**States**
- Empty: “No entities extracted”
- Loading: soft bubble placeholders
- Error: fall back to table only

**Data needs**
- Entity extraction; demo stub from workload labels + theme keywords + competitor names in news

**Map:** New `EntityConstellation`; catalog seed data.

---

### 15. Intent × Emotion Facets
**Replaces / reshapes:** Filter bar facets + MentionStream ranking context.

**Regions**
- Two chip rows: Intent (complaint/praise/question/request) · Emotion (anger/joy/confusion/… subset)
- All widgets respond

**Interactions**
- Multi-select chips; clears via bar
- Mentions show intent/emotion pills

**States**
- Unclassified % banner: “32% mentions lack intent — showing classified only” toggle
- Empty combo: standard EmptyState

**Data needs**
- intent/emotion on mentions (demo: rule/keyword stub or seeded fields)

**Map:** Extend mention type + `FilterBar` + pills in `MentionStream`.

---

### 16. Close-the-Loop Action Cards
**Replaces / reshapes:** `SuggestedActions` cards → operational objects.

**Regions**
- Same card grid + filters (All / High impact / Low effort)
- Card fields: owner avatar, status (New/Doing/Shipped), links, **recovery sparkline** (theme net since open)
- Detail drawer: evidence themes, citations, Create work item

**Interactions**
- Assign / status change (local demo)
- Create work item → opens URL template
- Filter by status; sort by recovery (worsening first)

**States**
- Empty: generate CTA from top theme
- Loading: cards skeleton
- Error on save: toast, keep prior status

**Data needs**
- Extend action model: owner, status, createdAt, workItemUrl, themeId[]
- Time series for theme since createdAt

**Map:** Evolve `SuggestedActions.tsx` + `actions.ts`; recovery via `aggregate.ts`.

---

## Part B — Aesthetic systems (7)

Token sketch = starting CSS variables for theme prototypes (dark unless noted). Pos/Neg keep accessibility contrast on each surface.

### A. Soft Paper ★ (flag for prototype)
**Vibe:** Calm Linear/Intercom — PM brief, not SOC.  
**Tokens:** bg `#F7F6F3` · surface `#FFFFFF` · elevated `#EEF0F2` · line `#E2E5E9` · text `#1B1F24` · mute `#5C6570` · accent `#2563EB` · pos `#0F9F6E` · neg `#E11D48` · warn `#D97706`  
**Type:** Inter / Segoe UI Variable; 14px body; generous 20–24px titles; sparse meta 12px.  
**Charts:** Thin strokes, no grid glow; area fills 8–12% opacity; spike markers solid ink.  
**Pairs best with:** 3 Morning Brief, 2 VoC Stack, 16 Close-the-Loop, 12 Severity Inbox.  
**Fabric note:** Teal only in Pulse mark; rest semantic blue.

### B. Fluent Fabric Accent ★ (flag for prototype)
**Vibe:** Sits beside Fabric portal — neutrals + Fabric teal as brand moments only.  
**Tokens:** bg `#0F1115` · surface `#1A1D24` · elevated `#22262F` · line `#2E3440` · text `#F3F4F6` · mute `#9AA3B2` · accent `#00BCF2` (Fabric-ish cyan) / bright `#50E6FF` · pos `#3DBF8C` · neg `#F15B67` · official `#6EA8FF`  
**Type:** Segoe UI; slightly tighter 13px meta; title Semibold.  
**Charts:** Fluent-like rounded tooltips; teal used for volume series only; sentiment stays pos/neg semantic.  
**Pairs best with:** 7 Filter+Compare, 1 Volume×Pain, 6 Spike-to-Why, 10 Brushing.  
**Closest evolution of current dark teal — but quieter chrome.**

### C. Fabric Marketing Glass
**Vibe:** Product-site energy (purple/violet gradients, soft glass) without becoming a landing page.  
**Tokens:** bg `#0B0620` · surface `#16102Ccc` (glass) · elevated `#1E1638` · line `#3D2A6D66` · text `#F5F0FF` · mute `#A89BC8` · accent `#A855F7` · accent2 `#6366F1` · pos `#34D399` · neg `#FB7185` · glow gradient `#7C3AED→#00BCF2`  
**Type:** Segoe UI Display for hero brief only; UI still Segoe Regular — restrain marketing type to 1 place.  
**Charts:** Soft glow under areas; glass tooltips; avoid full-bleed gradient backgrounds behind data.  
**Pairs best with:** 3 Morning Brief hero, 14 Entity Constellation, 5 Metric Tree.  
**Risk:** Keep data panes matte; gradient only in header/hero chrome.

### D. Dense Ops Console ★ (flag for prototype)
**Vibe:** High information, low chrome — Bloomberg-adjacent for PMs who live here.  
**Tokens:** bg `#0A0C0F` · surface `#12151A` · elevated `#181C22` · line `#2A3038` · text `#E6EDF3` · mute `#7D8B99` · accent `#E8B84A` (attention, not brand) · pos `#3DDC97` · neg `#FF6B7A` · grid `#1A222C`  
**Type:** IBM Plex Sans / Segoe Mono for numbers; 12px body in tables; 11px meta OK.  
**Charts:** Hairlines, dense ticks, sparklines in cells; no radial glows; maximize data-ink.  
**Pairs best with:** 11 Impact Board, 12 Severity Inbox, 7 Compare, 4 Triage Tabs, 1 Treemap.  
**Fabric note:** Brand mark tiny; teal optional on live indicator only.

### E. Narrative Leadership Board
**Vibe:** Exportable Amplitude Notebook / Pendo — prose slabs + charts for reviews.  
**Tokens:** bg `#F5F7FA` · surface `#FFFFFF` · elevated `#E8EEF5` · line `#D0D7E2` · text `#0F172A` · mute `#64748B` · accent `#4F46E5` · pos `#059669` · neg `#DC2626` · slab tint `#EEF2FF`  
**Type:** Segoe UI; 16–18px narrative body; clear H2 section titles; comfortable measure (~68ch).  
**Charts:** Large, few; captions under charts; annotation callouts.  
**Pairs best with:** 3 Morning Brief, 5 Metric Tree, 6 Spike-to-Why (export), 13 News Correlate.  
**Export:** Page breaks between slabs → PPT/PDF later.

### F. Light Enterprise (Teams/SharePoint adjacent)
**Vibe:** Familiar Microsoft work surface — safe for exec screenshare.  
**Tokens:** bg `#F5F5F5` · surface `#FFFFFF` · elevated `#FAFAFA` · line `#E0E0E0` · text `#242424` · mute `#616161` · accent `#5B5FC7` (Teams-ish) · pos `#0D9E6D` · neg `#C4314B` · brand teal `#00A4A6` sparingly  
**Type:** Segoe UI; Fluent corner radii (4–8px); standard density.  
**Charts:** Fluent chart colors; modest shadows; no glow grid.  
**Pairs best with:** 7 Filter bar, 8 Saved Scopes, 16 Actions, 4 Tabs.  
**Use when:** stakeholder demos / mixed dark-light org preference.

### G. Bold Experimental — Signal Radar
**Vibe:** Radar/sonar metaphor — polar attention, not another card grid.  
**Tokens:** bg `#030712` · surface `#0B1224` · elevated `#111827` · line `#1E3A5F` · text `#E0F2FE` · mute `#7DD3FC99` · accent `#22D3EE` · secondary `#F472B6` · pos `#4ADE80` · neg `#F43F5E` · sweep `#22D3EE22`  
**Type:** Space Grotesk or Segoe for UI + monospace readouts; tight HUD labels.  
**Charts:** Polar/radar for workload mix; circular spike ring; feed as scrolling “pings.”  
**Pairs best with:** 14 Entity Constellation, 1 Volume×Pain (radial variant), 12 Inbox as “contacts.”  
**Use as:** optional theme / marketing moment — not default shipping UI.

---

## Flag 3 aesthetics to ship as clickable theme prototypes first
1. **B Fluent Fabric Accent** — safest evolution of current dark demo; proves token theming.  
2. **A Soft Paper** — strongest contrast test; sells Brief + VoC Stack.  
3. **D Dense Ops Console** — proves density/table IA for Impact Board + Inbox.

(Then F Light Enterprise if stakeholder demos need it; C/E/G as secondary.)

---

## Suggested implementation notes for theme prototypes (no code here)
- Lift existing `@theme` tokens in `src/index.css` to named themes: `paper` | `fluent` | `ops` | …
- Keep semantic `pos`/`neg`/`amber`/`official` keys stable so components don’t branch.
- Pair theme switcher next to Demo badge in Header for clickable review.
