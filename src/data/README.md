# Demo data

Synthetic Fabric Pulse corpus — **fiction only**, no real customer data, no live APIs.

## Regenerate

```bash
npm run generate:demo
```

This runs `scripts/generate-demo-corpus.py` (fixed seed `20260912`) and writes `src/data/generated/corpus.json`.

`MockPulseDataProvider` loads that JSON and derives themes / daily / workloads / KPIs via `viewFromMentions`.

## Mix targets

- **~1000–1500 mentions** (default 1200)
- **Commercial-majority** product talk (~70–85% commercial / unknown / omit)
- **Sovereign minority** (~15–30% total across usgov / usnat / ussec) for cloud filter demos
- **Pipelines + ADF** heavy bias (~35–45% of mentions)
- Dates: 2026-09-05 → 2026-09-12

Hand-authored `SAMPLE_*` modules re-export slices from the generated corpus so imports stay stable.
