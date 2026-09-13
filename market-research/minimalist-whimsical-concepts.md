# Fabric Pulse — Minimalist · Whimsical · Artistic Concepts

**North star:** Scrap the dense dashboard. Spacious, human, gallery/editorial energy. Still useful for Fabric sentiment / Pipelines signal — without looking like analytics software.

**★ Top 2 for full UI reset:** 1 · The Weather Report · 2 · One Sentence + Receipts

---

## Anti-dashboard manifesto (hand to engineering)

1. **One idea per screen.** If you need a second chart, you need a second screen — or you don’t need it.
2. **Air is a feature.** Default to emptiness; earn every element.
3. **Numbers are guests, not hosts.** Lead with language, metaphor, or a single image; stats arrive on invitation.
4. **No KPI walls.** Four cards in a row is a failure mode, not a pattern.
5. **No chrome for chrome’s sake.** If the filter bar is louder than the insight, delete the bar.
6. **Sentiment is a mood, not a donut.** Color, motion, weather, type weight — not another pie.
7. **Fabric brand = atmosphere, not sticker.** One quiet accent, one artful motif — never logo spam or portal clone.
8. **Whimsy with a job.** Playfulness must accelerate understanding (weather, tide, pulse, postcard) — not decorate junk.
9. **Click goes deeper, not wider.** Drill into evidence; don’t open a second dashboard beside the first.
10. **If it looks like BI, start over.** Tableau energy is the anti-goal. Poster, gallery, letter, instrument — yes.

---

## Concepts (8)

### ★ 1. The Weather Report
**Visual metaphor:** Morning weather card for the Fabric estate — sky = mood, precipitation = volume, wind = velocity.
**First screen:** Vast soft sky gradient (calm lavender → storm indigo). Center: one large word (*Unsettled* / *Clear* / *Stormy*). Under it, one line: “Pipelines are loud today.” Tiny corner: date + “Open forecast.” No charts.
**Data (max 5):** Overall mood word · one workload called out · volume as rain intensity · Δ as wind note · single CTA into evidence.
**Type / color:** Editorial serif for the mood word; quiet sans for the line. Sky washes — no teal SOC. Fabric: a single thin cyan horizon line (lake/OneLake wink), not a logo.
**Why it wins:** Instantly anti-dashboard; PMs get the vibe in one breath; Pipelines/OneLake can be the “city” in the forecast.

### ★ 2. One Sentence + Receipts
**Visual metaphor:** A typed letter from Pulse to the PM — one honest sentence, then fold-out receipts.
**First screen:** Cream or soft gray field. Centered sentence in large type: “People are kinder about Copilot than about capacity this week.” Below: three small “receipt” tabs (tap to expand verbatims). Nothing else.
**Data (max 5):** Generated/templated sentence · 3 evidence receipts · optional workload chip in the sentence · tap → full quote.
**Type / color:** High-contrast book type (Fraunces / Source Serif + quiet Inter). Ink on paper. Fabric: sentence can name Fabric once; a small woven-thread ornament in the margin — not Microsoft chrome.
**Why it wins:** Maximum minimalism; forces prioritization; receipts keep it honest for engineering skeptics.

### 3. The Single Instrument
**Visual metaphor:** One musical instrument / metronome for the pulse — tempo = volume, tone = sentiment.
**First screen:** Centered abstract instrument (soft 3D or ink illustration). It breathes slowly (calm) or jitters (neg spike). Caption under: “Warehouse — slight dissonance.” Controls: listen (ambient), mute workloads as strings.
**Data (max 4):** Focal workload · mood/tempo · one caption · optional spike flash.
**Type / color:** Monochrome + one accent note. Motion > charts. Fabric: instrument silhouette vaguely “fabric weave” / loom — artful, not branded.

### 4. Gallery of Moods
**Visual metaphor:** Art gallery — each workload is a framed piece; walk the hall.
**First screen:** Long horizontal gallery (huge margins). Three frames visible: Pipelines (storm study), Copilot (soft light study), OneLake (still water). Labels under frames like museum cards: title, “net,” one quote fragment. Click frame → room with receipts.
**Data (max 5):** 3–5 frames · title · short wall text · one quote · enter room.
**Type / color:** Museum sans; warm white walls; art is abstract color fields driven by sentiment. Fabric: wall text uses Fabric product names as artwork titles only.

### 5. Postcard from the Edge
**Visual metaphor:** A postcard arriving from the community — front image, back short note.
**First screen:** Giant postcard, slightly tilted. Front: abstract art generated from week’s mood. Flip: handwritten-feel note (“Direct Lake got praise; shortcuts got the complaints.”) Stamp = date. Address line = “To: Fabric PM.”
**Data (max 4):** Front mood art · back sentence · stamp date · one “see photos” (mentions) link.
**Type / color:** Script-ish for note (tasteful, not comic); kraft / postal palette. Fabric: stamp illustration is a tiny OneLake/ripple — whimsical brand.

### 6. Tide Pool
**Visual metaphor:** Mentions as creatures in a tide pool; tide height = volume; water clarity = sentiment.
**First screen:** Soft top-down pool. A few glowing “creatures” (theme clusters) drift. Clear water vs murky. Tap a creature → it surfaces with a quote. Mostly empty water — air as water.
**Data (max 5):** Tide height · clarity · 3–5 creatures · quote on surface · workload as pool name.
**Type / color:** Aquatic pastels, not ops dark. Sparse labels. Fabric: pool edge pattern = subtle weave; no logo.

### 7. The Quiet Switchboard
**Visual metaphor:** Old hotel switchboard — but only three cords plugged in (today’s three truths).
**First screen:** Huge pale panel. Exactly three cords from “Signal” to “Meaning” with handwritten labels (e.g. Pipelines ↔ anger, Copilot ↔ curiosity, Capacity ↔ confusion). Unplugged jacks are empty air. Pull a cord → evidence drawer slides like a library card.
**Data (max 5):** Exactly 3 connections · labels · drawer with 2 quotes + suggested move.
**Type / color:** Warm gray, brass accents, ink labels. Whimsical industrial, not cyber. Fabric: brass plate engraved “Fabric Pulse” once, small.

### 8. Night Window
**Visual metaphor:** Looking out a tall window at the Fabric city at night — lights = mentions, glow color = mood.
**First screen:** Full-viewport window frame, vast negative space of “night.” A constellation of soft lights clustered by workload districts. No axes. Hover a district → whisper label + one word mood. Click → descend to street (quotes).
**Data (max 5):** District clusters · light density · glow hue · whisper label · street-level quotes.
**Type / color:** Deep velvet night (not teal-black SOC); warm window wood; cyan only as distant “lake” reflection. Fabric: city named Fabric; window mullions suggest weave.

---

## ★ Pitch hard — Top 2 for full UI reset

### Prototype A — **The Weather Report**
Ship a single-screen reset: sky + one mood word + one sentence + one CTA. Scrap KPI row, charts, workload bars, dual columns. Evidence is a second screen (“Forecast detail”), not a peer widget. Proves the manifesto in one PR. Fabric brand = horizon line + product names in copy only.

### Prototype B — **One Sentence + Receipts**
Even sparer: letter metaphor. Homepage is a sentence. Three receipt tabs. Zero charts on entry. Engineering implements template sentence from existing aggregates (top pos theme vs top neg theme) — no LLM required for v1. Best test of “are we brave enough?”

**Do not prototype:** theme switchers, War Room density, Estate Map chrome, Orchestra lanes — those still smell like dashboards.

**When user references arrive:** restyle Weather + Letter to match their art; keep the IA (one idea / receipts on demand).
