# Synthetic demo corpus report

Fiction only — no real customer data, no live APIs.

## Counts by type

| Type | Count |
| --- | ---: |
| Mentions | 2000 |
| Theme definitions | 44 |
| Suggested actions | 52 |
| News items | 52 |
| Semester plans | 2 |
| Work items | 100 |
| Dependency requests | 27 |
| Theme ↔ ADO mappings | 52 |

## Mentions by cloudBoundary

Commercial-majority product talk (default story). Sovereign slices are a minority for filter demos.

| Slice | Count | Share |
| --- | ---: | ---: |
| Commercial-ish (commercial + omit + unknown) | 1631 | 81.5% |
| Sovereign total (usgov + usnat + ussec) | 369 | 18.4% |

| Key | Count | Share |
| --- | ---: | ---: |
| `commercial` | 1248 | 62.4% |
| `(omit≈commercial)` | 252 | 12.6% |
| `usgov` | 197 | 9.8% |
| `unknown` | 131 | 6.5% |
| `usnat` | 90 | 4.5% |
| `ussec` | 82 | 4.1% |

## Mentions by workload

Pipelines bias target ~35–45% (actual **39.3%**).

| Key | Count | Share |
| --- | ---: | ---: |
| `pipelines` | 786 | 39.3% |
| `data-engineering` | 177 | 8.8% |
| `data-integration` | 157 | 7.8% |
| `power-bi` | 149 | 7.5% |
| `data-warehouse` | 138 | 6.9% |
| `onelake` | 134 | 6.7% |
| `copilot-ai` | 133 | 6.7% |
| `realtime-analytics` | 108 | 5.4% |
| `security-governance` | 89 | 4.5% |
| `other` | 69 | 3.5% |
| `data-science` | 60 | 3.0% |

## How to regenerate

```bash
npm run generate:demo
```

- Script: `scripts/generate-demo-corpus.py`
- Fixed seed: `20260913`
- Output: `src/data/generated/corpus.json`
- Docs: `src/data/README.md`

After regenerating, run `npm run build` to confirm the JSON still type-checks with the provider.

## File paths changed

| Path | Role |
| --- | --- |
| `scripts/generate-demo-corpus.py` | Deterministic generator |
| `src/data/generated/corpus.json` | Served corpus |
| `src/data/provider.ts` | `MockPulseDataProvider` loads corpus + `viewFromMentions` |
| `src/data/themes.ts` | Re-exports theme definitions from corpus |
| `src/data/mentions.ts` | Re-exports `SAMPLE_MENTIONS` from corpus |
| `src/data/actions.ts` | Re-exports `SAMPLE_ACTIONS` from corpus |
| `src/data/news.ts` | Re-exports `SAMPLE_NEWS` from corpus |
| `src/data/ado.ts` | Re-exports ADO sample slices from corpus |
| `src/data/README.md` | Regenerate instructions |
| `package.json` | Adds `generate:demo` script |
| `tsconfig.app.json` | `resolveJsonModule: true` |
| `SYNTHETIC-DATA-REPORT.md` | This report |

## Provider notes

- Export `pulseProvider` unchanged (still `MockPulseDataProvider`).
- No live API calls; aggregates derived client-side via `viewFromMentions`.
- Date range: Aug 15 – Sep 13, 2026.
