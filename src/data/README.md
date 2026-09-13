# Demo data

Synthetic Fabric Pulse corpus — **fiction only**, no real customer data, no live APIs.

## Regenerate

```bash
npm run generate:demo
```

This runs `scripts/generate-demo-corpus.py` (fixed seed `20260913`) and writes `src/data/generated/corpus.json`.

`MockPulseDataProvider` loads that JSON and derives themes / daily / workloads / KPIs via `viewFromMentions`.

## Mix targets

- **~2000 mentions** (default 2000)
- **~40+ theme definitions** (currently 44; commercial/product-general majority)
- **Commercial-majority** product talk (~70–85% commercial / unknown / omit)
- **Sovereign minority** (~15–30% total across usgov / usnat / ussec) for cloud filter demos
- **Pipelines + ADF** heavy bias (~35–45% of mentions)
- Dates: 2026-08-15 → 2026-09-13 (Aug 15 – Sep 13, 2026)

Hand-authored `SAMPLE_*` modules re-export slices from the generated corpus so imports stay stable.
