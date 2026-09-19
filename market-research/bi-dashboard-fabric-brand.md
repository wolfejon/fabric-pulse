# BI Dashboard — Fabric / Power BI portal branding upgrades

Keep it **exec analytics** (not atelier). Goal: feel native next to Fabric portal + Power BI service.

Current baseline (`BiDashboard.tsx` + `layout-shots/bi-dashboard.png`): light gray canvas, white cards, Segoe-ish sans, teal `#00A4A6` / cyan `#00BCF2` accents, generic “Fabric Pulse” wordmark, pill workload nav, KPI row + composed chart + donut. Reads clean but **generic SaaS**, not Microsoft product chrome.

---

## 10 concrete upgrades

### 1. Fabric product lockup (header)
**Change:** Replace plain “Fabric Pulse” text with a **Fabric-style lockup**: small Fabric hex/bloom mark (or official glyph if licensed) + “Fabric” in Segoe UI Semibold + “Pulse” in Semibold with a thin cyan underscore under Fabric (portal pattern). Subline: `Analytics · Microsoft Fabric`.
**Why:** Instant product-family recognition; Power BI/Fabric apps lead with mark + product name, not a startup wordmark.

### 2. Power BI report chrome bar
**Change:** Add a slim **report header** under app nav: left = report title + “Published to workspace” metaphor; right = fake PBI actions as quiet icons (Refresh, Filter, Full screen) — decorative OK in demo.
**Why:** BI Dashboard should feel like a **report in the Power BI service**, not a custom marketing page.

### 3. Fluent 2 token pass
**Change:** Map tokens to Fluent/Fabric neutrals: canvas `#f5f5f5`, card `#fff`, stroke `#e0e0e0`, text `#242424` / `#616161`, brand `#117865`→ prefer Fabric teal `#00A4A6` + cyan `#00BCF2` + purple `#7452A8` / `#7A3FF2` for **selection only**. Corner radius **4–8px** (Fluent), not oversized 16px pills everywhere.
**Why:** Current looks “Tailwind generic”; Fluent radii + gray ramp = Microsoft.

### 4. Segoe UI hierarchy (optical)
**Change:** Enforce Segoe UI / Segoe UI Variable: page title 28–32 Semibold, section 12–14 caps tracking for “FABRIC PULSE · ANALYTICS”, KPI values 28–36 Semibold tabular nums, meta 12 Regular. Kill mixed Inter-if-present.
**Why:** Power BI + Fabric portal typography is Segoe; that’s half the brand.

### 5. Card treatment = PBI visual containers
**Change:** Cards get **1px `#e1dfdd` border**, light shadow `0 0.3px 0.9px rgba(0,0,0,.1)`, title row with **visual header** (title left, ellipsis menu right). Optional subtle top brand stripe (2px cyan) only on the lead KPI or report title card — not on every card.
**Why:** Matches Power BI visual chrome; stripe used once = brand, used everywhere = noise.

### 6. Filter pane affordance
**Change:** Right-edge or collapsible **Filters** rail (even if demo-static): Workload, Cloud, Date — styled like PBI filter pane (checkbox lists, “Clear filters”). Move “All workloads / All clouds” chips into that pane.
**Why:** Execs know that pattern; removes orphan chip buttons that feel custom-app.

### 7. Chart color system (Fabric categorical)
**Change:** Adopt a fixed Fabric-friendly series palette: volume area `#00BCF2`, pos `#0d9e6d` / Fabric green, neg `#c4314b`, neu `#a0aeb2`; gridlines `#ebebeb`; tooltip Fluent white + border. Avoid random lucide-teal icons competing with data ink.
**Why:** Power BI themes ship categorical brands; consistency beats decorative icon teal.

### 8. KPI “scorecard” visuals
**Change:** Restyle KPI cards as **PBI scorecards**: value + delta with up/down chevrons in semantic colors; sparkline optional in-card; label above value (Fluent caption). Icon demoted or removed — data first.
**Why:** Current icon-forward KPIs feel startup dashboard; scorecards feel Microsoft BI.

### 9. Navigation = Fabric hub style
**Change:** Workload switcher → **underline tabs** or left **Fabric hub list** (selected = purple/cyan left bar + quiet fill `#f0f6ff`), not candy pills. Cloud boundary as secondary dropdown “Environment” like Fabric capacity/workspace switcher.
**Why:** Pills read consumer; Fabric portal uses list/rail + subdued selection.

### 10. Workspace + sensitivity chrome
**Change:** Footer or header meta: `Workspace: Fabric Pulse Demo` · `Sensitivity: General` · `Refreshed: …` in 11–12px mute — classic Power BI service footer cues. Demo disclaimer can sit here instead of floating center top.
**Why:** Tiny institutional chrome does more branding than another accent color.

### Bonus (if capacity)
**11. Dark “Fabric portal night” theme toggle** — `#1f1f1f` canvas, `#292929` cards, cyan accents (Fabric dark shell).  
**12. Official dashboard badge** — “Certified” / “Org endorsed” pill (Amplitude-style but Fluent styled) for exec trust.

---

## Implement first (opinionated)
1. Lockup (#1)  
2. Fluent tokens + Segoe (#3–4)  
3. PBI card chrome + scorecards (#5, #8)  
4. Filter pane (#6)  
5. Chart theme (#7)

Stay professional — no newsprint, no weather metaphors, no drop caps in this mode.
