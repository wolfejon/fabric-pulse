# Fabric Pulse — Radical Presentation Concepts (10)

Not themes. Different IA, metaphor, interaction model, visual language. Kill the scroll wall of cards.

**★ Top 3 for clickable layout prototypes:** 1 Diagnosis Object · 2 Spike Cinema · 3 Ask the Pulse

---

### 1. The Diagnosis Object ★
**Metaphor:** One living organism on stage — the estate’s health as a single manipulable object (treemap/organism), not a report.
**Why PMs:** Forces prioritization; “what’s loud and bad?” is the first question, not the twelfth widget.
**First screen:** Near-fullscreen Volume×Pain organism (themes as organs, workloads as systems). Thin HUD: net, Δ7d, scope. Click organ → side sheet with evidence + one recommended move. No KPI row chrome.
**Kill:** KpiRow quadruplication, donut+bars stack, dual 2-col grids as peers of diagnosis.
**Risk:** Execs who want “four green numbers” feel lost without a Brief toggle.

### 2. Spike Cinema ★
**Metaphor:** Sentiment history as a film strip; spikes are episodes you scrub and watch.
**Why PMs:** Post-launch/outage reality is narrative (“what happened Tuesday?”), not average net.
**First screen:** Full-bleed timeline with episode cards docked under the playhead (title, driver themes, 3 verbatims, linked news). Transport controls: scrub, prev/next spike, “autoplay brief.” Mention stream only inside the episode dock.
**Kill:** Parallel news feed + mention stream as equal columns; static date chrome.
**Risk:** Quiet weeks feel empty; need a good “no episodes” editorial state.

### 3. Ask the Pulse ★
**Metaphor:** Briefing desk — you ask; the product answers with cited slides, not charts hunting.
**Why PMs:** Matches how people already work (“what’s angry in OneLake?”); lowers dashboard literacy tax.
**First screen:** Centered prompt with suggested asks (Rising risks · OneLake this week · Compare Pipelines vs Warehouse). Answer = short brief + 2–3 evidence cards + “Open canvas.” Chat rail optional; canvas is secondary.
**Kill:** Default scroll-through-everything; charts as homepage.
**Risk:** Feels gimmicky if answers aren’t grounded; v1 must be template/retrieval, not vibes.

### 4. Fabric Estate Map
**Metaphor:** Spatial map of the Fabric product continent — workloads as regions, themes as weather.
**Why PMs:** Matches org ownership (you “own” a region); cross-region storms are obvious.
**First screen:** Stylized map (Pipelines coast, OneLake lake, Power BI plateau…). Weather = sentiment/volume. Click region → provincial brief. Legend = intensity, not another chart.
**Kill:** WorkloadBreakdown as a sorted list of bars.
**Risk:** Cute map that fights data density; must stay scannable at a glance or dies in review.

### 5. War-Room Triage
**Metaphor:** Incident board — columns of severity, not analytics dashboards.
**Why PMs:** Exception attention; Signal that needs an owner beats wallpaper.
**First screen:** Kanban: Watching · Rising · Needs owner · In flight · Shipped/Recovering. Cards are themes/spikes with impact score. Right drawer = evidence + assign. Ambient net only in header.
**Kill:** SuggestedActions as read-only cards beside themes; duplicate sentiment surfaces.
**Risk:** Looks like “support tool” not “product intelligence”; brand carefully.

### 6. Editorial Leadership Magazine
**Metaphor:** Weekly magazine cover + feature well for leadership reviews.
**Why PMs:** Exportable story for stakeholders who won’t operate a dashboard.
**First screen:** Cover: big hed (“Capacity anger outruns Copilot praise”), dek, 3 pull-stats, hero sparkline. Below: feature articles (spike stories), sidebar “also noted.” Print/Share is first-class.
**Kill:** Dense ops chrome, demo-banner energy as primary, equal-weight widget grid.
**Risk:** Feels marketing-y / slow for daily operators — ship as Brief mode, not only mode.

### 7. PM Desk (stacked briefs)
**Metaphor:** Physical desk — trays of briefs you clear, not a webpage you scroll.
**Why PMs:** Personal agency; “my workloads” and “what I owe” over global soup.
**First screen:** Three trays: Rising on my scopes · Actions I own · Watching. Each card flips to evidence. Scope switcher is the desk label. Empty tray = calm, not dashed empty chart.
**Kill:** Global one-size homepage; news column competing for attention.
**Risk:** Needs identity/scopes early; weak in pure demo without “my area.”

### 8. Immersive Fabric Chamber
**Metaphor:** Step into a Fabric-branded chamber — product energy (violet/cyan glass, motion) as environment, data as exhibits.
**Why PMs:** Makes Pulse feel native to Fabric, not a third-party SOC bolted on.
**First screen:** Atmospheric hero with Fabric motion language; three exhibits float forward (Health object, This week’s story, Move queue). Hover deepens; click enters exhibit. Chrome minimal, brand maximal-but-disciplined.
**Kill:** Generic dark-teal ops skin; favicon-as-only-brand.
**Risk:** Landing-page disease — pretty, slow, unserious. Data exhibits must stay matte and fast.

### 9. Contrast Stage (dual world)
**Metaphor:** Split stage — Praise vs Pain as two competing casts.
**Why PMs:** Separates “how-to questions” from “angry blockers”; different responses (docs vs build).
**First screen:** Vertical split. Left Praise (green ink), right Pain (red ink). Shared theme bridge in the gutter when a theme appears on both sides. Intent facets baked into the metaphor.
**Kill:** Single mixed mention stream; sentiment donut as primary.
**Risk:** Binary flattens neutral/mixed; need a third “Questions” apron or toggle.

### 10. Signal Orchestra / Conductor
**Metaphor:** You’re the conductor — mute/solo workloads like tracks; mix the pulse.
**Why PMs:** Multi-workload ownership is a mix problem; compare is the default gesture.
**First screen:** Horizontal “tracks” (one per workload) as stacked volume/sentiment ribbons. Solo/mute, then drop into a focused chamber. Master bus = overall net.
**Kill:** Single composed chart + separate workload list; compare as afterthought.
**Risk:** Audio metaphors confuse non-musicians; UI must read as “lanes,” not DAW chrome.

---

## Prototype recommendation (layouts beside theme switcher)
1. **Diagnosis Object** — proves single-object IA; reuses Volume×Pain work.
2. **Spike Cinema** — proves narrative time as primary; differentiates hard from every BI dashboard.
3. **Ask the Pulse** — proves briefing-first; biggest interaction model shift, highest “wow / useful” if grounded.

**Do next if capacity:** War-Room Triage (ops credibility) or Estate Map (brand memorable). Magazine + Chamber as presentation skins over Brief, not separate apps.
