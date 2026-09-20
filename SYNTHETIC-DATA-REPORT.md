# Synthetic demo corpus report

Fiction only — no real customer data, no live APIs.

## Counts by type

| Type | Count |
| --- | ---: |
| Mentions | 4200 |
| Theme definitions | 44 |
| Suggested actions | 52 |
| News items | 52 |
| Semester plans | 2 |
| Work items | 100 |
| Dependency requests | 27 |
| Theme ↔ ADO mappings | 52 |
| Competitor features | 80 |
| Competitor pages | 25 |
| Intelligence news (gov desk) | 12 |
| Intelligence news (commercial desk) | 12 |

## Mentions by cloudBoundary

Commercial-majority product talk (default story). Sovereign slices are a minority for filter demos.

| Slice | Count | Share |
| --- | ---: | ---: |
| Commercial-ish (commercial + omit + unknown) | 3270 | 77.9% |
| Sovereign total (usgov + il7 + il6) | 930 | 22.1% |

| Key | Count | Share |
| --- | ---: | ---: |
| `commercial` | 2487 | 59.2% |
| `(omit≈commercial)` | 455 | 10.8% |
| `unknown` | 328 | 7.8% |
| `usgov` | 452 | 10.8% |
| `il7` | 235 | 5.6% |
| `il6` | 243 | 5.8% |

## Mentions by workload × cloud

Floors: ≥80/workload; ≥25 commercial(+omit), ≥25 usgov, ≥15 il7, ≥15 il6.

| Workload | commercial | omit | unknown | usgov | il7 | il6 | **Total** |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `copilot-ai` | 170 | 30 | 20 | 38 | 18 | 20 | **296** |
| `data-engineering` | 230 | 39 | 30 | 44 | 20 | 22 | **385** |
| `data-integration` | 210 | 38 | 32 | 41 | 20 | 19 | **360** |
| `data-science` | 122 | 30 | 16 | 30 | 21 | 18 | **237** |
| `data-warehouse` | 192 | 30 | 17 | 34 | 21 | 21 | **315** |
| `onelake` | 187 | 40 | 28 | 46 | 17 | 22 | **340** |
| `other` | 104 | 29 | 16 | 30 | 23 | 17 | **219** |
| `pipelines` | 741 | 134 | 120 | 80 | 41 | 44 | **1160** |
| `power-bi` | 221 | 34 | 20 | 38 | 18 | 25 | **356** |
| `realtime-analytics` | 170 | 32 | 22 | 36 | 19 | 17 | **296** |
| `security-governance` | 140 | 19 | 7 | 35 | 17 | 18 | **236** |

## Mentions by workload

Pipelines share **27.6%** (still the loudest beat; other workloads now stocked for filters).

| Key | Count | Share |
| --- | ---: | ---: |
| `pipelines` | 1160 | 27.6% |
| `data-engineering` | 385 | 9.2% |
| `data-integration` | 360 | 8.6% |
| `power-bi` | 356 | 8.5% |
| `onelake` | 340 | 8.1% |
| `data-warehouse` | 315 | 7.5% |
| `realtime-analytics` | 296 | 7.0% |
| `copilot-ai` | 296 | 7.0% |
| `data-science` | 237 | 5.6% |
| `security-governance` | 236 | 5.6% |
| `other` | 219 | 5.2% |

## Competitors per workload

Every workload has ≥3 rivals with feature rows (ships | planned | gap) and ≥1 chronicle back page.

| Workload | Rivals | Back pages (theme ids) |
| --- | --- | --- |
| `copilot-ai` | `azure-openai`, `databricks-assistant`, `gemini-bigquery`, `snowflake-cortex` | cp-copilot→`theme-copilot`, cp-copilot-grounding→`theme-copilot-grounding` |
| `data-engineering` | `aws-emr`, `databricks`, `synapse-spark` | cp-spark-start→`theme-spark-start`, cp-session-reuse→`theme-session-reuse` |
| `data-integration` | `adf-classic`, `airbyte`, `fivetran`, `informatica` | cp-dataflow→`theme-dataflow`, cp-connectors→`theme-connectors` |
| `data-science` | `azure-ml`, `databricks-ml`, `sagemaker` | cp-mlflow→`theme-mlflow`, cp-gpu-spark→`theme-gpu-spark` |
| `data-warehouse` | `bigquery`, `databricks-sql`, `redshift`, `snowflake` | cp-warehouse→`theme-warehouse`, cp-sql-endpoint→`theme-sql-endpoint` |
| `onelake` | `adls-gen2`, `aws-glue-catalog`, `aws-s3-lf`, `databricks-unity`, `gcs-biglake`, `purview` | cp-shortcuts→`theme-shortcuts`, cp-onelake-catalog→`theme-onelake-catalog` |
| `other` | `aws-cost-explorer`, `databricks`, `snowflake`, `synapse` | cp-capacity→`theme-capacity`, cp-positioning→`theme-positioning` |
| `pipelines` | `adf-classic`, `aws-glue`, `databricks-lakeflow`, `informatica` | cp-adf-migration→`theme-adf-migration`, cp-managed-vnet→`theme-managed-vnet`, cp-cicd→`theme-cicd`, cp-retry→`theme-retry-diagnostics`, cp-pipelines→`theme-pipelines` |
| `power-bi` | `looker`, `pbi-premium`, `qlik`, `tableau` | cp-direct-lake→`theme-direct-lake`, cp-semantic-model→`theme-semantic-model` |
| `realtime-analytics` | `confluent`, `eventhubs-adx`, `kinesis` | cp-eventstream→`theme-eventstream`, cp-dead-letter→`theme-dead-letter` |
| `security-governance` | `alation`, `azure-monitor`, `collibra`, `datadog`, `purview`, `splunk` | cp-governance→`theme-governance`, cp-monitoring→`theme-monitoring` |

## UI wiring

- `CompetitorBackPage` shows workload short label from `WORKLOAD_CATALOG` (no longer hard-coded Pipelines).
- `Newspaper` default back page prefers a page for the active workload filter.
- `buildNewspaperEdition` attaches `competitorPageId` from theme match, else workload default.
- `ATELIER_WORKLOAD_ORDER` includes all catalog workloads for Newspaper pills.



## Cloud-contextual intelligence desks (#1 / #6 / #10)

Synthetic **UNCLASSIFIED / DEMO** packs only — never mixed across desks.

| Desk | Cloud pills | Count |
| --- | --- | ---: |
| Federal / Defense / Intel (`gov`) | `usgov`, `il7`, `il6` | 12 |
| Commercial industry (`commercial`) | `commercial`, `all` (and unknown → commercial) | 12 |

- Schema: `NewsIntelligenceItem` with `cloudDesk`, `workloadIds[]`, `source`, `title`, `summary`, `publishedAt`, `trustTier`, optional `whyItMatters` + `relatedCompetitorPageId`.
- UI: `NewsDeskRail` under cloud pills; Chronicle **Intelligence** B2 back page; workload filter prioritizes linked stories.
- Honesty banner on gov desk: UNCLASSIFIED / DEMO — not operational intel.

## How to regenerate

```bash
npm run generate:demo
```

- Script: `scripts/generate-demo-corpus.py`
- Seed: `20260913` · Target: `4200` mentions with per-WL×cloud floors
- Output: `src/data/generated/corpus.json`
- Competitors: `src/data/competitors.ts`

After regenerating, run `npm run build`.

