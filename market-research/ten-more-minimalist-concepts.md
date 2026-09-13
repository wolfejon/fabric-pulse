# Fabric Pulse — 10 More Minimalist Concepts

Alongside **Weather Report** and **One Sentence + Receipts**. Still: beautiful · minimal · whimsical/artistic · NOT dashboards.

**Shared chrome (every mode)**
- **Fabric mark:** small wordmark or weave-mark, top-left or bottom margin — one placement only. Brand color moments from Fabric identity: cyan `#00BCF2`, teal `#00A4A6` / lake blue, purple `#7A3FF2` / `#5C2D91` — used as atmosphere or a single accent, never a Fluent-SOC skin.
- **Workload switch:** sparse control — segmented pill or whisper dropdown: `All · Pipelines · Data Eng · OneLake · Warehouse · Real-Time · …` Changes the *subject* of the one idea on screen (copy, metaphor focus, receipts). Does **not** spawn KPI cards.

---

### 1. Fabric Horizon
**Metaphor:** Standing at the shore of OneLake — horizon line is the only chart.
**Branding:** Full-width cyan→purple dusk gradient sky; tiny Fabric wordmark etched into the sand/shore bar; “OneLake” can appear as the water’s name when that workload is selected.
**Workload switch:** Floating pill over the water, near bottom-center — almost part of the landscape.
**Data beats (≤5):** Horizon calm/choppy (sentiment) · water height (volume) · one shore sentence · optional distant “storm” spark for spike · CTA “Wade in” (receipts).
**Sketch:** Vast gradient. Thin bright cyan horizon. One line of type low on the shore. Nothing else.

### 2. Weave Thread
**Metaphor:** Fabric as literal cloth — one luminous thread is this week’s story.
**Branding:** Soft loom grid in purple/cyan hairlines; Fabric weave-mark as the loom’s badge, corner. Selected workload = which thread glows teal.
**Workload switch:** Thread labels along the left selvage (tiny); selecting re-glows that thread.
**Data beats (≤5):** Glowing thread path · one stitched sentence along the thread · knot = top theme · fray = negativity · pull knot → receipts.
**Sketch:** Mostly empty warp/weft. One animated teal thread. Sentence follows the curve.

### 3. Constellation Name
**Metaphor:** Night sky where product names are stars; the constellation is the week’s mood.
**Branding:** Deep purple-black field (Fabric purple night, not SOC black); cyan stars; Fabric wordmark as a quiet “observatory” label top-left.
**Workload switch:** Top-right star-picker (All = whole sky; workload = zoom to that constellation region).
**Data beats (≤5):** Constellation shape · brightest star (top theme) · color temperature (sentiment) · one whispered caption · click star → quote.
**Sketch:** Huge dark field, few stars, elegant connecting lines. Museum caption bottom.

### 4. Pulse Stamp
**Metaphor:** Official Fabric “postage” — a giant commemorative stamp for the week.
**Branding:** Stamp art uses Fabric cyan/purple geometric motif; perforated edge; “MICROSOFT FABRIC” microprint on the rim (authentic postal, not logo slap).
**Workload switch:** Sheet of stamps at bottom — only thumbnails; selecting brings one stamp full-bleed.
**Data beats (≤5):** Stamp illustration mood · denomination = volume · postmark date · one line under stamp · flip for receipts.
**Sketch:** One oversized stamp centered on kraft paper. Air everywhere.

### 5. Lake Ripple
**Metaphor:** Drop a stone — ripples are mention waves; clarity is sentiment.
**Branding:** Water is Fabric lake-cyan; purple reflection on ripple crests at dusk; wordmark as dock plaque.
**Workload switch:** Stones labeled by workload on the dock; toss one (or “All” = rain).
**Data beats (≤5):** Ripple count/intensity · water clarity · stone label · one floating leaf with a quote · still center = calm CTA.
**Sketch:** Top-down soft water, mostly empty. Few ripples. Dock edge with small switch stones.

### 6. Stage Light
**Metaphor:** Empty theater; one spotlight on a single truth.
**Branding:** Curtain hint in Fabric purple; cyan spotlight gel; Fabric wordmark on the proscenium arch, small.
**Workload switch:** “Cast list” as a vertical whisper menu in the wing (All / Pipelines / …) — choosing moves the spotlight.
**Data beats (≤5):** Spotlight subject (workload or theme) · one line of dialogue (insight) · applause/boo meter as soft glow only · playbill tab for receipts · date as showtime.
**Sketch:** Dark stage, vast negative space, one cone of cyan light, one sentence in the pool of light.

### 7. Ink Wash
**Metaphor:** Japanese ink landscape that “paints” sentiment — one brushstroke is the week.
**Branding:** Seal stamp (hanko) in corner = Fabric mark in purple/cyan vermilion-style square. Not Microsoft Fluent chrome.
**Workload switch:** Brush rack at margin — each brush a workload; active brush tip wet with teal.
**Data beats (≤5):** One ink stroke character (mood) · mountain/mist density (volume) · tiny colophon sentence · seal date · unroll scroll → receipts.
**Sketch:** White/rice paper field. One expressive stroke. Colophon and seal. Extreme air.

### 8. Desk Globe
**Metaphor:** A single desk globe of the Fabric estate — turn it, don’t dashboard it.
**Branding:** Globe oceans in lake-cyan; continents named for workloads; meridian ring engraved “Fabric Pulse”; purple night side.
**Workload switch:** Rotate globe (drag) or click a continent; “All” = full spin idle.
**Data beats (≤5):** Continent weather (mood tint) · one placard under globe · selected region name · tiny flag = rising theme · open atlas = receipts.
**Sketch:** Centered globe on a pale desk. Soft shadow. Placard with one sentence. No side panels.

### 9. Signal Lantern
**Metaphor:** A paper lantern whose glow color/brightness is the pulse.
**Branding:** Lantern paper printed with subtle Fabric geometric; hanging tag = Fabric wordmark; glow shifts cyan (calm) → purple (attention) → warm when mixed.
**Workload switch:** Row of tiny lanterns on a wire (festival); tap one to make it the hero lantern (others dim).
**Data beats (≤5):** Glow color · brightness (volume) · hanging tag sentence · breeze sway = velocity · open lantern → receipts inside.
**Sketch:** One large lantern in a dim quiet room. Wire of small lanterns as switch. Huge empty walls.

### 10. Quiet Credits
**Metaphor:** End-credits of a film — the week scrolls as beautiful typography, not charts.
**Branding:** Opening card “Microsoft Fabric” in proper wordmark treatment, then dissolve to “Pulse”; cyan underscore once; purple title card ambient.
**Workload switch:** Chapter markers in the credit scroll (Pipelines, OneLake…) — click jumps chapter; or a slim chapter index left, typographic only.
**Data beats (≤5):** Title card mood · credit lines (theme — role: villain/ally) · one pull-quote as “special thanks” · runtime = date range · pause → receipt still.
**Sketch:** Cinematic letterbox. Slow scroll of elegant type. Almost no UI chrome. Switch = chapters.

---

## Engineering notes
- Implement as **modes** beside Weather / Letter (same shell: Fabric mark + workload switch + Archive escape).
- Workload switch is a **shared shell control** — don’t reinvent per mode; only the metaphor focus changes.
- Max 5 visible data beats; receipts always a second beat / sheet.
- Brand colors: cyan/teal for water/light/calm; purple for night/curtain/attention; never both as competing KPI colors.

## Prototype priority (if not all 10)
1. **Fabric Horizon** — clearest Fabric-native brand moment  
2. **Weave Thread** — most “Fabric” metaphorically  
3. **Stage Light** — strongest one-idea discipline  
4. **Quiet Credits** — most artistic / least SaaS  
