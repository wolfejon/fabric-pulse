# Intelligence feeds (live public)

Fabric Pulse news desks load a **live-public** pack from official RSS / Atom / public APIs, then keep the **synthetic demo** pack for continuity. Desks never mix: gov (`usgov` / `il7` / `il6`) vs commercial (`commercial` / `all`).

> Public news ≠ operational or classified intel. The gov desk banner stays: **UNCLASSIFIED — public news & advisories only.**

## Refresh

```bash
npm run fetch:intelligence
npm run build
```

- Script: `scripts/fetch-intelligence-rss.py`
- Output: `src/data/generated/intelligence-live.json` (committed so demos work offline)
- Provider: `MockPulseDataProvider` merges live + demo via `src/data/intelligenceLive.ts`
- UI badges: **Live public feed** vs **Demo**

## Sources used (commercial desk)

| Id | Source | Endpoint |
| --- | --- | --- |
| `fabric-blog` | Microsoft Fabric Blog | `https://blog.fabric.microsoft.com/en-us/blog/feed/` |
| `ms-learn-fabric` | Microsoft Learn (Fabric search RSS) | `https://learn.microsoft.com/api/search/rss?search=Microsoft%20Fabric&locale=en-us` |
| `azure-blog` | Azure Blog | `https://azure.microsoft.com/en-us/blog/feed/` |
| `azure-sql-devblog` | Azure SQL DevBlog | `https://devblogs.microsoft.com/azure-sql/feed/` |
| `thenewstack` | The New Stack | `https://thenewstack.io/feed/` |
| `infoq` | InfoQ Articles | `https://www.infoq.com/feed/articles/` |
| `siliconangle` | SiliconANGLE | `https://siliconangle.com/feed/` |
| `databricks` | Databricks Blog | `https://www.databricks.com/feed` |
| `snowflake` | Snowflake Blog | `https://www.snowflake.com/feed/` |
| `aws-big-data` | AWS Big Data Blog | `https://aws.amazon.com/blogs/big-data/feed/` |
| `gnews-fabric` | Google News RSS | Fabric / OneLake / Pipelines / Direct Lake query |
| `hn-algolia` | Hacker News (Algolia public API) | Optional; deduped against other URLs |

## Sources used (gov desk — public UNCLASSIFIED only)

| Id | Source | Endpoint |
| --- | --- | --- |
| `fedscoop` | FedScoop | `https://fedscoop.com/feed/` |
| `nextgov` | Nextgov | `https://www.nextgov.com/rss/all/` |
| `defensescoop` | DefenseScoop | `https://defensescoop.com/feed/` |
| `breaking-defense` | Breaking Defense | `https://breakingdefense.com/feed/` |
| `cisa-advisories` | CISA Advisories | `https://www.cisa.gov/cybersecurity-advisories/all.xml` |
| `cisa-news` | CISA News | `https://www.cisa.gov/news.xml` |
| `gnews-fed-cloud` | Google News RSS | FedRAMP / Azure Government / IL / federal cloud |
| `gdelt-fed-cloud` | GDELT DOC API | Optional; may 429 under rate limits |

## Guardrails

- **Allowed:** official RSS/Atom, Google News RSS, Algolia HN API, GDELT DOC API, WebFetch of public article pages when needed for debugging.
- **Not allowed:** Cloudflare/login/paywall bypass, scraping Fabric Community HTML or other ToS-blocked sites, classified / operational mission data.
- Relevance filters keep broad industry feeds on-topic (data platform / federal cloud keywords).
- Workload tags are best-effort keyword matches (`pipelines`, `onelake`, `security-governance`, …).

## Schema

Each live item:

```ts
{
  id, cloudDesk: 'gov' | 'commercial', workloadIds[],
  source, title, summary, publishedAt, url,
  trustTier: 'live-public', provenance: 'live-public', feedId?
}
```

Synthetic demo items keep `trustTier` of `official` / `trade-press` / `community` / `synthetic` with `provenance: 'demo'`.
