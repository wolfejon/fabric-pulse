# Synthetic demo corpus report

Fiction only — no real customer data, no live APIs.

## Counts by type

| Type | Count |
| --- | ---: |
| Mentions | 1200 |
| Theme definitions | 24 |
| Suggested actions | 32 |
| News items | 32 |
| Semester plans | 2 |
| Work items | 65 |
| Dependency requests | 17 |
| Theme ↔ ADO mappings | 30 |

## Mentions by cloudBoundary

Commercial-majority product talk (default story). Sovereign slices are a minority for filter demos.

| Slice | Count | Share |
| --- | ---: | ---: |
| Commercial-ish (commercial + omit + unknown) | 1009 | 84.1% |
| Sovereign total (usgov + usnat + ussec) | 191 | 15.9% |

| Key | Count | Share |
| --- | ---: | ---: |
| `commercial` | 788 | 65.7% |
| `(omit≈commercial)` | 149 | 12.4% |
| `usgov` | 100 | 8.3% |
| `unknown` | 72 | 6.0% |
| `ussec` | 48 | 4.0% |
| `usnat` | 43 | 3.6% |

## Mentions by workload

Pipelines bias target ~35–45% (actual **43.4%**).

| Key | Count | Share |
| --- | ---: | ---: |
| `pipelines` | 521 | 43.4% |
| `data-engineering` | 101 | 8.4% |
| `data-integration` | 99 | 8.2% |
| `copilot-ai` | 77 | 6.4% |
| `realtime-analytics` | 70 | 5.8% |
| `power-bi` | 69 | 5.8% |
| `data-warehouse` | 68 | 5.7% |
| `onelake` | 68 | 5.7% |
| `other` | 54 | 4.5% |
| `data-science` | 39 | 3.2% |
| `security-governance` | 34 | 2.8% |

## How to regenerate

```bash
npm run generate:demo
```

- Script: `scripts/generate-demo-corpus.py`
- Fixed seed: `20260912`
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
- Date range: Sep 5 – Sep 12, 2026.
