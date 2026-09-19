#!/usr/bin/env python3
"""Deterministic synthetic demo corpus for Fabric Pulse. Fiction only.

Usage: npm run generate:demo
Output: src/data/generated/corpus.json

Cloud mix is commercial-majority (~70-85% commercial/unknown);
sovereign slices (usgov/il7/il6) are a minority for demo filters.
Pipelines + ADF bias ~35-45% of mentions.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

SEED = 20260913
# Large enough for per-workload×cloud floors while staying commercial-majority.
TARGET_MENTIONS = 4200
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "generated" / "corpus.json"

# Per-workload cloud floors (unknown optional). Floors sum to ≥80 overall per WL.
MIN_COMMERCIAL = 25
MIN_USGOV = 25
MIN_IL7 = 15
MIN_IL6 = 15
MIN_PER_WORKLOAD = 80


class RNG:
    """Mulberry32-compatible PRNG for reproducibility."""

    def __init__(self, seed: int) -> None:
        self.state = seed & 0xFFFFFFFF

    def random(self) -> float:
        self.state = (self.state + 0x6D2B79F5) & 0xFFFFFFFF
        t = self.state
        t = (t ^ (t >> 15)) * (t | 1) & 0xFFFFFFFF
        t ^= (t + ((t ^ (t >> 7)) * (t | 61) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0

    def pick(self, arr):
        return arr[int(self.random() * len(arr)) % len(arr)]

    def pick_weighted(self, items):
        total = sum(w for _, w in items)
        r = self.random() * total
        for item, w in items:
            r -= w
            if r <= 0:
                return item
        return items[-1][0]

    def int(self, lo, hi):
        return lo + int(self.random() * (hi - lo + 1))

    def float(self, lo, hi, digits=2):
        return round(lo + self.random() * (hi - lo), digits)


rng = RNG(SEED)

WORKLOADS = [
    "pipelines",
    "data-engineering",
    "data-integration",
    "onelake",
    "data-warehouse",
    "realtime-analytics",
    "data-science",
    "power-bi",
    "copilot-ai",
    "security-governance",
    "other",
]

WORKLOAD_WEIGHTS = [
    ("pipelines", 32),
    ("data-engineering", 9),
    ("data-integration", 8),
    ("onelake", 8),
    ("data-warehouse", 7),
    ("realtime-analytics", 7),
    ("power-bi", 8),
    ("copilot-ai", 7),
    ("security-governance", 5),
    ("data-science", 5),
    ("other", 4),
]

# Fill-phase weights after floors (overall target ~70–85% commercial+unknown).
CLOUD_WEIGHTS = [
    ("commercial", 78),
    ("unknown", 8),
    ("usgov", 7),
    ("il7", 3.5),
    ("il6", 3.5),
]

# Heavier commercial once floors are met (sovereign stays usable but minority).
CLOUD_FILL_WEIGHTS = [
    ("commercial", 82),
    ("unknown", 9),
    ("usgov", 5),
    ("il7", 2),
    ("il6", 2),
]

# Strategy MVP source registry seed (toggleable in UI)
SOURCE_WEIGHTS = [
    ("reddit-microsoft-fabric", 38),
    ("github-fabric-cicd-issues", 28),
    ("rss-fabric-updates", 22),
    ("x-api-fabric", 6),
    ("stackexchange-fabric", 4),
    ("gdelt-fabric-news", 2),
]

SOURCE_REGISTRY = [
    {
        "id": "rss-fabric-updates",
        "kind": "rss",
        "displayName": "Blog RSS — Fabric Updates",
        "enabled": True,
        "lastRefresh": "2026-09-13T15:00:00Z",
        "configBlurb": "https://blog.fabric.microsoft.com/en-us/blog/feed/",
        "legalNote": "Official RSS",
    },
    {
        "id": "github-fabric-cicd-issues",
        "kind": "github-issues",
        "displayName": "GitHub — microsoft/fabric-cicd",
        "enabled": True,
        "lastRefresh": "2026-09-13T14:30:00Z",
        "configBlurb": "Issues API · microsoft/fabric-cicd",
        "legalNote": "Official GitHub API",
    },
    {
        "id": "reddit-microsoft-fabric",
        "kind": "reddit",
        "displayName": "Reddit — r/MicrosoftFabric",
        "enabled": True,
        "lastRefresh": "2026-09-13T14:00:00Z",
        "configBlurb": "r/MicrosoftFabric via Reddit Data API",
        "legalNote": "Official Data API",
    },
    {
        "id": "x-api-fabric",
        "kind": "x-api",
        "displayName": "X — Fabric keywords (capped)",
        "enabled": False,
        "lastRefresh": "2026-09-12T18:00:00Z",
        "configBlurb": "Capped keyword set · deferred for MVP spend",
        "legalNote": "Official X API — cost-gated",
    },
    {
        "id": "stackexchange-fabric",
        "kind": "stackexchange",
        "displayName": "Stack Overflow — [microsoft-fabric]",
        "enabled": False,
        "lastRefresh": "2026-09-10T12:00:00Z",
        "configBlurb": "Stack Exchange API · tag microsoft-fabric",
        "legalNote": "Official API — deferred",
    },
    {
        "id": "gdelt-fabric-news",
        "kind": "gdelt",
        "displayName": "GDELT — Fabric / ADF press",
        "enabled": False,
        "lastRefresh": "2026-09-11T08:00:00Z",
        "configBlurb": "News / press color for Newspaper",
        "legalNote": "GDELT public — deferred",
    },
]


def synthetic_permalink(source_id: str, external_id: str) -> str:
    if source_id == "reddit-microsoft-fabric":
        return f"https://www.reddit.com/r/MicrosoftFabric/comments/{external_id}/"
    if source_id == "github-fabric-cicd-issues":
        return f"https://github.com/microsoft/fabric-cicd/issues/{external_id}"
    if source_id == "rss-fabric-updates":
        return f"https://blog.fabric.microsoft.com/en-us/blog/#comment-{external_id}"
    if source_id == "x-api-fabric":
        return f"https://x.com/i/web/status/{external_id}"
    if source_id == "stackexchange-fabric":
        return f"https://stackoverflow.com/q/{external_id}"
    if source_id == "gdelt-fabric-news":
        return f"https://api.gdeltproject.org/api/v2/doc/doc?query=fabric&id={external_id}"
    return f"https://example.invalid/pulse/{source_id}/{external_id}"


def external_id_for(source_id: str, mention_id: str) -> str:
    n = abs(hash(mention_id)) % 900000 + 100000
    if source_id == "github-fabric-cicd-issues":
        return str(abs(hash(mention_id)) % 4000 + 120)
    if source_id == "reddit-microsoft-fabric":
        alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
        x = abs(hash(mention_id))
        return "".join(alphabet[(x // (36 ** i)) % 36] for i in range(7))
    return str(n)

DATES = [
    "2026-08-15",
    "2026-08-16",
    "2026-08-17",
    "2026-08-18",
    "2026-08-19",
    "2026-08-20",
    "2026-08-21",
    "2026-08-22",
    "2026-08-23",
    "2026-08-24",
    "2026-08-25",
    "2026-08-26",
    "2026-08-27",
    "2026-08-28",
    "2026-08-29",
    "2026-08-30",
    "2026-08-31",
    "2026-09-01",
    "2026-09-02",
    "2026-09-03",
    "2026-09-04",
    "2026-09-05",
    "2026-09-06",
    "2026-09-07",
    "2026-09-08",
    "2026-09-09",
    "2026-09-10",
    "2026-09-11",
    "2026-09-12",
    "2026-09-13",
]

FIRST = [
    "Dan", "Priya", "Marcus", "Elena", "Jonah", "Samira", "Lee", "Chris", "Amina", "Theo",
    "Greta", "Owen", "Nadia", "Felix", "Hannah", "Ravi", "Sophie", "Ben", "Keisha", "Victor",
    "Clara", "Omar", "Maya", "Luis", "Ingrid", "Noah", "Tara", "Jules", "Pia", "Andre",
    "Bea", "Hugo", "Lina", "Ivy", "Seth", "Nora", "Yusuf", "Casey", "Mei", "Ruth",
    "Pete", "Gina", "Arthur", "Fabian", "Jordan", "Alex", "Sam", "Riley", "Quinn", "Morgan",
    "Avery", "Cameron", "Drew", "Jamie", "Taylor", "Reese", "Skyler", "Harper", "Rowan", "Eden",
    "Kai", "Noel", "Sasha", "Devon", "Blake", "Finley", "Emery", "Parker", "Sage", "Remy",
]

LAST = [
    "Okoye", "Natarajan", "Hill", "Voss", "Reeves", "Khalil", "Cho", "Palumbo", "Farouk", "Marsh",
    "Holm", "Blake", "Rahman", "Ortega", "Cole", "Mehta", "Laurent", "Ibarra", "Ward", "Nguyen",
    "Jensen", "Siddiq", "Chen", "Romero", "Foss", "Patel", "Singh", "Moreau", "Kowalski", "Silva",
    "Morales", "Berg", "Park", "Grant", "Caldwell", "Demir", "Quinn", "Lin", "Okonkwo",
    "Alvarez", "Rossi", "Pen", "Ortiz", "Brooks", "Kim", "Shah", "Diaz", "Walsh", "Tran",
    "Hughes", "Price", "Bennett", "Cruz", "Murphy", "Reyes", "Foster", "Powell", "Jenkins", "Hayes",
]

ROLES = [
    "Data engineer", "Analytics engineer", "Platform lead", "Consultant", "Fabric admin",
    "Staff DE", "Lakehouse architect", "Notebook user", "DE manager", "Spark engineer",
    "Integration specialist", "Citizen integrator", "ERP analyst", "Platform engineer",
    "Fabric champion", "Multi-cloud DE", "Data mesh lead", "Governance analyst",
    "Finance analytics", "Analytics lead", "DW engineer", "BI developer", "Streaming engineer",
    "KQL fan", "IoT platform", "Ops analyst", "ML engineer", "Applied scientist",
    "Data scientist", "Power BI lead", "Report author", "Semantic modeler", "Capacity owner",
    "DAX specialist", "Warehouse analyst", "Pipeline author", "Power user", "Data steward",
    "Security engineer", "Network + data", "Product manager", "Solutions architect",
    "Migration lead", "SRE", "Cloud architect", "ADF veteran", "Gov cloud engineer",
]


def pad(n, w=4):
    return str(n).zfill(w)


def fake_handle(first, last):
    styles = [
        lambda: f"@{first.lower()}{last.lower()[:4]}",
        lambda: f"@{first.lower()}_{last.lower()[:5]}",
        lambda: f"@{last.lower()}_data",
        lambda: f"@fab_{first.lower()}{rng.int(1, 99)}",
        lambda: f"@{first.lower()}{rng.int(10, 99)}_de",
    ]
    return rng.pick(styles)()


def random_iso(day):
    return f"{day}T{pad(rng.int(6, 22), 2)}:{pad(rng.int(0, 59), 2)}:{pad(rng.int(0, 59), 2)}Z"


def sentiment_from_score(score):
    if score >= 0.25:
        return "positive"
    if score <= -0.25:
        return "negative"
    return "neutral"


def make_author():
    first = rng.pick(FIRST)
    last = rng.pick(LAST)
    return {
        "author": f"{first} {last}",
        "handle": fake_handle(first, last),
        "authorRole": rng.pick(ROLES),
    }


THEME_DEFINITIONS = [
    {
        "id": "theme-shortcuts",
        "name": "OneLake shortcut reliability",
        "description": "Broken shortcuts after token rotation, S3 permissions, and endorsement of shortcut objects.",
        "keywords": ["shortcut", "shortcuts", "token rotate", "s3"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-direct-lake",
        "name": "Direct Lake fallback & performance",
        "description": "Direct Lake wins plus painful, quiet fallback to DirectQuery on executive dashboards.",
        "keywords": ["direct lake", "directquery", "fallback"],
        "polarity": "mixed",
    },
    {
        "id": "theme-copilot",
        "name": "Copilot accuracy & grounding",
        "description": "Strong SQL help next to hallucinated activities and incorrect DAX — users want grounded tool lists.",
        "keywords": ["copilot", "hallucinated", "dax", "double counted"],
        "polarity": "mixed",
    },
    {
        "id": "theme-spark-start",
        "name": "Spark / Livy session startup",
        "description": "Cold-start times, kernel crashes, and praise for session reuse.",
        "keywords": ["spark session", "livy", "notebook", "cold start", "2xlarge"],
        "polarity": "mixed",
    },
    {
        "id": "theme-dataflow",
        "name": "Dataflow Gen2 refresh trust",
        "description": "Silent refresh failures, staging lakehouse UX, and connector wins.",
        "keywords": ["dataflow gen2", "refresh failed", "staging lakehouse", "connector"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-eventstream",
        "name": "Eventstream latency & drops",
        "description": "p99 latency spikes and silent destination drops without dead-lettering.",
        "keywords": ["eventstream", "latency", "dropped", "eventhouse", "kql"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-pipelines",
        "name": "Pipeline orchestration UX",
        "description": "Timeouts, slow run history, child-pipeline parameters, and trigger misses after capacity pause.",
        "keywords": ["pipeline", "trigger", "foreach", "child pipeline", "run history"],
        "polarity": "mixed",
    },
    {
        "id": "theme-adf-migration",
        "name": "ADF → Fabric pipeline migration",
        "description": "Parity gaps, activity mapping, and confusion between ADF and Fabric Data Factory.",
        "keywords": ["adf", "azure data factory", "migration", "parity", "data factory"],
        "polarity": "mixed",
    },
    {
        "id": "theme-capacity",
        "name": "Capacity SKU, billing & metrics",
        "description": "F64 pause traps, warehouse bill spikes, lagging capacity metrics, SKU confusion.",
        "keywords": ["f64", "capacity", "bill", "sku", "bursting", "metrics app", "cu"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-warehouse",
        "name": "Warehouse compute & T-SQL",
        "description": "T-SQL completeness vs inconsistent caching and warehouse-vs-lakehouse guidance.",
        "keywords": ["warehouse", "t-sql", "result set caching", "sql endpoint"],
        "polarity": "mixed",
    },
    {
        "id": "theme-governance",
        "name": "Endorsement & admin monitoring",
        "description": "Unclear endorsement model and monitoring hub gaps versus workspace truth.",
        "keywords": ["endorsed", "certified", "endorsement", "monitoring hub", "private links"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-positioning",
        "name": "Migration & competitive positioning",
        "description": "ADF migration, Premium-to-Fabric moves, and Fabric vs Databricks for mid-size teams.",
        "keywords": ["databricks", "premium", "skus", "synapse"],
        "polarity": "mixed",
    },
    {
        "id": "theme-naming",
        "name": "Naming, docs & decision trees",
        "description": "Activator vs Reflex, Dataflow vs Copy vs Spark, and conflicting Learn articles.",
        "keywords": ["activator", "reflex", "decision tree", "docs", "guidance", "naming"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-gov-pipelines",
        "name": "USGov pipeline parity",
        "description": "Government cloud customers want commercial pipeline feature parity — managed VNet, CI/CD, richer diagnostics.",
        "keywords": ["usgov", "gov cloud", "government", "il4", "il5", "fedramp"],
        "polarity": "want",
        "cloudBoundary": "usgov",
    },
    {
        "id": "theme-gov-private-link",
        "name": "Private link & sovereign networking",
        "description": "Private endpoints, sovereign DNS, and cross-boundary shortcut networking for IL7 / IL6 estates.",
        "keywords": ["private endpoint", "sovereign", "il7", "il6", "air-gapped"],
        "polarity": "want",
    },
    {
        "id": "theme-retry-diagnostics",
        "name": "Richer pipeline retry diagnostics",
        "description": "Authors want actionable retry / timeout diagnostics instead of opaque failed states.",
        "keywords": ["retry", "timed out", "diagnostics", "failed"],
        "polarity": "want",
    },
    {
        "id": "theme-session-reuse",
        "name": "Default Spark session reuse",
        "description": "Praise for Livy session reuse; request to make it the default cold-start fix.",
        "keywords": ["session reuse", "game changer", "cold start"],
        "polarity": "want",
    },
    {
        "id": "theme-dead-letter",
        "name": "Eventstream dead-lettering",
        "description": "Silent drops without dead-letter queues; customers ask for durable failure paths.",
        "keywords": ["dead-letter", "silently dropped", "partition"],
        "polarity": "want",
    },
    {
        "id": "theme-copilot-grounding",
        "name": "Grounded Copilot tool lists",
        "description": "Stop hallucinated pipeline activities; ship workspace-aware, grounded tool catalogs.",
        "keywords": ["grounded", "fuzzylookup", "hallucinated", "tool list"],
        "polarity": "want",
    },
    {
        "id": "theme-managed-vnet",
        "name": "Managed VNet & IR parity",
        "description": "Customers want managed VNet / IR options closer to ADF for hybrid connectivity.",
        "keywords": ["managed vnet", "integration runtime", "self-hosted", "hybrid"],
        "polarity": "want",
    },
    {
        "id": "theme-cicd",
        "name": "Pipeline CI/CD & deployment pipelines",
        "description": "Git integration, deployment pipelines, and parameter promotion across environments.",
        "keywords": ["ci/cd", "deployment pipeline", "git integration", "parameter"],
        "polarity": "want",
    },
    {
        "id": "theme-cu-throttling",
        "name": "CU throttling & concurrency",
        "description": "Capacity unit spikes, concurrent pipeline throttling, and unclear CU attribution.",
        "keywords": ["throttl", "concurrency", "capacity unit", "cu spike"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-onelake-catalog",
        "name": "OneLake catalog discoverability",
        "description": "Domain folders, search, and lineage discoverability in the OneLake catalog.",
        "keywords": ["onelake catalog", "domain folder", "lineage", "discover"],
        "polarity": "mixed",
    },
    {
        "id": "theme-sovereign-parity",
        "name": "Sovereign feature lag vs commercial",
        "description": "USGov / IL7 / IL6 customers tracking commercial GA dates and asking for parity roadmaps.",
        "keywords": ["parity roadmap", "feature lag", "sovereign cloud", "commercial ga"],
        "polarity": "want",
    },

    {
        "id": "theme-connectors",
        "name": "Connector coverage & throughput",
        "description": "SAP/Oracle/SQL connector gaps, throughput limits, and self-hosted IR dependency for enterprise sources.",
        "keywords": ["connector", "sap connector", "oracle", "throughput", "self-hosted ir"],
        "polarity": "mixed",
    },
    {
        "id": "theme-monitoring",
        "name": "Monitoring, alerts & observability",
        "description": "Missing alerts on pipeline failures, metrics lag, and dual truths between monitoring hub and workspace.",
        "keywords": ["monitoring", "alert", "observability", "metrics app", "monitoring hub"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-medallion",
        "name": "Medallion architecture guidance",
        "description": "Lakehouse-only vs warehouse-at-gold debates; teams want a clear medallion decision tree.",
        "keywords": ["medallion", "bronze", "silver", "gold lakehouse", "star schema"],
        "polarity": "mixed",
    },
    {
        "id": "theme-sql-endpoint",
        "name": "Lakehouse SQL endpoint reliability",
        "description": "SQL endpoint cold starts, permission quirks, and warehouse-vs-endpoint chooser confusion.",
        "keywords": ["sql endpoint", "lakehouse sql", "tds", "endpoint"],
        "polarity": "mixed",
    },
    {
        "id": "theme-delta-optimize",
        "name": "Delta OPTIMIZE & V-Order",
        "description": "Praise for OPTIMIZE + V-Order wins on Direct Lake; ask for scheduling and auto-compaction guidance.",
        "keywords": ["delta optimize", "v-order", "optimize", "compaction"],
        "polarity": "mixed",
    },
    {
        "id": "theme-capacity-pause",
        "name": "Capacity pause / resume footguns",
        "description": "Paused F SKUs silently miss scheduled triggers and confuse cost-saving weekends.",
        "keywords": ["capacity pause", "resume", "weekend pause", "f64 pause"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-expression-builder",
        "name": "Pipeline expression builder UX",
        "description": "Nested expressions, ForEach readability, and expression syntax disagreements in docs.",
        "keywords": ["expression builder", "expression syntax", "nested foreach", "pipeline expression"],
        "polarity": "mixed",
    },
    {
        "id": "theme-webhook-triggers",
        "name": "Webhook & event-driven triggers",
        "description": "Customers want native webhook triggers to retire Logic App hops for pipeline starts.",
        "keywords": ["webhook", "webhook trigger", "event-driven", "logic app"],
        "polarity": "want",
    },
    {
        "id": "theme-semantic-model",
        "name": "Semantic model refresh vs Direct Lake",
        "description": "Authors schedule useless refreshes on Direct Lake models; mode semantics still confusing.",
        "keywords": ["semantic model", "model refresh", "direct lake", "refresh schedule"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-mlflow",
        "name": "MLflow & model deployment path",
        "description": "Enough MLflow for small teams; online endpoint happy path still fuzzy vs Azure ML leftovers.",
        "keywords": ["mlflow", "online endpoint", "model deploy", "scoring"],
        "polarity": "mixed",
    },
    {
        "id": "theme-gpu-spark",
        "name": "GPU Spark queue transparency",
        "description": "GPU jobs queue forever on shared capacity with no visibility into wait time.",
        "keywords": ["gpu spark", "gpu queue", "shared capacity", "scoring sla"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-private-links",
        "name": "Private links (commercial networking)",
        "description": "Private endpoints for workspaces and OneLake shortcuts — blogs disagree with Learn.",
        "keywords": ["private link", "private endpoint", "private links", "networking"],
        "polarity": "want",
    },
    {
        "id": "theme-sku-confusion",
        "name": "SKU & F-SKU sizing confusion",
        "description": "F64 vs F128 vs Premium leftovers; CU math feels like a consulting engagement.",
        "keywords": ["sku", "f64", "f128", "premium", "sizing"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-metrics-lag",
        "name": "Capacity metrics lag",
        "description": "2-hour metrics lag makes CU spike investigation guesswork for ops teams.",
        "keywords": ["metrics lag", "capacity metrics", "cu spike", "near-real-time"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-parameter-promotion",
        "name": "Environment parameter promotion",
        "description": "Dev/Test/Prod parameter promotion across deployment pipelines still under-documented.",
        "keywords": ["parameter promotion", "environment", "dev/test/prod", "linked service"],
        "polarity": "want",
    },
    {
        "id": "theme-child-pipelines",
        "name": "Child pipeline orchestration",
        "description": "Parameter passing, failure bubbling, and parent/child status inconsistencies.",
        "keywords": ["child pipeline", "parent pipeline", "failure bubbling", "orchestration"],
        "polarity": "mixed",
    },
    {
        "id": "theme-copy-activity",
        "name": "Copy activity reliability",
        "description": "Long-running ADLS pulls, retry policy weaker than ADF, opaque timeout failures.",
        "keywords": ["copy activity", "adls pull", "retry policy", "timed out"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-kql-eventhouse",
        "name": "KQL & Eventhouse on OneLake",
        "description": "Strong KQL praise; Eventhouse-on-OneLake architecture still needs clearer dual-query guidance.",
        "keywords": ["kql", "eventhouse", "adx", "dual-query"],
        "polarity": "mixed",
    },
    {
        "id": "theme-workspace-identity",
        "name": "Workspace identity & auth mental models",
        "description": "Workspace identity vs user vs service principal — three models for shortcuts and pipelines.",
        "keywords": ["workspace identity", "service principal", "auth", "token rotate"],
        "polarity": "dont-like",
    },
    {
        "id": "theme-git-integration",
        "name": "Git integration for workspaces",
        "description": "Git integration wins for pipelines; branch policies and multi-item commits still rough edges.",
        "keywords": ["git integration", "branch", "workspace git", "source control"],
        "polarity": "mixed",
    },
]


def T(text_fn, score):
    return {"text": text_fn, "score": score}


PIPELINE_TEMPLATES = [
    T(lambda: f'Fabric pipeline copy activity timed out after {rng.int(1, 3)} hours on a {rng.int(100, 800)}GB ADLS pull. Need better retry diagnostics, not just "failed".', (-0.75, -0.4)),
    T(lambda: f'Finally got ForEach + Switch in Fabric Pipelines behaving like ADF. Migration of our {rng.int(20, 120)}-pipeline estate is actually plausible now.', (0.55, 0.85)),
    T(lambda: f'Is the pipeline run history UI still this slow for everyone? Opening a run with {rng.int(80, 300)} activities takes forever on F64. Makes debugging painful.', (-0.6, -0.3)),
    T(lambda: 'Quick Q: best pattern for passing parameters to child pipelines in Fabric? Docs show two styles and they disagree on expression syntax.', (-0.1, 0.15)),
    T(lambda: 'Paused our F64 over the weekend to save cost. Monday morning a scheduled trigger silently missed. Capacity pause + pipeline triggers is still a trap.', (-0.8, -0.5)),
    T(lambda: 'ADF veterans: which pipeline activities still have parity gaps in Fabric Data Factory? We are mapping our azure data factory estate and the migration checklist is incomplete.', (-0.2, 0.2)),
    T(lambda: 'Still confused — is Fabric Pipelines just ADF rebranded or a different product? The azure data factory docs and Fabric Learn pages contradict each other on IR options.', (-0.35, -0.05)),
    T(lambda: 'Managed VNet for Fabric pipelines would unblock our hybrid SQL sources. Right now we are stuck comparing self-hosted IR patterns from ADF.', (0.2, 0.55)),
    T(lambda: 'Pipeline CI/CD via git integration finally clicked for our team. Deployment pipeline parameter promotion still needs clearer guidance though.', (0.35, 0.7)),
    T(lambda: 'Hit a CU spike mid-day — three concurrent pipelines got throttled with almost no diagnostics. Capacity unit attribution in the metrics app is folklore.', (-0.7, -0.35)),
    T(lambda: 'Copy activity retry policy in Fabric pipelines still feels weaker than ADF. Same source, same sink, more opaque failures.', (-0.55, -0.25)),
    T(lambda: 'Love the new pipeline expression builder. Nested ForEach + child pipeline params are finally readable. Nice UX win.', (0.55, 0.85)),
    T(lambda: 'Our ADF migration hit a wall on tumbling window triggers. Fabric trigger options do not map 1:1 — anyone have a parity matrix?', (-0.4, -0.1)),
    T(lambda: f'Fabric pipeline run history filters by status are better this month, but searching across {rng.int(200, 900)} runs is still rough.', (-0.25, 0.15)),
    T(lambda: 'Please ship richer pipeline timeout diagnostics. "Timed out" without which activity / which retry attempt is not actionable.', (-0.5, -0.2)),
    T(lambda: 'Migrating from azure data factory: lookup + until activity parity is good enough now. Conditional split still feels half-baked.', (0.1, 0.4)),
    T(lambda: 'Scheduled pipeline trigger fired twice after a capacity resume. We need idempotent trigger replay, not silent duplicates.', (-0.65, -0.35)),
    T(lambda: 'Child pipeline failure bubbling is inconsistent — parent shows succeeded while child failed. Classic orchestration footgun.', (-0.6, -0.3)),
    T(lambda: 'Integration runtime story in Fabric vs ADF is the #1 confusion in every migration workshop I run. Docs need a decision tree.', (-0.3, 0.05)),
    T(lambda: 'Notebook activity inside a Fabric pipeline is solid for our medallion jobs. Orchestration + Spark in one place is the pitch delivered.', (0.6, 0.85)),
    T(lambda: 'Anyone else seeing pipeline concurrency throttling on F64 when CU sits under 70%? Feels like a hidden limit.', (-0.55, -0.2)),
    T(lambda: 'ADF mapping data flows to Fabric: we are splitting into Dataflow Gen2 + pipelines. Migration guidance still thin on complex transforms.', (-0.25, 0.1)),
    T(lambda: 'Pipeline activity duration charts in run history helped us catch a slow copy. More of that observability please.', (0.4, 0.7)),
    T(lambda: 'Webhook triggers for Fabric pipelines would replace a brittle Logic App hop. Feature request from every customer this week.', (0.25, 0.55)),
    T(lambda: 'Parameterizing linked services during ADF to Fabric migration is painful. Environment promotion needs first-class support.', (-0.5, -0.2)),
    T(lambda: 'Fabric Data Factory naming vs azure data factory still derails stakeholder meetings. Please publish a one-pager on what is parity vs what is new.', (-0.25, 0.1)),
    T(lambda: 'Self-hosted integration runtime on Fabric pipelines works for our hybrid estate, but managed vnet would retire two jump boxes.', (0.15, 0.45)),
    T(lambda: 'Git integration for pipelines is good; deployment pipeline gates across Dev/Test/Prod still need clearer parameter docs.', (0.25, 0.55)),
    T(lambda: 'Copy activity on a large ADLS pull timed out again — retry policy still weaker than ADF for the same sink.', (-0.6, -0.3)),
    T(lambda: 'Child pipeline failure bubbling bit us: parent succeeded while child failed. Orchestration status needs one truth.', (-0.65, -0.3)),
    T(lambda: 'Webhook trigger for Fabric pipelines would let us drop a Logic App hop. Event-driven starts are table stakes.', (0.25, 0.55)),
    T(lambda: 'Expression builder nested ForEach is readable now; pipeline expression syntax in Learn still disagrees with the UI.', (-0.15, 0.25)),
    T(lambda: 'Parameter promotion across Dev/Test/Prod deployment pipelines is the CI/CD blocker for our linked service secrets.', (-0.45, -0.1)),
    T(lambda: 'Git integration for pipeline source control is solid; branch policies on multi-item commits still rough.', (0.3, 0.6)),
    T(lambda: 'Capacity pause over the weekend + missed Monday trigger — F64 pause footgun is still undefeated.', (-0.75, -0.45)),
    T(lambda: 'Observability win: pipeline activity duration charts caught our slow copy. More monitoring like that please.', (0.4, 0.7)),
]

PIPELINE_GOV = [
    {"text": lambda: 'USGov Fabric pipelines still lag commercial on managed VNet. Our IL4 estate cannot ship until gov cloud parity lands.', "score": (-0.4, 0.35), "cloud": "usgov"},
    {"text": lambda: 'FedRAMP path question: is pipeline CI/CD via Azure DevOps service connection supported in USGov yet? Government customers need a clear answer.', "score": (-0.15, 0.25), "cloud": "usgov"},
    {"text": lambda: 'IL7 private endpoint for pipeline data movement is still a gap vs commercial. Sovereign networking docs are sparse.', "score": (-0.45, 0.2), "cloud": "il7"},
    {"text": lambda: 'IL6 air-gapped pipeline diagnostics are basically nonexistent. We need a parity roadmap for sovereign cloud orchestration.', "score": (-0.5, 0.15), "cloud": "il6"},
    {"text": lambda: 'IL5 shop here — Fabric pipeline feature lag vs commercial GA is killing our migration from ADF in government.', "score": (-0.55, -0.1), "cloud": "usgov"},
]

DE_TEMPLATES = [
    T(lambda: f'Spark session took {rng.int(5, 12)} minutes to start in a Fabric notebook this morning. Cold start on a 2xlarge is still the #1 complaint from my team.', (-0.7, -0.4)),
    T(lambda: f'Delta OPTIMIZE + V-Order on our gold lakehouse tables is solid. Downstream Direct Lake reports dropped from {rng.int(5, 15)}s to under 1s.', (0.65, 0.9)),
    T(lambda: 'Notebook kernel crashed on 2xlarge while writing a Delta merge. No useful Livy log in the UI. Had to pull Spark history separately.', (-0.7, -0.4)),
    T(lambda: 'Looking for current best practice on medallion in Fabric — lakehouse-only vs warehouse at gold. What are teams actually shipping in 2026?', (-0.05, 0.2)),
    T(lambda: 'Livy session reuse in Fabric notebooks is a game changer. Second job on the same session starts in seconds. Please make this the default.', (0.65, 0.9)),
    T(lambda: 'Spark session pool warm-up still unpredictable on shared capacity. Cold start variance wrecks our morning SLA.', (-0.55, -0.25)),
    T(lambda: 'Notebook + pipeline orchestration for bronze to silver is working well. Livy logs in-product would seal it.', (0.35, 0.65)),
    T(lambda: 'Delta OPTIMIZE + V-Order scheduled nightly — Direct Lake gold stayed sub-second. Compaction guidance finally clicked.', (0.55, 0.85)),
    T(lambda: 'Lakehouse SQL endpoint cold start still surprises analysts. TDS connectivity is fine once warm.', (-0.45, -0.1)),
    T(lambda: 'Medallion question again: bronze/silver in lakehouse, gold in warehouse — or gold lakehouse + Direct Lake?', (-0.05, 0.2)),
]

DI_TEMPLATES = [
    T(lambda: 'Dataflow Gen2 refresh failed silently overnight. Pipeline said succeeded, downstream lakehouse empty. Silent-fail path is a data-quality incident.', (-0.85, -0.55)),
    T(lambda: 'Why does every Dataflow Gen2 still push me into a staging lakehouse? UX makes first-time authors think they did something wrong.', (-0.5, -0.2)),
    T(lambda: f'The SAP connector set in Dataflow Gen2 just saved a multi-month extract project. {rng.int(20, 50)}+ connectors and no self-hosted IR. Impressed.', (0.7, 0.9)),
    T(lambda: f'When do you pick Dataflow Gen2 vs Pipeline copy vs Spark notebook for a {rng.int(20, 100)}GB SQL Server pull? Still no clean decision tree.', (-0.1, 0.15)),
    T(lambda: 'Dataflow Gen2 incremental refresh finally stable for us. Connector throughput on Oracle is the remaining gap.', (0.3, 0.6)),
    T(lambda: 'Oracle connector throughput in Dataflow Gen2 still bottlenecks our finance extract. Self-hosted IR feels inevitable.', (-0.5, -0.15)),
    T(lambda: 'SAP connector coverage is the reason we stayed on Fabric for ERP extracts — connector story is a real differentiator.', (0.55, 0.85)),
    T(lambda: 'When is a connector vs Spark notebook the right call for 80GB SQL Server? Still need that decision tree.', (-0.1, 0.15)),
]

ONELAKE_TEMPLATES = [
    T(lambda: 'OneLake shortcuts to ADLS broke after a token rotate. No alert, reports just went blank. Shortcut reliability is the thing I lose sleep over.', (-0.9, -0.6)),
    T(lambda: 'OneLake explorer is so much nicer than browsing ADLS. Domain folders + shortcuts finally feel like a data mesh.', (0.6, 0.85)),
    T(lambda: 'Shortcut to AWS S3 is still a permissions nightmare. IAM + OneLake roles + workspace identity — three mental models for one path.', (-0.65, -0.35)),
    T(lambda: 'Single copy of data in OneLake is actually working for our domains this quarter. No more three gold copies. Pitch delivered.', (0.65, 0.9)),
    T(lambda: 'Can OneLake shortcuts be endorsed / certified the same way as lakehouse tables? Stewards want first-class endorsement on the shortcut.', (-0.05, 0.25)),
    T(lambda: 'OneLake catalog search improved, but lineage discoverability across shortcuts is still weak. Domain folder UX helps though.', (-0.2, 0.3)),
    T(lambda: 'Workspace identity vs service principal for OneLake shortcuts — three auth mental models, one token rotate outage.', (-0.55, -0.2)),
    T(lambda: 'Private link to OneLake shortcuts works in our commercial tenant now; Learn still lags the blogs.', (0.2, 0.5)),
]

WH_TEMPLATES = [
    T(lambda: f'Warehouse compute bill spiked overnight with no new workloads. Capacity metrics app lagged {rng.int(1, 3)} hours. Painful.', (-0.8, -0.5)),
    T(lambda: 'T-SQL surface in Fabric Warehouse is finally enough for our analysts. Retired the extra Synapse dedicated pool this week.', (0.65, 0.9)),
    T(lambda: 'Result set caching in the warehouse feels inconsistent. Same query, morning cache hit, afternoon full scan.', (-0.55, -0.25)),
    T(lambda: 'Honest question: warehouse vs lakehouse SQL endpoint for a star schema that Power BI will hit via Direct Lake?', (-0.05, 0.2)),
    T(lambda: 'Lakehouse SQL endpoint vs warehouse for our star schema — still no crisp guidance for Direct Lake consumers.', (-0.15, 0.2)),
    T(lambda: 'Near-real-time warehouse CU attribution would stop our overnight bill spike fire drills.', (-0.5, -0.15)),
]

RTA_TEMPLATES = [
    T(lambda: f'Eventstream latency spiked to {rng.int(20, 60)}s during a product launch. Eventhouse queries were fine — bottleneck was the stream. Need p99 latency SLOs.', (-0.75, -0.45)),
    T(lambda: 'KQL in Eventhouse is excellent. Moved ADX clusters over and the query experience is the same, with OneLake underneath.', (0.7, 0.92)),
    T(lambda: 'Eventstream destination to lakehouse silently dropped a partition. No dead-letter, no alert. Caught it because a KPI went flat.', (-0.85, -0.55)),
    T(lambda: 'Is it Activator or Reflex this month? Naming is still confusing customers in every workshop. Please pick one and update the docs.', (-0.25, 0.05)),
    T(lambda: 'Please add Eventstream dead-lettering to a lakehouse destination. Silently dropped events are unacceptable in prod.', (0.15, 0.45)),
    T(lambda: 'KQL in Eventhouse remains excellent — dual-query estate with OneLake underneath is the architecture we wanted.', (0.65, 0.9)),
    T(lambda: 'Eventhouse ADX migration done; monitoring for Eventstream destination health is the remaining gap.', (0.2, 0.5)),
]

DS_TEMPLATES = [
    T(lambda: 'MLflow tracking in Fabric Data Science is enough for our small team. Do not need a separate Databricks workspace for experiments anymore.', (0.55, 0.85)),
    T(lambda: 'GPU Spark jobs in Fabric still queue forever on shared capacity. Fine for demos, not fine for a weekly scoring SLA.', (-0.7, -0.4)),
    T(lambda: 'How are people deploying Fabric models to online endpoints in 2026? Notebook + pipeline + Azure ML leftover? Happy path still fuzzy.', (-0.1, 0.15)),
    T(lambda: 'MLflow tracking covers our experiments; online endpoint / model deploy happy path still fuzzy vs Azure ML leftovers.', (-0.15, 0.25)),
    T(lambda: 'GPU Spark queue on shared capacity blew our weekly scoring SLA — need queue transparency, not silence.', (-0.7, -0.35)),
]

PBI_TEMPLATES = [
    T(lambda: f'Direct Lake fallback to DirectQuery killed our exec dashboard. Users saw {rng.int(20, 50)}s tiles. Fallback needs a loud banner, not a quiet mode switch.', (-0.85, -0.55)),
    T(lambda: f'Direct Lake on OneLake gold tables is instant. Our F64 exec pack went from {rng.int(8, 20)}s to sub-second. This is the Fabric BI story I wanted.', (0.75, 0.95)),
    T(lambda: 'Semantic model refresh vs Direct Lake is still confusing new authors. They schedule a refresh that does nothing useful.', (-0.5, -0.2)),
    T(lambda: 'Visual calculations in Power BI are great. Replaced calculated columns we were ashamed of. Small feature, huge authoring win.', (0.55, 0.85)),
    T(lambda: 'Planning the Premium to Fabric F64 move. Capacity metrics + bursting still feel like folklore. Need a real sizing worksheet.', (-0.1, 0.2)),
    T(lambda: 'Semantic model refresh schedule on a Direct Lake model confused two new authors this week. Mode semantics need a banner.', (-0.5, -0.2)),
    T(lambda: 'F128 vs F64 sizing worksheet please — SKU confusion is eating our capacity planning meetings.', (-0.4, -0.05)),
]

COPILOT_TEMPLATES = [
    T(lambda: 'Copilot wrote DAX that double counted our sales grain. Looked confident, failed a basic test. Needs a guardrail before business users see it.', (-0.85, -0.5)),
    T(lambda: 'Copilot SQL in the warehouse got a multi-table join right on the first try, including the grain. Genuinely useful.', (0.65, 0.9)),
    T(lambda: 'Copilot hallucinated a Fabric pipeline activity that does not exist. Suggested "FuzzyLookupPlus". Needs grounded tool lists.', (-0.8, -0.5)),
    T(lambda: 'When will Copilot consistently see items in my workspace? Half the time it cannot find the lakehouse it is sitting next to.', (-0.3, 0.05)),
    T(lambda: 'Notebook Copilot comments on my Spark job were actually useful — caught a shuffle on a skewed key. Keeping it enabled.', (0.5, 0.8)),
    T(lambda: 'Please ship a grounded Copilot tool list for pipelines. Hallucinated activities are a trust-killer for junior authors.', (0.2, 0.5)),
]

GOVSEC_TEMPLATES = [
    T(lambda: 'Endorsed vs certified vs master data in Fabric is a mess. Stewards, owners, and execs each think the badge means something different.', (-0.6, -0.3)),
    T(lambda: 'Shortcut security finally inherited workspace + OneLake roles the way we expected. Closed audit findings this week.', (0.6, 0.85)),
    T(lambda: 'Admin monitoring hub is still missing pipeline failures that show up in the workspace. Cannot run a platform on two truths.', (-0.75, -0.45)),
    T(lambda: 'Is there official guidance yet for private links + OneLake shortcuts to ADLS in another tenant? Every blog disagrees with Learn.', (-0.1, 0.2)),
    T(lambda: 'Monitoring hub still disagrees with workspace pipeline failures. Observability cannot mean two truths.', (-0.7, -0.4)),
    T(lambda: 'Private links guidance for commercial Fabric finally usable; cross-tenant shortcut networking still sparse.', (-0.2, 0.25)),
]

OTHER_TEMPLATES = [
    T(lambda: 'Fabric September 2026 update looks stacked — Copilot in warehouse, Eventstream SLOs teaser, OneLake catalog polish. Shipping pace is real.', (0.55, 0.85)),
    T(lambda: 'Fabric vs Databricks for mid-size teams: we picked Fabric because Power BI + OneLake are the center of gravity. Synapse leftovers still haunt us.', (0.2, 0.55)),
    T(lambda: 'SKU confusion continues — F64 vs F128 vs Premium leftovers. Capacity unit math should not require a consulting engagement.', (-0.55, -0.2)),
    T(lambda: 'Metrics app lag makes capacity ops guesswork. CU spike investigation with a 2-hour delay is not an ops story.', (-0.65, -0.35)),
    T(lambda: 'Metrics lag on the capacity metrics app is still ~2 hours. Near-real-time CU is an ops requirement, not a nice-to-have.', (-0.65, -0.3)),
    T(lambda: 'SKU confusion — F64 vs F128 vs Premium leftovers — should not require a partner engagement to size.', (-0.55, -0.2)),
]

SOVEREIGN_FLAVOR = [
    {"text": lambda: 'Sovereign cloud question: when does commercial GA for pipeline managed VNet hit USGov? Feature lag is the whole conversation with our CISO.', "score": (-0.3, 0.35), "clouds": ["usgov", "il7", "il6"]},
    {"text": lambda: 'Need a parity roadmap for OneLake shortcuts in IL7 — private endpoint + sovereign DNS still blocking our mesh design.', "score": (-0.2, 0.4), "clouds": ["il7"]},
    {"text": lambda: 'IL6 air-gapped Spark session pool would change everything for our IL6 path. Until then we are on a painful dual-stack.', "score": (0.1, 0.5), "clouds": ["il6"]},
    {"text": lambda: 'Government Fabric tenants: Copilot grounding is even more critical — we cannot accept hallucinated activities in a FedRAMP boundary.', "score": (-0.25, 0.3), "clouds": ["usgov"]},
    {"text": lambda: 'USGov capacity metrics lag worse than commercial in our experience. Operating F SKUs without near-real-time CU is rough.', "score": (-0.55, -0.15), "clouds": ["usgov"]},
    {"text": lambda: 'Private endpoint guidance for IL6 OneLake still reads like a draft. Sovereign networking needs first-class Learn content.', "score": (-0.4, 0.1), "clouds": ["il6"]},
]

TEMPLATES_BY_WORKLOAD = {
    "pipelines": PIPELINE_TEMPLATES,
    "data-engineering": DE_TEMPLATES,
    "data-integration": DI_TEMPLATES,
    "onelake": ONELAKE_TEMPLATES,
    "data-warehouse": WH_TEMPLATES,
    "realtime-analytics": RTA_TEMPLATES,
    "data-science": DS_TEMPLATES,
    "power-bi": PBI_TEMPLATES,
    "copilot-ai": COPILOT_TEMPLATES,
    "security-governance": GOVSEC_TEMPLATES,
    "other": OTHER_TEMPLATES,
}


def build_mentions(n):
    """Seed per-workload×cloud floors, then fill to n with commercial-majority mix."""
    mentions = []
    mid = 1

    def push(workload, text, score_range, cloud=None, omit_cloud=False):
        nonlocal mid
        author = make_author()
        score = rng.float(score_range[0], score_range[1])
        mid_str = f"m{pad(mid)}"
        source_id = rng.pick_weighted(SOURCE_WEIGHTS)
        ext = external_id_for(source_id, mid_str)
        m = {
            "id": mid_str,
            **author,
            "text": text,
            "createdAt": random_iso(rng.pick(DATES)),
            "workload": workload,
            "sentiment": sentiment_from_score(score),
            "sentimentScore": score,
            "likes": rng.int(2, 240),
            "reposts": rng.int(0, 65),
            "replies": rng.int(0, 55),
            "sourceEntryId": source_id,
            "externalId": ext,
            "permalink": synthetic_permalink(source_id, ext),
        }
        mid += 1
        if not omit_cloud and cloud is not None:
            m["cloudBoundary"] = cloud
        mentions.append(m)

    def pick_template(workload, cloud):
        if (
            workload == "pipelines"
            and cloud in ("usgov", "il7", "il6")
            and rng.random() < 0.55
        ):
            gov = [t for t in PIPELINE_GOV if t["cloud"] == cloud] or PIPELINE_GOV
            t = rng.pick(gov)
            return t["text"](), t["score"]
        if cloud in ("usgov", "il7", "il6") and rng.random() < 0.45:
            flav = [t for t in SOVEREIGN_FLAVOR if cloud in t["clouds"]] or SOVEREIGN_FLAVOR
            t = rng.pick(flav)
            return t["text"](), t["score"]
        t = rng.pick(TEMPLATES_BY_WORKLOAD[workload])
        text = t["text"]()
        if rng.random() < 0.14:
            suffixes = [
                " Anyone else?",
                " Thread welcome.",
                " Happy to share our workaround.",
                " CC: Fabric product folks.",
                " Filing this as feedback.",
                f" Seeing this on {rng.pick(['East US', 'West Europe', 'Central US', 'North Europe'])}.",
            ]
            text = text.rstrip(".") + "." + rng.pick(suffixes)
        return text, t["score"]

    # --- Phase 1: hard floors per workload × required clouds ---
    floor_plan = [
        ("commercial", MIN_COMMERCIAL),
        ("usgov", MIN_USGOV),
        ("il7", MIN_IL7),
        ("il6", MIN_IL6),
    ]
    for workload in WORKLOADS:
        for cloud, need in floor_plan:
            for _ in range(need):
                text, score = pick_template(workload, cloud)
                push(workload, text, score, cloud)

    # Seed a few explicit pipeline gov + sovereign flavor rows for keyword coverage
    for t in PIPELINE_GOV:
        push("pipelines", t["text"](), t["score"], t["cloud"])
    for t in SOVEREIGN_FLAVOR:
        cloud = rng.pick(t["clouds"])
        wl = rng.pick_weighted([
            ("pipelines", 4),
            ("onelake", 2),
            ("data-engineering", 2),
            ("copilot-ai", 1),
            ("other", 1),
            ("security-governance", 1),
        ])
        push(wl, t["text"](), t["score"], cloud)

    # --- Phase 2: fill remainder with commercial-majority weights ---
    while len(mentions) < n:
        workload = rng.pick_weighted(WORKLOAD_WEIGHTS)
        cloud = rng.pick_weighted(CLOUD_FILL_WEIGHTS)
        text, score = pick_template(workload, cloud)
        omit = cloud == "commercial" and rng.random() < 0.16
        push(workload, text, score, None if omit else cloud, omit_cloud=omit)

    mentions.sort(key=lambda m: (m["createdAt"], m["id"]), reverse=True)
    return mentions


SEMESTER_PLANS = [
    {"id": "sem-fy26-h2", "name": "FY26 H2", "start": "2026-01-01", "end": "2026-06-30"},
    {"id": "sem-fy27-h1", "name": "FY27 H1", "start": "2026-07-01", "end": "2026-12-31"},
]

WI_TITLES = [
    ("pipelines", "feature", "Pipeline run history virtualization for large activity graphs"),
    ("pipelines", "epic", "USGov: managed VNet parity for Fabric pipelines"),
    ("pipelines", "feature", "USGov: pipeline CI/CD via Azure DevOps service connection"),
    ("pipelines", "feature", "Copy activity timeout diagnostics — surface retry reason codes"),
    ("pipelines", "bug", "Capacity pause → scheduled trigger miss: restore & alert"),
    ("pipelines", "feature", "Child pipeline parameter expression alignment"),
    ("pipelines", "feature", "Webhook trigger for Fabric pipelines"),
    ("pipelines", "feature", "ADF tumbling window trigger parity"),
    ("pipelines", "bug", "Parent pipeline success when child fails"),
    ("pipelines", "feature", "Pipeline concurrency / CU throttling diagnostics"),
    ("pipelines", "task", "Docs: ADF vs Fabric IR decision tree"),
    ("pipelines", "feature", "Integration runtime hybrid connectivity improvements"),
    ("pipelines", "feature", "Scheduled trigger idempotent replay after resume"),
    ("pipelines", "epic", "ADF → Fabric migration parity matrix (activities)"),
    ("pipelines", "feature", "ForEach + Switch UX polish"),
    ("power-bi", "feature", "Direct Lake fallback banner for authors and consumers"),
    ("power-bi", "feature", "Premium → F64 sizing worksheet in-product"),
    ("power-bi", "bug", "Semantic model refresh confusion with Direct Lake"),
    ("onelake", "feature", "OneLake shortcut health probe after credential rotate"),
    ("onelake", "feature", "IL7 private endpoint DNS for OneLake shortcuts"),
    ("onelake", "feature", "Shortcut-level endorsement / certification"),
    ("onelake", "feature", "OneLake catalog lineage for shortcuts"),
    ("onelake", "feature", "S3 shortcut IAM guidance & diagnostics"),
    ("realtime-analytics", "feature", "Eventstream dead-letter queue (lakehouse destination)"),
    ("realtime-analytics", "feature", "Eventstream p99 latency SLO + alerts"),
    ("realtime-analytics", "task", "Retire dual Activator / Reflex naming"),
    ("copilot-ai", "feature", "Copilot grounded activity catalog for pipelines"),
    ("copilot-ai", "feature", "DAX Copilot guardrails / verification tests"),
    ("copilot-ai", "feature", "Workspace-aware Copilot item discovery"),
    ("data-engineering", "epic", "IL6: air-gapped Spark session pool (IL6 path)"),
    ("data-engineering", "feature", "Default Livy session reuse in Fabric notebooks"),
    ("data-engineering", "bug", "Notebook kernel crash diagnostics on 2xlarge"),
    ("data-engineering", "feature", "In-product Livy / Spark history deep links"),
    ("data-integration", "feature", "Dataflow Gen2 success only after lakehouse commit"),
    ("data-integration", "feature", "Staging lakehouse UX simplification"),
    ("data-integration", "task", "Decision tree: Dataflow vs Copy vs Spark"),
    ("data-warehouse", "feature", "Near-real-time warehouse CU attribution"),
    ("data-warehouse", "bug", "Result set caching consistency"),
    ("data-warehouse", "feature", "Warehouse vs lakehouse SQL endpoint guidance"),
    ("security-governance", "feature", "Collapse endorsement into one steward-facing model"),
    ("security-governance", "bug", "Monitoring hub missing workspace pipeline failures"),
    ("security-governance", "feature", "Private links + cross-tenant shortcut guidance"),
    ("other", "feature", "Near-real-time capacity metrics (≤ 5 min)"),
    ("other", "feature", "SKU / CU sizing explainer in admin portal"),
    ("other", "epic", "Sovereign feature parity roadmap publication"),
    ("pipelines", "feature", "Managed VNet GA for commercial pipelines"),
    ("pipelines", "bug", "Duplicate trigger fire after capacity resume"),
    ("pipelines", "feature", "Pipeline expression builder nested param help"),
    ("pipelines", "task", "Learn: Fabric Data Factory vs ADF naming"),
    ("copilot-ai", "bug", "Hallucinated FuzzyLookupPlus activity"),
    ("onelake", "bug", "Blank reports after shortcut token expiry"),
    ("realtime-analytics", "bug", "Silent partition drop without alert"),
    ("data-science", "feature", "GPU Spark queue transparency on shared capacity"),
    ("data-science", "task", "Model-to-endpoint happy path docs"),
    ("power-bi", "feature", "Visual calculations authoring tips in-product"),
    ("pipelines", "feature", "USGov richer pipeline timeout diagnostics"),
    ("pipelines", "feature", "Environment parameter promotion for deployment pipelines"),
    ("onelake", "epic", "IL6 air-gap networking for OneLake shortcuts"),
    ("data-engineering", "feature", "Session pool warm-up SLA for morning jobs"),
    ("other", "bug", "Metrics app 2-hour lag on CU spikes"),
    ("security-governance", "feature", "FedRAMP boundary Copilot admin switches"),
    ("pipelines", "feature", "Lookup + Until activity parity checklist"),
    ("pipelines", "feature", "Conditional split activity completeness"),
    ("data-integration", "feature", "Oracle connector throughput improvements"),
    ("power-bi", "feature", "Direct Lake mode change timestamp in report"),
    ("pipelines", "feature", "Webhook trigger GA for Fabric pipelines"),
    ("pipelines", "bug", "Child pipeline failure bubbling to parent status"),
    ("pipelines", "feature", "Copy activity retry policy parity with ADF"),
    ("pipelines", "task", "Docs: pipeline expression builder nested syntax"),
    ("pipelines", "feature", "Git integration branch policy for multi-item commits"),
    ("pipelines", "feature", "Linked service parameter promotion Dev/Test/Prod"),
    ("data-integration", "feature", "Oracle connector throughput tier"),
    ("data-integration", "feature", "SAP connector incremental patterns guide"),
    ("data-integration", "task", "Connector vs Spark decision tree (Learn)"),
    ("onelake", "feature", "Workspace identity auth diagnostics for shortcuts"),
    ("onelake", "feature", "Commercial private link shortcut checklist"),
    ("data-warehouse", "feature", "Lakehouse SQL endpoint warm-pool option"),
    ("data-warehouse", "task", "Star schema: warehouse vs SQL endpoint chooser"),
    ("data-engineering", "feature", "Scheduled Delta OPTIMIZE / V-Order recipes"),
    ("data-engineering", "feature", "Medallion reference architectures (2026)"),
    ("realtime-analytics", "feature", "Eventhouse dual-query guidance with OneLake"),
    ("realtime-analytics", "task", "KQL migration from ADX checklist"),
    ("copilot-ai", "feature", "Copilot admin switches for connector suggestions"),
    ("power-bi", "bug", "Semantic model refresh no-op on Direct Lake — warn authors"),
    ("power-bi", "feature", "F64 vs F128 in-product sizing helper"),
    ("data-science", "feature", "MLflow to online endpoint happy path"),
    ("data-science", "bug", "GPU Spark queue wait-time visibility"),
    ("security-governance", "feature", "Unified monitoring alerts for pipeline + dataflow"),
    ("security-governance", "task", "Private links Learn vs blog reconciliation"),
    ("other", "feature", "Near-real-time capacity metrics bus (≤5 min)"),
    ("other", "bug", "Metrics app CU spike lag > 90 minutes"),
    ("other", "task", "SKU sizing explainer: F64 / F128 / Premium"),
    ("pipelines", "feature", "Observability: pipeline run alert webhooks"),
    ("onelake", "bug", "Token rotate without shortcut health probe"),
    ("pipelines", "epic", "Copy activity long-running ADLS reliability"),
]

STATES = ["New", "Active", "Resolved", "Proposed", "Closed", "Committed"]


def build_work_items():
    items = []
    for i, (workload, typ, title) in enumerate(WI_TITLES, start=1):
        ado_id = str(180000 + i * 17 + rng.int(0, 9))
        lower = title.lower()
        if any(k in lower for k in ("usgov", "fedramp", "government")):
            cloud = "usgov"
        elif "il7" in lower:
            cloud = "il7"
        elif any(k in lower for k in ("il6", "air-gap")):
            cloud = "il6"
        elif "sovereign" in lower:
            cloud = rng.pick(["usgov", "il7", "il6"])
        elif rng.random() < 0.08:
            cloud = rng.pick(["usgov", "il7", "il6", "unknown"])
        else:
            cloud = "commercial"
        items.append({
            "id": f"wi-{1000 + i}",
            "adoId": ado_id,
            "title": title,
            "type": typ,
            "state": rng.pick(STATES),
            "workload": workload,
            "semesterId": "sem-fy26-h2" if rng.random() < 0.25 else "sem-fy27-h1",
            "cloudBoundary": cloud,
            "url": f"https://dev.azure.com/demo/Fabric/_workitems/edit/{ado_id}",
        })
    i = len(items)
    while len(items) < 100:
        i += 1
        wl = rng.pick(WORKLOADS)
        ado_id = str(190000 + i * 13)
        items.append({
            "id": f"wi-{1000 + i}",
            "adoId": ado_id,
            "title": f"{rng.pick(['Improve', 'Harden', 'Document', 'Fix', 'Ship'])} {wl} {rng.pick(['reliability', 'observability', 'docs', 'parity', 'UX', 'diagnostics'])} ({pad(i, 3)})",
            "type": rng.pick(["feature", "bug", "task"]),
            "state": rng.pick(STATES),
            "workload": wl,
            "semesterId": "sem-fy27-h1",
            "cloudBoundary": rng.pick_weighted([
                ("commercial", 85),
                ("usgov", 7),
                ("il7", 3),
                ("il6", 3),
                ("unknown", 2),
            ]),
            "url": f"https://dev.azure.com/demo/Fabric/_workitems/edit/{ado_id}",
        })
    return items


def build_deps(work_items):
    def find_ids(pred, n=1):
        return [w["id"] for w in work_items if pred(w)][:n]

    deps = [
        {
            "id": "dep-01",
            "title": "Networking: sovereign private DNS zones for USGov Fabric",
            "fromTeam": "Fabric Pipelines",
            "toTeam": "Azure Networking",
            "state": "Accepted",
            "relatedWorkItemIds": find_ids(lambda w: "USGov: managed" in w["title"]),
            "semesterId": "sem-fy27-h1",
            "cloudBoundary": "usgov",
        },
        {
            "id": "dep-02",
            "title": "Identity: IL7 managed identity for OneLake shortcut refresh",
            "fromTeam": "OneLake",
            "toTeam": "Azure Identity",
            "state": "In review",
            "relatedWorkItemIds": find_ids(lambda w: "IL7" in w["title"]),
            "semesterId": "sem-fy27-h1",
            "cloudBoundary": "il7",
        },
        {
            "id": "dep-03",
            "title": "Capacity platform: pause/resume trigger coordination",
            "fromTeam": "Fabric Pipelines",
            "toTeam": "Fabric Capacity",
            "state": "Done",
            "relatedWorkItemIds": find_ids(lambda w: "Capacity pause" in w["title"]),
            "semesterId": "sem-fy26-h2",
            "cloudBoundary": "commercial",
        },
    ]
    extras = [
        ("Copilot grounded catalog needs Pipelines activity schema export", "Copilot", "Fabric Pipelines", "commercial"),
        ("Dead-letter lakehouse sink depends on OneLake write path SLA", "Real-Time Intelligence", "OneLake", "commercial"),
        ("Direct Lake banner needs report viewer chrome hook", "Power BI / Direct Lake", "Power BI platform", "commercial"),
        ("Livy default reuse needs capacity scheduler change", "Spark runtime", "Fabric Capacity", "commercial"),
        ("Dataflow commit signal for pipeline activity status", "Data Integration", "Fabric Pipelines", "commercial"),
        ("IL6 Spark pool depends on sovereign networking", "Spark runtime", "Azure Networking", "il6"),
        ("Monitoring hub pipeline failure ingest from workspace runtime", "Purview / Governance", "Fabric Pipelines", "commercial"),
        ("ADF migration Learn content needs Pipelines + DI sign-off", "Docs", "Fabric Pipelines", "commercial"),
        ("CU metrics ≤5 min depends on capacity platform telemetry bus", "Fabric Capacity", "Platform telemetry", "commercial"),
        ("Gov CI/CD service connection depends on Azure DevOps gov stamp", "Fabric Pipelines", "Azure DevOps", "usgov"),
        ("Shortcut endorsement model shared with Purview glossary", "OneLake", "Purview / Governance", "commercial"),
        ("Private endpoint DNS for IL7 OneLake", "OneLake", "Azure Networking", "il7"),
        ("Warehouse CU attribution shares metrics pipeline with capacity app", "Warehouse", "Fabric Capacity", "commercial"),
        ("Activator/Reflex rename needs Docs + product chrome lockstep", "Real-Time Intelligence", "Docs", "commercial"),
        ("Connector throughput telemetry shared with capacity metrics", "Data Integration", "Fabric Capacity", "commercial"),
        ("Webhook trigger control-plane depends on Event Grid stamp", "Fabric Pipelines", "Azure Event Grid", "commercial"),
        ("SQL endpoint warm-pool needs capacity scheduler hooks", "Warehouse", "Fabric Capacity", "commercial"),
        ("Delta OPTIMIZE scheduler shares notebook job runtime", "Spark runtime", "Data Engineering", "commercial"),
        ("Private link commercial checklist needs Networking sign-off", "OneLake", "Azure Networking", "commercial"),
        ("MLflow endpoint path depends on Azure ML residual APIs", "Data Science", "Azure ML", "commercial"),
        ("GPU queue visibility needs capacity platform queue API", "Data Science", "Fabric Capacity", "commercial"),
        ("Semantic model Direct Lake banner shares report chrome", "Power BI / Direct Lake", "Power BI platform", "commercial"),
        ("Git branch policies need Azure DevOps fabric extension", "Fabric Pipelines", "Azure DevOps", "commercial"),
        ("Monitoring alert webhooks depend on admin platform bus", "Purview / Governance", "Admin platform", "commercial"),
    ]
    for i, (title, frm, to, cloud) in enumerate(extras, start=4):
        related = [rng.pick(work_items)["id"]]
        if rng.random() < 0.4:
            related.append(rng.pick(work_items)["id"])
        deps.append({
            "id": f"dep-{pad(i, 2)}",
            "title": title,
            "fromTeam": frm,
            "toTeam": to,
            "state": rng.pick(["New", "In review", "Accepted", "Blocked", "Done"]),
            "relatedWorkItemIds": list(dict.fromkeys(related)),
            "semesterId": "sem-fy27-h1",
            "cloudBoundary": cloud,
        })
    return deps


def build_mappings(theme_defs, work_items, deps):
    mappings = []
    idx = 1

    def wi(pred, n=2):
        return [w["id"] for w in work_items if pred(w)][:n]

    def add(**kwargs):
        nonlocal idx
        row = {"id": f"map-{pad(idx, 3)}", "semesterId": "sem-fy27-h1", **kwargs}
        mappings.append(row)
        idx += 1

    add(
        themeId="theme-pipelines",
        workItemIds=wi(lambda w: w["workload"] == "pipelines", 3),
        dependencyIds=["dep-03"],
        coverage="partial",
        notes="Run history + pause trap covered; child-pipeline param docs still open.",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-adf-migration",
        workItemIds=wi(lambda w: any(k in w["title"] for k in ("ADF", "migration", "parity")), 3),
        coverage="partial",
        notes="Parity matrix epic filed; IR decision tree still a gap.",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-gov-pipelines",
        workItemIds=wi(lambda w: w.get("cloudBoundary") == "usgov" and w["workload"] == "pipelines", 2),
        dependencyIds=["dep-01"],
        coverage="covered",
        notes="USGov managed VNet + CI/CD in FY27 H1.",
        cloudBoundary="usgov",
        workload="pipelines",
    )
    add(
        themeId="theme-retry-diagnostics",
        workItemIds=wi(lambda w: any(k in w["title"].lower() for k in ("timeout", "diagnos", "retry")), 2),
        coverage="covered",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-retry-diagnostics",
        workItemIds=[],
        coverage="gap",
        notes="USGov customers hitting same timeouts — no gov-scoped work item yet.",
        cloudBoundary="usgov",
        workload="pipelines",
    )
    add(
        themeId="theme-shortcuts",
        workItemIds=wi(lambda w: "shortcut" in w["title"].lower(), 2),
        coverage="partial",
        notes="Health probe in flight; S3 IAM mental model still a gap.",
        cloudBoundary="commercial",
        workload="onelake",
    )
    add(
        themeId="theme-gov-private-link",
        workItemIds=wi(lambda w: w.get("cloudBoundary") == "il7", 1),
        dependencyIds=["dep-02"],
        coverage="partial",
        notes="IL7 DNS work started; IL6 path not scheduled.",
        cloudBoundary="il7",
        workload="onelake",
    )
    add(
        themeId="theme-gov-private-link",
        workItemIds=[],
        coverage="gap",
        notes="IL6 air-gap networking — strong ask, no plan yet.",
        cloudBoundary="il6",
        workload="onelake",
    )
    add(
        themeId="theme-direct-lake",
        workItemIds=wi(lambda w: "Direct Lake" in w["title"], 2),
        coverage="covered",
        cloudBoundary="commercial",
        workload="power-bi",
    )
    add(
        themeId="theme-dead-letter",
        workItemIds=wi(lambda w: "dead-letter" in w["title"].lower(), 1),
        coverage="covered",
        cloudBoundary="commercial",
        workload="realtime-analytics",
    )
    add(
        themeId="theme-eventstream",
        workItemIds=wi(lambda w: any(k in w["title"] for k in ("Eventstream", "dead-letter")), 2),
        coverage="partial",
        notes="Dead-letter covers drops; p99 SLO work thin.",
        cloudBoundary="commercial",
        workload="realtime-analytics",
    )
    add(
        themeId="theme-copilot-grounding",
        workItemIds=wi(lambda w: any(k in w["title"] for k in ("grounded", "FuzzyLookup")), 2),
        coverage="covered",
        cloudBoundary="commercial",
        workload="copilot-ai",
    )
    add(
        themeId="theme-copilot",
        workItemIds=wi(lambda w: any(k in w["title"] for k in ("Copilot", "DAX")), 2),
        coverage="partial",
        notes="Grounding catalog helps pipelines; DAX guardrails still open.",
        cloudBoundary="commercial",
        workload="copilot-ai",
    )
    add(
        themeId="theme-session-reuse",
        workItemIds=wi(lambda w: "Livy" in w["title"] or "session reuse" in w["title"].lower(), 1),
        coverage="covered",
        cloudBoundary="commercial",
        workload="data-engineering",
    )
    add(
        themeId="theme-spark-start",
        workItemIds=wi(lambda w: w.get("cloudBoundary") == "il6", 1),
        coverage="partial",
        notes="IL6 pool proposed; commercial cold-start still noisy.",
        cloudBoundary="il6",
        workload="data-engineering",
    )
    add(
        themeId="theme-dataflow",
        workItemIds=[],
        coverage="gap",
        notes="Silent refresh fail — loud signal, no active semester item.",
        cloudBoundary="commercial",
        workload="data-integration",
    )
    add(
        themeId="theme-capacity",
        workItemIds=[],
        coverage="gap",
        notes="Metrics lag / SKU confusion — backlog thin.",
        cloudBoundary="commercial",
        workload="other",
    )
    add(
        themeId="theme-naming",
        workItemIds=[],
        coverage="gap",
        notes="Activator vs Reflex naming — no ownership yet.",
        cloudBoundary="commercial",
    )
    add(
        themeId="theme-pipelines",
        workItemIds=wi(lambda w: w.get("cloudBoundary") == "usgov", 1),
        coverage="partial",
        notes="Gov customers inherit commercial UX pain; only VNet epic filed.",
        cloudBoundary="usgov",
        workload="pipelines",
    )
    add(
        themeId="theme-managed-vnet",
        workItemIds=wi(lambda w: any(k in w["title"].lower() for k in ("managed vnet", "integration runtime", "hybrid")), 2),
        coverage="partial",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-cicd",
        workItemIds=wi(lambda w: any(k in w["title"].lower() for k in ("ci/cd", "deployment pipeline", "parameter")), 2),
        coverage="covered",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-cu-throttling",
        workItemIds=wi(lambda w: any(k in w["title"].lower() for k in ("throttl", "cu", "concurrency")), 2),
        coverage="partial",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-onelake-catalog",
        workItemIds=wi(lambda w: any(k in w["title"].lower() for k in ("catalog", "lineage")), 1),
        coverage="partial",
        cloudBoundary="commercial",
        workload="onelake",
    )
    add(
        themeId="theme-sovereign-parity",
        workItemIds=wi(lambda w: "parity roadmap" in w["title"].lower() or "sovereign" in w["title"].lower(), 1),
        coverage="gap",
        notes="Customers ask for published roadmap; only a stub epic.",
        cloudBoundary="usgov",
        workload="other",
    )
    add(
        themeId="theme-warehouse",
        workItemIds=wi(lambda w: w["workload"] == "data-warehouse", 2),
        coverage="partial",
        cloudBoundary="commercial",
        workload="data-warehouse",
    )
    add(
        themeId="theme-governance",
        workItemIds=wi(lambda w: w["workload"] == "security-governance", 2),
        coverage="partial",
        cloudBoundary="commercial",
        workload="security-governance",
    )
    add(
        themeId="theme-positioning",
        workItemIds=[],
        coverage="gap",
        notes="Competitive / Premium positioning — no dedicated ADO owner.",
        cloudBoundary="commercial",
        workload="other",
    )
    add(
        themeId="theme-adf-migration",
        workItemIds=[],
        coverage="gap",
        notes="USGov ADF migration path undocumented.",
        cloudBoundary="usgov",
        workload="pipelines",
    )
    add(
        themeId="theme-spark-start",
        workItemIds=wi(lambda w: any(k in w["title"] for k in ("Livy", "Spark session", "kernel", "cold")), 2),
        coverage="partial",
        cloudBoundary="commercial",
        workload="data-engineering",
    )
    add(
        themeId="theme-cicd",
        workItemIds=wi(lambda w: w.get("cloudBoundary") == "usgov", 1),
        dependencyIds=[d["id"] for d in deps if d.get("cloudBoundary") == "usgov"][:1],
        coverage="partial",
        cloudBoundary="usgov",
        workload="pipelines",
    )


    add(
        themeId="theme-connectors",
        workItemIds=wi(lambda w: "connector" in w["title"].lower() or "Oracle" in w["title"] or "SAP" in w["title"], 2),
        coverage="partial",
        notes="Throughput work filed; decision tree still a doc gap.",
        cloudBoundary="commercial",
        workload="data-integration",
    )
    add(
        themeId="theme-monitoring",
        workItemIds=wi(lambda w: "monitoring" in w["title"].lower() or "alert" in w["title"].lower(), 2),
        coverage="partial",
        cloudBoundary="commercial",
        workload="security-governance",
    )
    add(
        themeId="theme-medallion",
        workItemIds=wi(lambda w: "medallion" in w["title"].lower(), 1),
        coverage="partial",
        cloudBoundary="commercial",
        workload="data-engineering",
    )
    add(
        themeId="theme-sql-endpoint",
        workItemIds=wi(lambda w: "sql endpoint" in w["title"].lower(), 1),
        coverage="covered",
        cloudBoundary="commercial",
        workload="data-warehouse",
    )
    add(
        themeId="theme-delta-optimize",
        workItemIds=wi(lambda w: "OPTIMIZE" in w["title"] or "V-Order" in w["title"], 1),
        coverage="covered",
        cloudBoundary="commercial",
        workload="data-engineering",
    )
    add(
        themeId="theme-capacity-pause",
        workItemIds=wi(lambda w: "pause" in w["title"].lower() or "Capacity pause" in w["title"], 2),
        coverage="partial",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-expression-builder",
        workItemIds=wi(lambda w: "expression" in w["title"].lower(), 1),
        coverage="partial",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-webhook-triggers",
        workItemIds=wi(lambda w: "webhook" in w["title"].lower(), 1),
        coverage="covered",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-semantic-model",
        workItemIds=wi(lambda w: "semantic model" in w["title"].lower() or "Direct Lake" in w["title"], 2),
        coverage="partial",
        cloudBoundary="commercial",
        workload="power-bi",
    )
    add(
        themeId="theme-mlflow",
        workItemIds=wi(lambda w: "MLflow" in w["title"] or "endpoint" in w["title"].lower(), 1),
        coverage="partial",
        cloudBoundary="commercial",
        workload="data-science",
    )
    add(
        themeId="theme-gpu-spark",
        workItemIds=wi(lambda w: "GPU" in w["title"], 1),
        coverage="covered",
        cloudBoundary="commercial",
        workload="data-science",
    )
    add(
        themeId="theme-private-links",
        workItemIds=wi(lambda w: "private link" in w["title"].lower(), 1),
        coverage="partial",
        cloudBoundary="commercial",
        workload="security-governance",
    )
    add(
        themeId="theme-sku-confusion",
        workItemIds=[],
        coverage="gap",
        notes="Sizing explainer tasked but no committed epic.",
        cloudBoundary="commercial",
        workload="other",
    )
    add(
        themeId="theme-metrics-lag",
        workItemIds=wi(lambda w: "metrics" in w["title"].lower() or "Near-real-time" in w["title"], 2),
        coverage="partial",
        cloudBoundary="commercial",
        workload="other",
    )
    add(
        themeId="theme-parameter-promotion",
        workItemIds=wi(lambda w: "parameter" in w["title"].lower() or "promotion" in w["title"].lower(), 2),
        coverage="covered",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-child-pipelines",
        workItemIds=wi(lambda w: "child" in w["title"].lower() or "Parent pipeline" in w["title"], 2),
        coverage="partial",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-copy-activity",
        workItemIds=wi(lambda w: "Copy activity" in w["title"] or "copy activity" in w["title"].lower(), 2),
        coverage="partial",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-kql-eventhouse",
        workItemIds=wi(lambda w: "Eventhouse" in w["title"] or "KQL" in w["title"], 1),
        coverage="partial",
        notes="Docs task filed; little product work.",
        cloudBoundary="commercial",
        workload="realtime-analytics",
    )
    add(
        themeId="theme-workspace-identity",
        workItemIds=wi(lambda w: "identity" in w["title"].lower() or "auth" in w["title"].lower(), 1),
        coverage="partial",
        cloudBoundary="commercial",
        workload="onelake",
    )
    add(
        themeId="theme-git-integration",
        workItemIds=wi(lambda w: "git" in w["title"].lower() or "Git" in w["title"], 1),
        coverage="partial",
        cloudBoundary="commercial",
        workload="pipelines",
    )
    add(
        themeId="theme-connectors",
        workItemIds=[],
        coverage="gap",
        notes="USGov connector parity untracked.",
        cloudBoundary="usgov",
        workload="data-integration",
    )
    add(
        themeId="theme-monitoring",
        workItemIds=[],
        coverage="gap",
        notes="Sovereign monitoring hub lag — no work item.",
        cloudBoundary="il6",
        workload="security-governance",
    )

    covered = {m["themeId"] for m in mappings}
    for t in theme_defs:
        if t["id"] not in covered:
            add(
                themeId=t["id"],
                workItemIds=[],
                coverage="gap",
                notes="No semester mapping yet.",
                cloudBoundary=t.get("cloudBoundary") or "commercial",
            )
    return mappings


def build_actions():
    return [
        {"id": "a01", "title": "Add shortcut health + token-expiry alerts", "rationale": "Broken ADLS/S3 shortcuts after token rotation are a loud OneLake complaint. A health signal and pre-expiry warning would prevent blank reports.", "workload": "onelake", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-shortcuts"], "ownerHint": "OneLake + Identity"},
        {"id": "a02", "title": "Surface Direct Lake fallback as a first-class report banner", "rationale": "Exec dashboard failures are blamed on Fabric BI when Direct Lake quietly falls back. Authors and viewers need an explicit, timestamped mode change.", "workload": "power-bi", "effort": "low", "impact": "high", "relatedThemeIds": ["theme-direct-lake"], "ownerHint": "Power BI / Direct Lake"},
        {"id": "a03", "title": "Ground Copilot on a live activity / DAX catalog", "rationale": "Hallucinated pipeline activities and double-counted DAX are high-visibility trust failures. Constrain generation to shipped APIs.", "workload": "copilot-ai", "effort": "high", "impact": "high", "relatedThemeIds": ["theme-copilot", "theme-copilot-grounding"], "ownerHint": "Copilot + Workload partners"},
        {"id": "a04", "title": "Make Livy session reuse the default for notebooks", "rationale": "Cold starts dominate Data Engineering negativity, while session reuse is called a game changer. Flip the default.", "workload": "data-engineering", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-spark-start", "theme-session-reuse"], "ownerHint": "Spark runtime"},
        {"id": "a05", "title": "Emit Dataflow Gen2 success only after lakehouse commit", "rationale": "Pipeline-success + empty lakehouse is a silent data-quality incident. Tie activity status to the commit.", "workload": "data-integration", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-dataflow"], "ownerHint": "Data Integration"},
        {"id": "a06", "title": "Publish Eventstream p99 SLO + dead-letter destination", "rationale": "Latency spikes and silent partition drops showed up during launches. Operators want SLOs and a place dropped events go.", "workload": "realtime-analytics", "effort": "high", "impact": "high", "relatedThemeIds": ["theme-eventstream", "theme-dead-letter"], "ownerHint": "Real-Time Intelligence"},
        {"id": "a07", "title": "Queue missed pipeline triggers after capacity resume", "rationale": "Weekend F64 pause caused silent Monday misses. Replay or clearly fail scheduled triggers that should have fired while paused.", "workload": "pipelines", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-pipelines", "theme-capacity"], "ownerHint": "Pipelines + Capacity"},
        {"id": "a08", "title": "Ship near-real-time capacity metrics (≤ 5 min)", "rationale": "Warehouse bill spikes and bursting cannot be operated on a 2-hour-lag app.", "workload": "other", "effort": "high", "impact": "high", "relatedThemeIds": ["theme-capacity", "theme-warehouse"], "ownerHint": "Capacity platform"},
        {"id": "a09", "title": "Collapse endorsement into one steward-facing model", "rationale": "Endorsed vs certified vs master data is creating governance theater. One badge, one meaning.", "workload": "security-governance", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-governance", "theme-shortcuts"], "ownerHint": "Purview / Governance"},
        {"id": "a10", "title": "Publish a 2026 decision tree: Dataflow vs Copy vs Spark", "rationale": "Consultants keep asking for an official chooser. A short Learn + in-product guide would cut neutral volume.", "workload": "data-integration", "effort": "low", "impact": "medium", "relatedThemeIds": ["theme-naming", "theme-dataflow", "theme-positioning"], "ownerHint": "Docs + Data Integration"},
        {"id": "a11", "title": "Retire dual Activator / Reflex naming in product chrome", "rationale": "Workshop leaders say naming still derails Real-Time conversations. Pick one string in UI, Learn, and Copilot.", "workload": "realtime-analytics", "effort": "low", "impact": "low", "relatedThemeIds": ["theme-naming"], "ownerHint": "Real-Time + Docs"},
        {"id": "a12", "title": "Add a Premium → F64 sizing worksheet in-product", "rationale": "Capacity owners describe bursting as folklore. A worksheet tied to the metrics app would help.", "workload": "power-bi", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-capacity", "theme-positioning"], "ownerHint": "Capacity + PMO"},
        {"id": "a13", "title": "Publish ADF → Fabric activity parity matrix", "rationale": "Migration leads are blocked mapping azure data factory estates. A living parity matrix cuts confusion.", "workload": "pipelines", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-adf-migration", "theme-pipelines"], "ownerHint": "Pipelines + Docs"},
        {"id": "a14", "title": "Clarify Fabric Data Factory vs ADF product naming", "rationale": "Practitioners still ask if Pipelines are ADF rebranded. Align Learn, marketing, and in-product strings.", "workload": "pipelines", "effort": "low", "impact": "medium", "relatedThemeIds": ["theme-adf-migration", "theme-naming"], "ownerHint": "Docs + PMO"},
        {"id": "a15", "title": "GA managed VNet for Fabric pipelines (commercial)", "rationale": "Hybrid connectivity is the top ADF parity ask from commercial customers.", "workload": "pipelines", "effort": "high", "impact": "high", "relatedThemeIds": ["theme-managed-vnet", "theme-adf-migration"], "ownerHint": "Pipelines + Networking"},
        {"id": "a16", "title": "Surface CU throttling reasons on pipeline runs", "rationale": "Authors see failures without knowing concurrency / capacity unit limits fired.", "workload": "pipelines", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-cu-throttling", "theme-capacity"], "ownerHint": "Pipelines + Capacity"},
        {"id": "a17", "title": "Improve deployment pipeline parameter promotion", "rationale": "CI/CD for pipelines stalls on environment-specific parameters.", "workload": "pipelines", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-cicd"], "ownerHint": "Pipelines + DevOps"},
        {"id": "a18", "title": "USGov pipeline managed VNet + CI/CD parity push", "rationale": "Government customers need commercial feature parity for orchestration before ADF exit.", "workload": "pipelines", "effort": "high", "impact": "high", "relatedThemeIds": ["theme-gov-pipelines", "theme-sovereign-parity"], "ownerHint": "Pipelines + Sovereign"},
        {"id": "a19", "title": "Publish sovereign feature lag roadmap", "rationale": "USGov / IL7 / IL6 customers track commercial GA dates; a public parity roadmap reduces support load.", "workload": "other", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-sovereign-parity"], "ownerHint": "PMO + Sovereign"},
        {"id": "a20", "title": "OneLake shortcut endorsement as first-class badge", "rationale": "Stewards want certified shortcuts, not only tables.", "workload": "onelake", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-shortcuts", "theme-governance"], "ownerHint": "OneLake + Purview"},
        {"id": "a21", "title": "In-product Livy / Spark history deep links", "rationale": "Kernel crashes force engineers out of Fabric UI to find logs.", "workload": "data-engineering", "effort": "low", "impact": "medium", "relatedThemeIds": ["theme-spark-start"], "ownerHint": "Spark runtime"},
        {"id": "a22", "title": "Warehouse result-set caching consistency fixes", "rationale": "Inconsistent cache hits break analyst SLAs.", "workload": "data-warehouse", "effort": "high", "impact": "medium", "relatedThemeIds": ["theme-warehouse"], "ownerHint": "Warehouse"},
        {"id": "a23", "title": "Monitoring hub = workspace truth for pipeline failures", "rationale": "Admins refuse two sources of failure truth.", "workload": "security-governance", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-governance"], "ownerHint": "Admin platform"},
        {"id": "a24", "title": "IL7 private endpoint DNS for OneLake shortcuts", "rationale": "Sovereign mesh designs block without private DNS.", "workload": "onelake", "effort": "high", "impact": "high", "relatedThemeIds": ["theme-gov-private-link"], "ownerHint": "OneLake + Networking"},
        {"id": "a25", "title": "Richer pipeline timeout / retry reason codes", "rationale": "Opaque failed states are the top pipelines want theme.", "workload": "pipelines", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-retry-diagnostics", "theme-pipelines"], "ownerHint": "Pipelines"},
        {"id": "a26", "title": "OneLake catalog lineage for shortcuts", "rationale": "Discoverability across shortcut hops is weak for mesh teams.", "workload": "onelake", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-onelake-catalog"], "ownerHint": "OneLake"},
        {"id": "a27", "title": "Staging lakehouse UX simplification for Dataflow Gen2", "rationale": "First-time authors think staging means they misconfigured.", "workload": "data-integration", "effort": "low", "impact": "medium", "relatedThemeIds": ["theme-dataflow"], "ownerHint": "Data Integration"},
        {"id": "a28", "title": "Copilot workspace item discovery reliability", "rationale": "Copilot cannot find the lakehouse next to the notebook — trust killer.", "workload": "copilot-ai", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-copilot"], "ownerHint": "Copilot"},
        {"id": "a29", "title": "Idempotent pipeline trigger replay API", "rationale": "Duplicate fires after capacity resume cause double loads.", "workload": "pipelines", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-pipelines", "theme-capacity"], "ownerHint": "Pipelines"},
        {"id": "a30", "title": "Docs: private links + cross-tenant OneLake shortcuts", "rationale": "Blog posts disagree with Learn — ship one official path.", "workload": "security-governance", "effort": "low", "impact": "medium", "relatedThemeIds": ["theme-governance", "theme-gov-private-link"], "ownerHint": "Docs + Networking"},
        {"id": "a31", "title": "Webhook triggers for Fabric pipelines", "rationale": "Customers replace brittle Logic App hops with native webhooks.", "workload": "pipelines", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-pipelines", "theme-adf-migration"], "ownerHint": "Pipelines"},
        {"id": "a32", "title": "GPU Spark queue transparency on shared capacity", "rationale": "Data Science SLAs fail when GPU jobs queue invisibly.", "workload": "data-science", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-spark-start", "theme-gpu-spark"], "ownerHint": "Data Science + Capacity"},
        {"id": "a33", "title": "Publish connector vs Spark vs Copy decision tree", "rationale": "Enterprise extracts stall on chooser confusion; SAP/Oracle throughput questions dominate DI threads.", "workload": "data-integration", "effort": "low", "impact": "medium", "relatedThemeIds": ["theme-connectors", "theme-naming", "theme-dataflow"], "ownerHint": "Docs + Data Integration"},
        {"id": "a34", "title": "Unified monitoring alerts for pipelines and dataflows", "rationale": "Operators reject two truths between monitoring hub and workspace. One alert bus.", "workload": "security-governance", "effort": "high", "impact": "high", "relatedThemeIds": ["theme-monitoring", "theme-governance"], "ownerHint": "Admin platform"},
        {"id": "a35", "title": "Ship medallion reference architectures for 2026", "rationale": "Lakehouse-only vs warehouse-at-gold debates burn consulting hours every quarter.", "workload": "data-engineering", "effort": "low", "impact": "medium", "relatedThemeIds": ["theme-medallion", "theme-positioning"], "ownerHint": "Docs + PMO"},
        {"id": "a36", "title": "Lakehouse SQL endpoint warm-pool option", "rationale": "Cold TDS starts surprise analysts on morning dashboards.", "workload": "data-warehouse", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-sql-endpoint", "theme-warehouse"], "ownerHint": "Warehouse"},
        {"id": "a37", "title": "Document scheduled Delta OPTIMIZE + V-Order recipes", "rationale": "Direct Lake wins are real when compaction is routine; make the recipe first-class.", "workload": "data-engineering", "effort": "low", "impact": "medium", "relatedThemeIds": ["theme-delta-optimize", "theme-direct-lake"], "ownerHint": "Spark + Docs"},
        {"id": "a38", "title": "Hardening for capacity pause → trigger miss", "rationale": "Weekend F64 pause still silently drops Monday schedules.", "workload": "pipelines", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-capacity-pause", "theme-pipelines"], "ownerHint": "Pipelines + Capacity"},
        {"id": "a39", "title": "Align expression builder UI with Learn syntax", "rationale": "Nested ForEach readability improved; docs still contradict the builder.", "workload": "pipelines", "effort": "low", "impact": "low", "relatedThemeIds": ["theme-expression-builder", "theme-naming"], "ownerHint": "Pipelines + Docs"},
        {"id": "a40", "title": "GA webhook triggers for Fabric pipelines", "rationale": "Retire Logic App hops for event-driven pipeline starts.", "workload": "pipelines", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-webhook-triggers", "theme-adf-migration"], "ownerHint": "Pipelines"},
        {"id": "a41", "title": "Warn authors when semantic model refresh is a no-op on Direct Lake", "rationale": "Scheduled refreshes that do nothing confuse every new Direct Lake author.", "workload": "power-bi", "effort": "low", "impact": "medium", "relatedThemeIds": ["theme-semantic-model", "theme-direct-lake"], "ownerHint": "Power BI"},
        {"id": "a42", "title": "Publish MLflow → online endpoint happy path", "rationale": "Small teams stay on Fabric only if model deploy is not an Azure ML scavenger hunt.", "workload": "data-science", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-mlflow"], "ownerHint": "Data Science"},
        {"id": "a43", "title": "Surface GPU Spark queue wait times", "rationale": "Invisible GPU queues blow scoring SLAs on shared capacity.", "workload": "data-science", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-gpu-spark", "theme-spark-start"], "ownerHint": "Data Science + Capacity"},
        {"id": "a44", "title": "Reconcile private link Learn vs community blogs", "rationale": "Commercial networking guidance still fragments across blogs.", "workload": "security-governance", "effort": "low", "impact": "medium", "relatedThemeIds": ["theme-private-links", "theme-gov-private-link"], "ownerHint": "Docs + Networking"},
        {"id": "a45", "title": "In-product F64 vs F128 sizing helper", "rationale": "SKU confusion dominates capacity planning meetings.", "workload": "other", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-sku-confusion", "theme-capacity"], "ownerHint": "Capacity + PMO"},
        {"id": "a46", "title": "Cut capacity metrics lag to ≤ 5 minutes", "rationale": "CU spike fire drills cannot wait on a 2-hour metrics app.", "workload": "other", "effort": "high", "impact": "high", "relatedThemeIds": ["theme-metrics-lag", "theme-capacity", "theme-cu-throttling"], "ownerHint": "Capacity platform"},
        {"id": "a47", "title": "First-class environment parameter promotion", "rationale": "Linked service secrets and Dev/Test/Prod promotion block CI/CD adoption.", "workload": "pipelines", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-parameter-promotion", "theme-cicd"], "ownerHint": "Pipelines + DevOps"},
        {"id": "a48", "title": "Fix parent/child pipeline failure bubbling", "rationale": "Parent-succeeded / child-failed is a classic orchestration footgun.", "workload": "pipelines", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-child-pipelines", "theme-pipelines"], "ownerHint": "Pipelines"},
        {"id": "a49", "title": "Copy activity retry parity with ADF", "rationale": "Long ADLS pulls fail more opaquely than classic azure data factory copy.", "workload": "pipelines", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-copy-activity", "theme-retry-diagnostics", "theme-adf-migration"], "ownerHint": "Pipelines"},
        {"id": "a50", "title": "Eventhouse dual-query architecture guide", "rationale": "KQL praise is high; dual-query with OneLake still needs a crisp sketch.", "workload": "realtime-analytics", "effort": "low", "impact": "low", "relatedThemeIds": ["theme-kql-eventhouse", "theme-eventstream"], "ownerHint": "Real-Time + Docs"},
        {"id": "a51", "title": "Workspace identity auth diagnostics", "rationale": "Token rotate + three auth models blank reports without a health signal.", "workload": "onelake", "effort": "medium", "impact": "high", "relatedThemeIds": ["theme-workspace-identity", "theme-shortcuts"], "ownerHint": "OneLake + Identity"},
        {"id": "a52", "title": "Harden workspace git branch policies", "rationale": "Git integration is liked; multi-item commit policies still rough.", "workload": "pipelines", "effort": "medium", "impact": "medium", "relatedThemeIds": ["theme-git-integration", "theme-cicd"], "ownerHint": "Pipelines + DevOps"},
    ]


def build_news():
    rows = [
        ("n01", "Microsoft Fabric September 2026 feature summary", "Microsoft Fabric blog", "official", "2026-09-11T15:00:00Z", "Official monthly roundup: Copilot in Warehouse expansion, OneLake catalog polish, Eventstream observability preview.", "https://blog.fabric.microsoft.com/", ["other", "copilot-ai", "onelake", "realtime-analytics"]),
        ("n02", "Copilot in Fabric Data Warehouse generally available", "Microsoft Learn", "official", "2026-09-10T16:30:00Z", "Natural-language-to-SQL in the warehouse editor is GA, with workspace grounding and admin tenant switches.", "https://learn.microsoft.com/fabric/", ["copilot-ai", "data-warehouse"]),
        ("n03", "OneLake security inheritance for shortcuts", "Microsoft Fabric blog", "official", "2026-09-08T14:00:00Z", "Shortcut ACLs now inherit workspace and OneLake roles more consistently.", "https://blog.fabric.microsoft.com/", ["onelake", "security-governance"]),
        ("n04", "Direct Lake guidance: when fallback is expected", "SQLBI", "community", "2026-09-09T09:00:00Z", "Community walkthrough of Direct Lake vs DirectQuery fallback and model design choices.", "https://www.sqlbi.com/", ["power-bi", "onelake"]),
        ("n05", "Eventstream in production: latency lessons", "The New Stack", "press", "2026-09-10T11:20:00Z", "Press look at Real-Time Intelligence customers, including p99 latency expectations.", "https://thenewstack.io/", ["realtime-analytics"]),
        ("n06", "Guy in a Cube: Premium to F64 without surprises", "Guy in a Cube", "community", "2026-09-07T18:00:00Z", "Community video on capacity units, bursting, and Premium to Fabric F64 moves.", "https://guyinacube.com/", ["power-bi", "other"]),
        ("n07", "Fabric vs Databricks for mid-size data teams", "InfoWorld", "press", "2026-09-06T13:45:00Z", "Comparison arguing Fabric wins when Power BI and OneLake are center of gravity.", "https://www.infoworld.com/", ["other", "data-science", "power-bi"]),
        ("n08", "Dataflow Gen2 refresh contracts — what succeeded means", "Microsoft Learn", "official", "2026-09-05T17:10:00Z", "Updated Learn article on Dataflow Gen2 refresh status and pipeline activity commit mapping.", "https://learn.microsoft.com/fabric/data-factory/", ["data-integration", "pipelines"]),
        ("n09", "Endorsement in Fabric: a steward field guide", "Community blog", "community", "2026-09-08T08:30:00Z", "Practitioner notes on endorsed vs certified vs promoted, and shortcut-level badges.", "https://www.microsoft.com/en-us/power-platform/blog/", ["security-governance", "onelake"]),
        ("n10", "ADF to Fabric Pipelines: migration field notes", "Microsoft Fabric blog", "official", "2026-09-09T14:00:00Z", "Official guidance on activity parity, IR options, and common azure data factory migration pitfalls.", "https://blog.fabric.microsoft.com/", ["pipelines", "data-integration"]),
        ("n11", "Understanding Fabric capacity units (CU) in 2026", "Microsoft Learn", "official", "2026-09-06T10:00:00Z", "Learn refresh on CU, bursting, and how pipelines / warehouse share capacity.", "https://learn.microsoft.com/fabric/", ["other", "pipelines", "data-warehouse"]),
        ("n12", "Pipeline run history performance improvements (preview)", "Microsoft Fabric blog", "official", "2026-09-12T12:00:00Z", "Preview of virtualized run history for pipelines with large activity graphs.", "https://blog.fabric.microsoft.com/", ["pipelines"]),
        ("n13", "Managed VNet for Fabric Data Factory — roadmap update", "Microsoft Fabric blog", "official", "2026-09-10T09:00:00Z", "Status on managed VNet / hybrid connectivity parity with classic ADF patterns.", "https://blog.fabric.microsoft.com/", ["pipelines"]),
        ("n14", "Livy session reuse deep dive", "Community blog", "community", "2026-09-07T11:00:00Z", "Practitioners measure cold start vs session reuse on 2xlarge Spark in Fabric notebooks.", "https://medium.com/", ["data-engineering"]),
        ("n15", "Copilot grounding: why tool catalogs matter", "Towards Data Science", "community", "2026-09-08T16:00:00Z", "Community write-up on hallucinated pipeline activities and grounded generation patterns.", "https://towardsdatascience.com/", ["copilot-ai", "pipelines"]),
        ("n16", "Eventstream dead-letter patterns on OneLake", "Microsoft Learn", "official", "2026-09-11T08:00:00Z", "Preview docs for routing dropped Eventstream events to a lakehouse dead-letter path.", "https://learn.microsoft.com/fabric/", ["realtime-analytics", "onelake"]),
        ("n17", "Fabric in Azure Government: what is available now", "Microsoft Learn", "official", "2026-09-05T13:00:00Z", "USGov feature matrix for Fabric workloads, including pipelines and OneLake caveats.", "https://learn.microsoft.com/azure/azure-government/", ["other", "pipelines", "onelake"]),
        ("n18", "OneLake catalog: domains, search, and stewardship", "Microsoft Fabric blog", "official", "2026-09-09T17:30:00Z", "Product update on domain folders and catalog discoverability.", "https://blog.fabric.microsoft.com/", ["onelake"]),
        ("n19", "Warehouse T-SQL surface area expansion", "Microsoft Learn", "official", "2026-09-07T14:20:00Z", "Additional T-SQL constructs GA in Fabric Warehouse; caching guidance updated.", "https://learn.microsoft.com/fabric/", ["data-warehouse"]),
        ("n20", "CI/CD for Fabric pipelines with deployment pipelines", "Community blog", "community", "2026-09-10T19:00:00Z", "How-to on git integration and parameter promotion across Dev/Test/Prod.", "https://medium.com/", ["pipelines"]),
        ("n21", "Press: Microsoft pushes Fabric as ADF successor narrative", "The Register", "press", "2026-09-06T08:45:00Z", "Industry coverage of Fabric Data Factory positioning versus classic Azure Data Factory.", "https://www.theregister.com/", ["pipelines", "other"]),
        ("n22", "Private link patterns for Fabric and OneLake", "Microsoft Learn", "official", "2026-09-08T12:15:00Z", "Networking guidance for private endpoints with Fabric workspaces and shortcuts.", "https://learn.microsoft.com/fabric/", ["security-governance", "onelake"]),
        ("n23", "Power BI Direct Lake: production checklist", "SQLBI", "community", "2026-09-11T07:00:00Z", "Checklist to keep executive packs on Direct Lake and detect fallback early.", "https://www.sqlbi.com/", ["power-bi"]),
        ("n24", "Data Science in Fabric: MLflow without a second platform", "Community blog", "community", "2026-09-05T20:00:00Z", "Small-team patterns for experiments and scoring jobs entirely in Fabric.", "https://medium.com/", ["data-science"]),
        ("n25", "Capacity metrics app: latency and CU attribution FAQ", "Microsoft Learn", "official", "2026-09-12T10:30:00Z", "Why metrics lag, how CU spikes map to pipelines and warehouse, and what is improving.", "https://learn.microsoft.com/fabric/", ["other", "pipelines", "data-warehouse"]),
        ("n26", "Sovereign clouds and Fabric: parity expectations", "Press", "press", "2026-09-09T11:00:00Z", "Industry note on USGov / sovereign feature lag versus commercial Fabric GA.", "https://www.infoworld.com/", ["other", "pipelines"]),
        ("n27", "Monitoring hub vs workspace: which is source of truth?", "Community blog", "community", "2026-09-06T15:40:00Z", "Admins compare failure visibility between monitoring hub and workspace pipeline views.", "https://medium.com/", ["security-governance", "pipelines"]),
        ("n28", "Fabric Pipelines expression language tips", "Microsoft Learn", "official", "2026-09-07T09:30:00Z", "Official tips for nested expressions, child pipeline parameters, and ForEach.", "https://learn.microsoft.com/fabric/data-factory/", ["pipelines"]),
        ("n29", "Shortcut reliability: token rotation playbook", "Community blog", "community", "2026-09-12T08:00:00Z", "Operational playbook for rotating ADLS credentials without blanking reports.", "https://medium.com/", ["onelake"]),
        ("n30", "Activator naming update — product chrome alignment", "Microsoft Fabric blog", "official", "2026-09-11T18:00:00Z", "Product team acknowledges Activator / Reflex confusion and outlines rename plan.", "https://blog.fabric.microsoft.com/", ["realtime-analytics"]),
        ("n31", "Hybrid IR patterns while waiting on managed VNet", "Community blog", "community", "2026-09-08T19:20:00Z", "Workarounds ADF veterans use for on-prem sources in Fabric pipelines today.", "https://medium.com/", ["pipelines", "data-integration"]),
        ("n32", "KQL and Eventhouse on OneLake: architecture sketch", "Microsoft Learn", "official", "2026-09-10T13:00:00Z", "How Eventhouse sits on OneLake and what that means for dual-query estates.", "https://learn.microsoft.com/fabric/", ["realtime-analytics", "onelake"]),
        ("n33", "Fabric August 2026 feature summary", "Microsoft Fabric blog", "official", "2026-08-18T15:00:00Z", "Official August roundup: pipeline expression builder polish, OneLake private link GA notes, warehouse CU attribution preview.", "https://blog.fabric.microsoft.com/", ["other", "pipelines", "onelake", "data-warehouse"]),
        ("n34", "Connector throughput benchmarks: SAP and Oracle on Dataflow Gen2", "Community blog", "community", "2026-08-20T11:00:00Z", "Practitioner benchmarks comparing connector throughput vs Spark notebook extracts.", "https://medium.com/", ["data-integration"]),
        ("n35", "Capacity pause best practices for F SKUs", "Microsoft Learn", "official", "2026-08-22T09:30:00Z", "Learn article on pause/resume side effects for scheduled pipeline triggers.", "https://learn.microsoft.com/fabric/", ["pipelines", "other"]),
        ("n36", "Medallion on Fabric: lakehouse vs warehouse at gold", "SQLBI", "community", "2026-08-25T08:00:00Z", "Community architecture notes on medallion layers and Direct Lake consumers.", "https://www.sqlbi.com/", ["data-engineering", "power-bi", "data-warehouse"]),
        ("n37", "Webhook triggers for Fabric pipelines (public preview)", "Microsoft Fabric blog", "official", "2026-08-27T14:00:00Z", "Preview of native webhook triggers to replace Logic App hops.", "https://blog.fabric.microsoft.com/", ["pipelines"]),
        ("n38", "Lakehouse SQL endpoint cold-start deep dive", "Community blog", "community", "2026-08-28T16:20:00Z", "Measuring TDS endpoint warm vs cold behavior for analyst workloads.", "https://medium.com/", ["data-warehouse", "onelake"]),
        ("n39", "Delta OPTIMIZE and V-Order recipes for Direct Lake", "Microsoft Learn", "official", "2026-08-29T10:00:00Z", "Official compaction recipes that keep Direct Lake packs sub-second.", "https://learn.microsoft.com/fabric/", ["data-engineering", "power-bi"]),
        ("n40", "Press: Fabric CI/CD matures with deployment pipelines", "InfoWorld", "press", "2026-09-01T12:00:00Z", "Industry coverage of git integration and parameter promotion patterns.", "https://www.infoworld.com/", ["pipelines", "other"]),
        ("n41", "Workspace identity vs service principal: chooser guide", "Microsoft Learn", "official", "2026-09-02T13:15:00Z", "Auth mental models for shortcuts, pipelines, and gateway connections.", "https://learn.microsoft.com/fabric/", ["onelake", "security-governance", "pipelines"]),
        ("n42", "GPU Spark on Fabric shared capacity — what to expect", "Community blog", "community", "2026-09-03T17:00:00Z", "Queue behavior and SLA implications for weekly scoring jobs.", "https://medium.com/", ["data-science"]),
        ("n43", "MLflow in Fabric without a second ML platform", "Microsoft Fabric blog", "official", "2026-08-16T15:30:00Z", "Product story on experiments and lightweight model deploy paths.", "https://blog.fabric.microsoft.com/", ["data-science"]),
        ("n44", "Monitoring hub roadmap: one failure truth", "Microsoft Fabric blog", "official", "2026-09-04T11:00:00Z", "Admin platform commits to aligning monitoring hub with workspace pipeline failures.", "https://blog.fabric.microsoft.com/", ["security-governance", "pipelines"]),
        ("n45", "F64 vs F128 sizing worksheet (preview)", "Microsoft Learn", "official", "2026-08-21T09:00:00Z", "Preview sizing worksheet tying CU math to pipelines and Power BI bursting.", "https://learn.microsoft.com/fabric/", ["other", "power-bi", "pipelines"]),
        ("n46", "Eventhouse dual-query patterns on OneLake", "Microsoft Learn", "official", "2026-08-26T14:40:00Z", "Architecture sketch for KQL + lakehouse SQL on the same OneLake data.", "https://learn.microsoft.com/fabric/", ["realtime-analytics", "onelake"]),
        ("n47", "Copy activity reliability improvements (August)", "Microsoft Fabric blog", "official", "2026-08-19T12:00:00Z", "Retry policy and timeout diagnostic improvements for long ADLS pulls.", "https://blog.fabric.microsoft.com/", ["pipelines"]),
        ("n48", "Semantic model refresh on Direct Lake — author FAQ", "Guy in a Cube", "community", "2026-09-01T18:30:00Z", "Community video clarifying when refresh schedules are no-ops.", "https://guyinacube.com/", ["power-bi"]),
        ("n49", "Private links for commercial Fabric workspaces GA notes", "Microsoft Learn", "official", "2026-08-15T10:00:00Z", "Networking GA notes and remaining shortcut edge cases.", "https://learn.microsoft.com/fabric/", ["security-governance", "onelake"]),
        ("n50", "Child pipeline orchestration patterns", "Community blog", "community", "2026-09-03T09:45:00Z", "Failure bubbling, parameter passing, and parent status pitfalls.", "https://medium.com/", ["pipelines"]),
        ("n51", "Near-real-time capacity metrics: what is shipping", "Microsoft Fabric blog", "official", "2026-09-13T09:00:00Z", "Product update on cutting metrics app lag toward a 5-minute SLO.", "https://blog.fabric.microsoft.com/", ["other", "pipelines", "data-warehouse"]),
        ("n52", "Press: Microsoft Fabric one month of shipping cadence", "The New Stack", "press", "2026-09-12T14:00:00Z", "Press recap of August–September Fabric releases across pipelines, Copilot, and OneLake.", "https://thenewstack.io/", ["other", "pipelines", "copilot-ai", "onelake"]),
    ]
    return [
        {
            "id": i,
            "title": title,
            "source": source,
            "sourceType": st,
            "publishedAt": pub,
            "summary": summary,
            "url": url,
            "workloads": wls,
        }
        for i, title, source, st, pub, summary, url, wls in rows
    ]


def summarize(mentions):
    by_cloud = {}
    by_wl = {}
    for m in mentions:
        c = m.get("cloudBoundary", "(omit≈commercial)")
        by_cloud[c] = by_cloud.get(c, 0) + 1
        by_wl[m["workload"]] = by_wl.get(m["workload"], 0) + 1
    return by_cloud, by_wl


def assert_mention_floors(mentions):
    """Fail loud if any workload×cloud floor is missed (demo quality gate)."""
    from collections import defaultdict

    cross = defaultdict(lambda: defaultdict(int))
    for m in mentions:
        cloud = m.get("cloudBoundary") or "(omit)"
        cross[m["workload"]][cloud] += 1

    errors = []
    for wl in WORKLOADS:
        row = cross[wl]
        commercialish = row.get("commercial", 0) + row.get("(omit)", 0)
        total = sum(row.values())
        checks = [
            ("commercial+omit", commercialish, MIN_COMMERCIAL),
            ("usgov", row.get("usgov", 0), MIN_USGOV),
            ("il7", row.get("il7", 0), MIN_IL7),
            ("il6", row.get("il6", 0), MIN_IL6),
            ("total", total, MIN_PER_WORKLOAD),
        ]
        for label, got, need in checks:
            if got < need:
                errors.append(f"{wl} {label}: {got} < {need}")
    if errors:
        raise SystemExit("Mention floor failures:\n  " + "\n  ".join(errors))

    # Print crosstab for the report
    clouds = ["commercial", "(omit)", "unknown", "usgov", "il7", "il6"]
    print("\nMention counts by workload × cloud:")
    header = f"{'workload':22} " + " ".join(f"{c:>10}" for c in clouds) + f" {'TOTAL':>8}"
    print(header)
    for wl in WORKLOADS:
        row = cross[wl]
        vals = [row.get(c, 0) for c in clouds]
        print(f"{wl:22} " + " ".join(f"{v:>10}" for v in vals) + f" {sum(vals):>8}")


def main():
    mentions = build_mentions(TARGET_MENTIONS)
    work_items = build_work_items()
    deps = build_deps(work_items)
    mappings = build_mappings(THEME_DEFINITIONS, work_items, deps)
    actions = build_actions()
    news = build_news()

    # Stamp news with sourceEntryId for toggle filtering
    for item in news:
        if item.get("sourceType") == "official":
            item["sourceEntryId"] = "rss-fabric-updates"
        elif item.get("sourceType") == "press":
            item["sourceEntryId"] = "gdelt-fabric-news"
        else:
            item["sourceEntryId"] = "reddit-microsoft-fabric"

    corpus = {
        "generatedAt": "2026-09-13T16:00:00Z",
        "seed": SEED,
        "demoDisclaimer": "Demo data — not live X feed",
        "dateRange": {
            "start": "2026-08-15",
            "end": "2026-09-13",
            "label": "Aug 15 – Sep 13, 2026",
        },
        "mentions": mentions,
        "themeDefinitions": THEME_DEFINITIONS,
        "actions": actions,
        "news": news,
        "semesterPlans": SEMESTER_PLANS,
        "workItems": work_items,
        "dependencyRequests": deps,
        "themeMappings": mappings,
        "sourceRegistry": SOURCE_REGISTRY,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(corpus, separators=(",", ":")) + "\n", encoding="utf-8")

    by_cloud, by_wl = summarize(mentions)
    commercialish = by_cloud.get("commercial", 0) + by_cloud.get("(omit≈commercial)", 0) + by_cloud.get("unknown", 0)
    sovereign = by_cloud.get("usgov", 0) + by_cloud.get("il7", 0) + by_cloud.get("il6", 0)
    n = len(mentions)
    print("Wrote", OUT)
    print("Mentions:", n)
    print("Cloud mix:", by_cloud)
    print(f"Commercial-ish {commercialish} ({100*commercialish/n:.1f}%) | Sovereign {sovereign} ({100*sovereign/n:.1f}%)")
    print("Workload mix:", by_wl)
    print(f"pipelines %: {100*by_wl.get('pipelines',0)/n:.1f}")
    print("Themes:", len(THEME_DEFINITIONS))
    print("Actions:", len(actions))
    print("News:", len(news))
    print("Work items:", len(work_items))
    print("Deps:", len(deps))
    print("Mappings:", len(mappings))


if __name__ == "__main__":
    main()
