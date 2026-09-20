#!/usr/bin/env python3
"""Fetch public RSS/Atom intelligence for Fabric Pulse desks.

Uses official RSS / Atom / public APIs only — no HTML scraping, no login,
no Cloudflare bypass. Writes src/data/generated/intelligence-live.json.

Usage: npm run fetch:intelligence
"""
from __future__ import annotations

import hashlib
import html
import json
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "generated" / "intelligence-live.json"

USER_AGENT = "FabricPulseBot/1.0 (+https://github.com/wolfejon/fabric-pulse; public RSS only)"
TIMEOUT = 25
MAX_PER_FEED = 18
TARGET_PER_DESK = 40

WORKLOAD_KEYWORDS: list[tuple[str, list[str]]] = [
    (
        "pipelines",
        [
            "pipeline",
            "pipelines",
            "data factory",
            "adf",
            "orchestration",
            "etl",
            "elt",
            "airflow",
            "lakeflow",
            "dataflow",
        ],
    ),
    (
        "data-engineering",
        [
            "spark",
            "notebook",
            "lakehouse",
            "delta lake",
            "apache spark",
            "data engineering",
            "livy",
        ],
    ),
    (
        "data-integration",
        [
            "connector",
            "connectors",
            "ingest",
            "ingestion",
            "fivetran",
            "airbyte",
            "copy activity",
            "data integration",
            "cdc",
        ],
    ),
    (
        "onelake",
        [
            "onelake",
            "one lake",
            "shortcut",
            "shortcuts",
            "unity catalog",
            "data lake",
            "open table",
            "iceberg",
            "delta",
        ],
    ),
    (
        "data-warehouse",
        [
            "warehouse",
            "sql endpoint",
            "synapse",
            "snowflake",
            "bigquery",
            "redshift",
            "databricks sql",
        ],
    ),
    (
        "realtime-analytics",
        [
            "eventstream",
            "real-time",
            "realtime",
            "streaming",
            "kafka",
            "event hub",
            "kinesis",
            "flink",
            "kql",
        ],
    ),
    (
        "data-science",
        [
            "mlflow",
            "machine learning",
            "mlops",
            "data science",
            "model training",
            "sagemaker",
            "feature store",
        ],
    ),
    (
        "power-bi",
        [
            "power bi",
            "powerbi",
            "direct lake",
            "semantic model",
            "report",
            "dashboard",
            "fabric bi",
        ],
    ),
    (
        "copilot-ai",
        [
            "copilot",
            "generative ai",
            "genai",
            "llm",
            "openai",
            "ai assistant",
            "agentic",
            "azure openai",
        ],
    ),
    (
        "security-governance",
        [
            "security",
            "governance",
            "purview",
            "compliance",
            "fedramp",
            "authorization",
            "zero trust",
            "cisa",
            "vulnerability",
            "identity",
            "sovereign",
            "il5",
            "il6",
            "il7",
            "ato",
            "private link",
            "managed vnet",
        ],
    ),
]

# Prefer Fabric/data-platform relevance for commercial desk broad feeds
COMMERCIAL_RELEVANCE = re.compile(
    r"\b("
    r"fabric|onelake|microsoft fabric|data platform|lakehouse|databricks|snowflake|"
    r"power bi|synapse|pipeline|spark|warehouse|analytics|data lake|big data|"
    r"etl|data engineering|copilot|ai |machine learning|open table|delta|"
    r"aws|azure|gcp|cloud data"
    r")\b",
    re.I,
)

GOV_RELEVANCE = re.compile(
    r"\b("
    r"fedramp|federal|government|dod|defense|agency|cisa|cyber|"
    r"azure government|usgov|il5|il6|il7|mission|classified|unclassified|"
    r"authorization|ato|cloud|data|ai |security|compliance|sovereign|"
    r"intel|intelligence community|gsa|acquisition"
    r")\b",
    re.I,
)

# Feeds: (id, display source, desk, url, relevance_filter|None, max_items)
FEEDS: list[dict[str, Any]] = [
    # --- Commercial ---
    {
        "id": "fabric-blog",
        "source": "Microsoft Fabric Blog",
        "desk": "commercial",
        "url": "https://blog.fabric.microsoft.com/en-us/blog/feed/",
        "relevance": None,
        "max": 20,
    },
    {
        "id": "ms-learn-fabric",
        "source": "Microsoft Learn",
        "desk": "commercial",
        "url": "https://learn.microsoft.com/api/search/rss?search=Microsoft%20Fabric&locale=en-us",
        "relevance": COMMERCIAL_RELEVANCE,
        "max": 12,
    },
    {
        "id": "azure-blog",
        "source": "Azure Blog",
        "desk": "commercial",
        "url": "https://azure.microsoft.com/en-us/blog/feed/",
        "relevance": COMMERCIAL_RELEVANCE,
        "max": 10,
    },
    {
        "id": "azure-sql-devblog",
        "source": "Azure SQL DevBlog",
        "desk": "commercial",
        "url": "https://devblogs.microsoft.com/azure-sql/feed/",
        "relevance": COMMERCIAL_RELEVANCE,
        "max": 8,
    },
    {
        "id": "thenewstack",
        "source": "The New Stack",
        "desk": "commercial",
        "url": "https://thenewstack.io/feed/",
        "relevance": COMMERCIAL_RELEVANCE,
        "max": 12,
    },
    {
        "id": "infoq",
        "source": "InfoQ",
        "desk": "commercial",
        "url": "https://www.infoq.com/feed/articles/",
        "relevance": COMMERCIAL_RELEVANCE,
        "max": 10,
    },
    {
        "id": "siliconangle",
        "source": "SiliconANGLE",
        "desk": "commercial",
        "url": "https://siliconangle.com/feed/",
        "relevance": COMMERCIAL_RELEVANCE,
        "max": 12,
    },
    {
        "id": "databricks",
        "source": "Databricks Blog",
        "desk": "commercial",
        "url": "https://www.databricks.com/feed",
        "relevance": None,
        "max": 12,
    },
    {
        "id": "snowflake",
        "source": "Snowflake Blog",
        "desk": "commercial",
        "url": "https://www.snowflake.com/feed/",
        "relevance": None,
        "max": 10,
    },
    {
        "id": "aws-big-data",
        "source": "AWS Big Data Blog",
        "desk": "commercial",
        "url": "https://aws.amazon.com/blogs/big-data/feed/",
        "relevance": None,
        "max": 12,
    },
    {
        "id": "gnews-fabric",
        "source": "Google News",
        "desk": "commercial",
        "url": (
            "https://news.google.com/rss/search?"
            + urllib.parse.urlencode(
                {
                    "q": 'Microsoft Fabric OR OneLake OR "Fabric Pipelines" OR "Power BI Direct Lake"',
                    "hl": "en-US",
                    "gl": "US",
                    "ceid": "US:en",
                }
            )
        ),
        "relevance": None,
        "max": 15,
    },
    # --- Gov (public UNCLASSIFIED news / advisories only) ---
    {
        "id": "fedscoop",
        "source": "FedScoop",
        "desk": "gov",
        "url": "https://fedscoop.com/feed/",
        "relevance": GOV_RELEVANCE,
        "max": 15,
    },
    {
        "id": "nextgov",
        "source": "Nextgov",
        "desk": "gov",
        "url": "https://www.nextgov.com/rss/all/",
        "relevance": GOV_RELEVANCE,
        "max": 15,
    },
    {
        "id": "defensescoop",
        "source": "DefenseScoop",
        "desk": "gov",
        "url": "https://defensescoop.com/feed/",
        "relevance": GOV_RELEVANCE,
        "max": 12,
    },
    {
        "id": "breaking-defense",
        "source": "Breaking Defense",
        "desk": "gov",
        "url": "https://breakingdefense.com/feed/",
        "relevance": GOV_RELEVANCE,
        "max": 12,
    },
    {
        "id": "cisa-advisories",
        "source": "CISA Advisories",
        "desk": "gov",
        "url": "https://www.cisa.gov/cybersecurity-advisories/all.xml",
        "relevance": None,
        "max": 12,
    },
    {
        "id": "cisa-news",
        "source": "CISA News",
        "desk": "gov",
        "url": "https://www.cisa.gov/news.xml",
        "relevance": None,
        "max": 8,
    },
    {
        "id": "gnews-fed-cloud",
        "source": "Google News",
        "desk": "gov",
        "url": (
            "https://news.google.com/rss/search?"
            + urllib.parse.urlencode(
                {
                    "q": 'FedRAMP OR "Azure Government" OR "DoD IL" OR "Impact Level" cloud OR "federal cloud"',
                    "hl": "en-US",
                    "gl": "US",
                    "ceid": "US:en",
                }
            )
        ),
        "relevance": GOV_RELEVANCE,
        "max": 15,
    },
]

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "content": "http://purl.org/rss/1.0/modules/content/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "media": "http://search.yahoo.com/mrss/",
}


def strip_html(text: str) -> str:
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r"(?is)<script[^>]*>.*?</script>", " ", text)
    text = re.sub(r"(?is)<style[^>]*>.*?</style>", " ", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def local_tag(el: ET.Element) -> str:
    tag = el.tag
    if "}" in tag:
        return tag.rsplit("}", 1)[-1]
    return tag


def child_text(el: ET.Element, names: list[str]) -> str:
    wanted = set(names)
    for child in list(el):
        if local_tag(child) in wanted:
            return (child.text or "").strip() or "".join(child.itertext()).strip()
    return ""


def child_attr(el: ET.Element, names: list[str], attr: str) -> str:
    wanted = set(names)
    for child in list(el):
        if local_tag(child) in wanted:
            val = child.get(attr)
            if val:
                return val.strip()
            # atom link may be empty text with href
            href = child.get("href")
            if href and attr in ("href", "url"):
                return href.strip()
    return ""


def parse_date(raw: str) -> str:
    raw = (raw or "").strip()
    if not raw:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        dt = parsedate_to_datetime(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        pass
    # ISO-ish
    try:
        cleaned = raw.replace("Z", "+00:00")
        dt = datetime.fromisoformat(cleaned)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def stable_id(desk: str, url: str, title: str) -> str:
    h = hashlib.sha1(f"{desk}|{url}|{title}".encode("utf-8")).hexdigest()[:12]
    return f"live-{desk}-{h}"


def tag_workloads(title: str, summary: str) -> list[str]:
    blob = f"{title} {summary}".lower()
    hits: list[str] = []
    for wid, kws in WORKLOAD_KEYWORDS:
        if any(kw in blob for kw in kws):
            hits.append(wid)
    if not hits:
        hits = ["other"]
    return hits[:4]


def why_for(workloads: list[str], desk: str) -> dict[str, str]:
    out: dict[str, str] = {}
    desk_word = "gov" if desk == "gov" else "commercial"
    for wid in workloads[:2]:
        out[wid] = f"Live public {desk_word} desk item tagged to this workload via headline keywords."
    return out


def fetch_url(url: str) -> tuple[bytes | None, str | None]:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        },
        method="GET",
    )
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
            return resp.read(), None
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code}"
    except Exception as e:
        return None, str(e)


def parse_feed_items(raw: bytes) -> list[dict[str, str]]:
    # Strip BOM / junk before first <
    text = raw.decode("utf-8", errors="replace")
    start = text.find("<")
    if start > 0:
        text = text[start:]
    try:
        root = ET.fromstring(text)
    except ET.ParseError:
        # sometimes HTML error pages
        return []

    items: list[dict[str, str]] = []
    root_tag = local_tag(root)

    # RSS 2.0
    if root_tag == "rss" or root.find("channel") is not None:
        channel = root.find("channel") if root_tag == "rss" else root
        if channel is None:
            channel = root
        for item in channel.findall("item"):
            title = child_text(item, ["title"])
            link = child_text(item, ["link"]) or child_attr(item, ["link"], "href")
            # Google News often puts link in guid
            if not link:
                link = child_text(item, ["guid"])
            desc = child_text(item, ["description", "summary", "encoded"])
            pub = child_text(item, ["pubDate", "date", "published", "updated"])
            if not title or not link:
                continue
            items.append(
                {
                    "title": strip_html(title),
                    "url": link.strip(),
                    "summary": strip_html(desc)[:480],
                    "publishedAt": parse_date(pub),
                }
            )
        return items

    # Atom
    if root_tag == "feed" or root.tag.endswith("}feed"):
        for entry in root.findall("atom:entry", NS) or root.findall(
            "{http://www.w3.org/2005/Atom}entry"
        ):
            title = child_text(entry, ["title"])
            link = ""
            for child in list(entry):
                if local_tag(child) == "link":
                    rel = child.get("rel", "alternate")
                    href = child.get("href", "")
                    if href and rel in ("alternate", ""):
                        link = href
                        break
            if not link:
                link = child_text(entry, ["id"])
            desc = child_text(entry, ["summary", "content"])
            pub = child_text(entry, ["published", "updated"])
            if not title or not link:
                continue
            items.append(
                {
                    "title": strip_html(title),
                    "url": link.strip(),
                    "summary": strip_html(desc)[:480],
                    "publishedAt": parse_date(pub),
                }
            )
        return items

    # Fallback: any item/entry anywhere
    for item in root.iter():
        if local_tag(item) not in ("item", "entry"):
            continue
        title = child_text(item, ["title"])
        link = child_text(item, ["link"]) or child_attr(item, ["link"], "href")
        if not link:
            for child in list(item):
                if local_tag(child) == "link" and child.get("href"):
                    link = child.get("href", "")
                    break
        desc = child_text(item, ["description", "summary", "content", "encoded"])
        pub = child_text(item, ["pubDate", "published", "updated", "date"])
        if title and link:
            items.append(
                {
                    "title": strip_html(title),
                    "url": link.strip(),
                    "summary": strip_html(desc)[:480],
                    "publishedAt": parse.date(pub) if False else parse_date(pub),
                }
            )
    return items


def passes_relevance(item: dict[str, str], pattern: re.Pattern[str] | None) -> bool:
    if pattern is None:
        return True
    blob = f"{item['title']} {item['summary']}"
    return bool(pattern.search(blob))


def optional_hn_search() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Optional Algolia HN public API (no key)."""
    meta = {"id": "hn-algolia", "source": "Hacker News (Algolia)", "desk": "commercial", "ok": False}
    query = urllib.parse.urlencode(
        {
            "query": "Microsoft Fabric OR OneLake",
            "tags": "story",
            "hitsPerPage": "15",
        }
    )
    url = f"https://hn.algolia.com/api/v1/search_by_date?{query}"
    raw, err = fetch_url(url)
    if err or not raw:
        meta["error"] = err or "empty"
        return [], meta
    try:
        data = json.loads(raw.decode("utf-8"))
    except Exception as e:
        meta["error"] = f"json: {e}"
        return [], meta
    items: list[dict[str, Any]] = []
    for hit in data.get("hits") or []:
        title = (hit.get("title") or "").strip()
        story_url = (hit.get("url") or "").strip()
        object_id = hit.get("objectID")
        if not story_url and object_id:
            story_url = f"https://news.ycombinator.com/item?id={object_id}"
        if not title or not story_url:
            continue
        created = hit.get("created_at") or ""
        published = parse_date(created) if created else datetime.now(timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        )
        summary = f"HN discussion ({hit.get('points', 0)} pts, {hit.get('num_comments', 0)} comments)."
        items.append(
            {
                "title": title,
                "url": story_url,
                "summary": summary,
                "publishedAt": published,
                "source": "Hacker News",
            }
        )
    meta["ok"] = True
    meta["count"] = len(items)
    return items, meta


def optional_gdelt() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Optional GDELT DOC API — public, UNCLASSIFIED indexed news."""
    meta = {"id": "gdelt-fed-cloud", "source": "GDELT", "desk": "gov", "ok": False}
    query = urllib.parse.urlencode(
        {
            "query": '(FedRAMP OR "Azure Government" OR "Impact Level" OR "DoD cloud") sourcelang:english',
            "mode": "ArtList",
            "format": "json",
            "maxrecords": "20",
            "sort": "DateDesc",
        }
    )
    url = f"https://api.gdeltproject.org/api/v2/doc/doc?{query}"
    raw, err = fetch_url(url)
    if err or not raw:
        meta["error"] = err or "empty"
        return [], meta
    try:
        text = raw.decode("utf-8", errors="replace").strip()
        if not text.startswith("{"):
            meta["error"] = "non-json response"
            return [], meta
        data = json.loads(text)
    except Exception as e:
        meta["error"] = f"json: {e}"
        return [], meta
    items: list[dict[str, Any]] = []
    for art in data.get("articles") or []:
        title = (art.get("title") or "").strip()
        link = (art.get("url") or "").strip()
        if not title or not link:
            continue
        seendate = art.get("seendate") or ""
        # GDELT seendate like 20260918T153000Z
        published = parse_date(seendate) if seendate else datetime.now(timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        )
        domain = art.get("domain") or "GDELT"
        items.append(
            {
                "title": title,
                "url": link,
                "summary": f"Public GDELT-indexed article via {domain}.",
                "publishedAt": published,
                "source": f"GDELT · {domain}",
            }
        )
    meta["ok"] = True
    meta["count"] = len(items)
    return items, meta


def main() -> int:
    feed_results: list[dict[str, Any]] = []
    collected: list[dict[str, Any]] = []
    seen_urls: set[str] = set()

    print("Fetching intelligence RSS / public APIs…", flush=True)

    for feed in FEEDS:
        raw, err = fetch_url(feed["url"])
        result = {
            "id": feed["id"],
            "source": feed["source"],
            "desk": feed["desk"],
            "url": feed["url"],
            "ok": False,
            "parsed": 0,
            "kept": 0,
        }
        if err or not raw:
            result["error"] = err or "empty body"
            feed_results.append(result)
            print(f"  FAIL {feed['id']}: {result['error']}", flush=True)
            continue
        try:
            parsed = parse_feed_items(raw)
        except Exception as e:
            result["error"] = f"parse: {e}"
            feed_results.append(result)
            print(f"  FAIL {feed['id']}: {result['error']}", flush=True)
            continue

        result["ok"] = True
        result["parsed"] = len(parsed)
        kept = 0
        rel = feed.get("relevance")
        for item in parsed:
            if kept >= int(feed.get("max") or MAX_PER_FEED):
                break
            if not passes_relevance(item, rel):
                continue
            url = item["url"]
            # Normalize google news redirect URLs are fine as-is
            key = url.split("#")[0].rstrip("/").lower()
            if key in seen_urls:
                continue
            seen_urls.add(key)
            workloads = tag_workloads(item["title"], item["summary"])
            desk = feed["desk"]
            collected.append(
                {
                    "id": stable_id(desk, url, item["title"]),
                    "cloudDesk": desk,
                    "workloadIds": workloads,
                    "source": feed["source"],
                    "title": item["title"][:240],
                    "summary": item["summary"]
                    or f"Public headline from {feed['source']} (live RSS).",
                    "publishedAt": item["publishedAt"],
                    "trustTier": "live-public",
                    "url": url,
                    "whyItMatters": why_for(workloads, desk),
                    "provenance": "live-public",
                    "feedId": feed["id"],
                }
            )
            kept += 1
        result["kept"] = kept
        feed_results.append(result)
        print(
            f"  OK   {feed['id']}: parsed={result['parsed']} kept={kept}",
            flush=True,
        )

    # Optional APIs
    for label, fetcher in (("HN", optional_hn_search), ("GDELT", optional_gdelt)):
        extras, meta = fetcher()
        feed_results.append(
            {
                "id": meta["id"],
                "source": meta["source"],
                "desk": meta["desk"],
                "url": meta.get("url", "api"),
                "ok": meta.get("ok", False),
                "parsed": meta.get("count", len(extras)),
                "kept": 0,
                **({"error": meta["error"]} if meta.get("error") else {}),
            }
        )
        if not meta.get("ok"):
            print(f"  FAIL {meta['id']}: {meta.get('error')}", flush=True)
            continue
        kept = 0
        desk = meta["desk"]
        for item in extras:
            key = item["url"].split("#")[0].rstrip("/").lower()
            if key in seen_urls:
                continue
            seen_urls.add(key)
            workloads = tag_workloads(item["title"], item["summary"])
            collected.append(
                {
                    "id": stable_id(desk, item["url"], item["title"]),
                    "cloudDesk": desk,
                    "workloadIds": workloads,
                    "source": item.get("source") or meta["source"],
                    "title": item["title"][:240],
                    "summary": item["summary"],
                    "publishedAt": item["publishedAt"],
                    "trustTier": "live-public",
                    "url": item["url"],
                    "whyItMatters": why_for(workloads, desk),
                    "provenance": "live-public",
                    "feedId": meta["id"],
                }
            )
            kept += 1
        feed_results[-1]["kept"] = kept
        print(f"  OK   {meta['id']}: kept={kept}", flush=True)

    # Sort newest first; trim soft per desk while aiming for TARGET_PER_DESK
    collected.sort(key=lambda x: x["publishedAt"], reverse=True)

    by_desk: dict[str, list[dict[str, Any]]] = {"gov": [], "commercial": []}
    for item in collected:
        by_desk[item["cloudDesk"]].append(item)

    # Soft cap: keep up to ~1.5x target if available, else all
    final: list[dict[str, Any]] = []
    for desk in ("commercial", "gov"):
        items = by_desk[desk]
        cap = max(TARGET_PER_DESK, min(len(items), TARGET_PER_DESK + 20))
        final.extend(items[:cap])

    final.sort(key=lambda x: x["publishedAt"], reverse=True)

    fetched_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    payload = {
        "fetchedAt": fetched_at,
        "trustTier": "live-public",
        "disclaimer": (
            "Public RSS/Atom/API headlines only. Not operational or classified intel. "
            "Gov desk items are UNCLASSIFIED public news/advisories."
        ),
        "counts": {
            "commercial": sum(1 for i in final if i["cloudDesk"] == "commercial"),
            "gov": sum(1 for i in final if i["cloudDesk"] == "gov"),
            "total": len(final),
        },
        "feeds": feed_results,
        "items": final,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    failed = [f for f in feed_results if not f.get("ok")]
    print(
        f"\nWrote {OUT.relative_to(ROOT)} — "
        f"commercial={payload['counts']['commercial']} "
        f"gov={payload['counts']['gov']} "
        f"total={payload['counts']['total']}",
        flush=True,
    )
    if failed:
        print(f"Failed feeds ({len(failed)}): " + ", ".join(f["id"] for f in failed), flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
