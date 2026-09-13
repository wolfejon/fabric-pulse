import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EvidenceBadge } from '../../atelier/EvidenceBadge'
import { EvidenceSheet } from '../../atelier/EvidenceSheet'
import { WORKLOAD_CATALOG } from '../../../data/catalog'
import {
  resolveThemeMapping,
  workItemsForMapping,
} from '../../../lib/aggregate'
import type {
  CoverageStatus,
  DependencyRequest,
  Mention,
  ThemeInsight,
  ThemePolarity,
  ThemeSignalMapping,
  WorkItem,
} from '../../../types'
import type { LayoutProps } from '../types'

function coverageLabel(status: CoverageStatus): string {
  if (status === 'covered') return 'Covered'
  if (status === 'partial') return 'Partial'
  return 'Gap'
}

function coverageClass(status: CoverageStatus): string {
  if (status === 'covered') return 'border-[#0d7a6f]/35 bg-[#0d7a6f]/10 text-[#0d5c54]'
  if (status === 'partial') return 'border-[#b07d12]/35 bg-[#b07d12]/10 text-[#7a5508]'
  return 'border-[#a33b3b]/35 bg-[#a33b3b]/08 text-[#8a2f2f]'
}

function polarityBucket(polarity: ThemePolarity): 'want' | 'dont-like' {
  if (polarity === 'want') return 'want'
  if (polarity === 'dont-like') return 'dont-like'
  // mixed: lean by sentiment
  return 'dont-like'
}

function ThemeRow({
  theme,
  mapping,
  selected,
  onSelect,
  onEvidence,
}: {
  theme: ThemeInsight
  mapping: ThemeSignalMapping | null
  selected: boolean
  onSelect: () => void
  onEvidence: () => void
}) {
  const status: CoverageStatus = mapping?.coverage ?? 'gap'
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
        selected
          ? 'border-[#1a2a3a] bg-[#1a2a3a] text-[#f4f0ea]'
          : 'border-[#d8d0c4]/80 bg-[#faf7f2]/80 text-[#1c1915] hover:border-[#1a2a3a]/35'
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium leading-snug tracking-tight">
          {theme.name}
        </span>
        <span
          className={`mt-1 block text-[12px] leading-relaxed ${
            selected ? 'text-white/65' : 'text-[#7a7268]'
          }`}
        >
          {theme.description}
        </span>
        <span className="mt-2 block" onClick={(e) => e.stopPropagation()}>
          <EvidenceBadge
            mentionCount={theme.mentionCount}
            uniqueAuthors={theme.uniqueAuthorCount}
            volumeClass={theme.volumeClass}
            tone={selected ? 'dark' : 'light'}
            compact
            onClick={onEvidence}
          />
        </span>
      </span>
      <span
        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
          selected ? 'border-white/25 bg-white/10 text-white' : coverageClass(status)
        }`}
      >
        {coverageLabel(status)}
      </span>
    </button>
  )
}

function DetailPanel({
  theme,
  mapping,
  workItems,
  deps,
  semesterName,
  onEvidence,
}: {
  theme: ThemeInsight
  mapping: ThemeSignalMapping | null
  workItems: WorkItem[]
  deps: DependencyRequest[]
  semesterName: string | null
  onEvidence: () => void
}) {
  const status: CoverageStatus = mapping?.coverage ?? 'gap'
  const empty = workItems.length === 0 && deps.length === 0

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.28 }}
      className="rounded-2xl border border-[#d8d0c4] bg-[#fffcf7] p-5 shadow-[0_12px_40px_rgba(40,30,10,0.06)]"
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a7f72]">
        Plan mirror · {coverageLabel(status)}
        {semesterName ? ` · ${semesterName}` : ''}
      </p>
      <h3 className="font-display mt-2 text-xl font-medium tracking-tight text-[#1a1814]">
        {theme.name}
      </h3>
      <div className="mt-3">
        <EvidenceBadge
          mentionCount={theme.mentionCount}
          uniqueAuthors={theme.uniqueAuthorCount}
          volumeClass={theme.volumeClass}
          tone="light"
          onClick={onEvidence}
        />
      </div>
      {mapping?.notes ? (
        <p className="mt-3 text-sm leading-relaxed text-[#5c554c]">{mapping.notes}</p>
      ) : null}

      {empty ? (
        <p className="mt-8 font-serif text-lg italic leading-relaxed text-[#8a7f72]">
          No plan yet — strong signal without an active ADO mapping.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {workItems.map((wi) => (
            <li
              key={wi.id}
              className="border-l-2 border-[#00b7c3]/70 pl-3"
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a7f72]">
                {wi.type} · {wi.state} · #{wi.adoId}
                {wi.cloudBoundary && wi.cloudBoundary !== 'unknown'
                  ? ` · ${wi.cloudBoundary}`
                  : ''}
              </p>
              <p className="mt-0.5 text-sm font-medium text-[#1c1915]">{wi.title}</p>
            </li>
          ))}
          {deps.map((dep) => (
            <li key={dep.id} className="border-l-2 border-[#7A3FF2]/60 pl-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a7f72]">
                Dependency · {dep.state} · {dep.fromTeam} → {dep.toTeam}
              </p>
              <p className="mt-0.5 text-sm font-medium text-[#1c1915]">{dep.title}</p>
            </li>
          ))}
        </ul>
      )}
    </motion.aside>
  )
}

/**
 * Coverage / Plan Mirror — want vs don’t-like themes with ADO covered / gap.
 * Editorial, sparse — not a backlog grid.
 */
export function Coverage({ snapshot, view, workload, cloud }: LayoutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [evidenceThemeId, setEvidenceThemeId] = useState<string | null>(null)

  const workloadLabel =
    workload === 'all'
      ? 'All workloads'
      : WORKLOAD_CATALOG[workload]?.label ?? workload

  const cloudLabel =
    cloud === 'all'
      ? 'All clouds'
      : cloud === 'usgov'
        ? 'USGov'
        : cloud === 'usnat'
          ? 'USNat'
          : cloud === 'ussec'
            ? 'USSec'
            : 'Commercial'

  const rows = useMemo(() => {
    return view.themes.map((theme) => {
      const mapping = resolveThemeMapping(
        theme.id,
        snapshot.themeMappings,
        cloud,
        workload,
      )
      return { theme, mapping }
    })
  }, [view.themes, snapshot.themeMappings, cloud, workload])

  const wants = rows.filter(({ theme }) => {
    if (theme.polarity === 'want') return true
    if (theme.polarity === 'mixed' && theme.sentimentScore >= 0.2) return true
    return false
  })
  const dislikes = rows.filter(({ theme }) => {
    if (theme.polarity === 'dont-like') return true
    if (theme.polarity === 'mixed' && theme.sentimentScore < 0.2) return true
    // also catch mixed that went to wants already — avoid dupes
    return polarityBucket(theme.polarity) === 'dont-like' && theme.polarity !== 'want'
  }).filter(({ theme }) => !wants.some((w) => w.theme.id === theme.id))

  const selected =
    rows.find((r) => r.theme.id === selectedId) ??
    null

  const selectedWorkItems = selected
    ? workItemsForMapping(selected.mapping, snapshot.workItems)
    : []
  const selectedDeps =
    selected?.mapping?.dependencyIds?.length
      ? snapshot.dependencyRequests.filter((d) =>
          selected.mapping!.dependencyIds!.includes(d.id),
        )
      : []
  const semesterName = selected?.mapping?.semesterId
    ? snapshot.semesterPlans.find((s) => s.id === selected.mapping!.semesterId)?.name ??
      null
    : null

  const coveredCount = rows.filter((r) => r.mapping?.coverage === 'covered').length
  const gapCount = rows.filter((r) => !r.mapping || r.mapping.coverage === 'gap').length

  const evidenceTheme = evidenceThemeId
    ? view.themes.find((t) => t.id === evidenceThemeId) ?? null
    : null
  const evidenceMentions: Mention[] = evidenceTheme
    ? view.mentions
        .filter((m) => evidenceTheme.mentionIds.includes(m.id))
        .sort((a, b) => b.likes + b.reposts - (a.likes + a.reposts))
        .slice(0, 8)
    : []

  return (
    <div className="relative mx-auto flex min-h-[calc(100svh-7rem)] w-full max-w-5xl flex-col px-5 pb-16 pt-6 sm:px-8">
      <header className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8a7f72]">
          Coverage · Plan mirror
        </p>
        <h2 className="font-display mt-3 text-[clamp(1.75rem,4vw,2.6rem)] font-medium leading-[1.2] tracking-tight text-[#1a1814]">
          What {workloadLabel} customers want — and what we already planned for{' '}
          {cloudLabel}.
        </h2>
        <p className="mt-4 text-sm text-[#7a7268]">
          {rows.length} themes in view · {coveredCount} covered · {gapCount} gap
          {snapshot.semesterPlans[1] ? ` · ${snapshot.semesterPlans[1].name}` : ''}
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-start">
        <div className="space-y-10">
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0d7a6f]">
              Wants
            </h3>
            <div className="mt-3 space-y-2">
              {wants.length === 0 ? (
                <p className="font-serif text-sm italic text-[#9a9186]">
                  Quiet on wants in this slice.
                </p>
              ) : (
                wants.map(({ theme, mapping }) => (
                  <ThemeRow
                    key={theme.id}
                    theme={theme}
                    mapping={mapping}
                    selected={selectedId === theme.id}
                    onSelect={() =>
                      setSelectedId((id) => (id === theme.id ? null : theme.id))
                    }
                    onEvidence={() => setEvidenceThemeId(theme.id)}
                  />
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a2f2f]">
              Don’t like
            </h3>
            <div className="mt-3 space-y-2">
              {dislikes.length === 0 ? (
                <p className="font-serif text-sm italic text-[#9a9186]">
                  No friction themes in this slice.
                </p>
              ) : (
                dislikes.map(({ theme, mapping }) => (
                  <ThemeRow
                    key={theme.id}
                    theme={theme}
                    mapping={mapping}
                    selected={selectedId === theme.id}
                    onSelect={() =>
                      setSelectedId((id) => (id === theme.id ? null : theme.id))
                    }
                    onEvidence={() => setEvidenceThemeId(theme.id)}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-6">
          <AnimatePresence mode="wait">
            {selected ? (
              <DetailPanel
                key={selected.theme.id}
                theme={selected.theme}
                mapping={selected.mapping}
                workItems={selectedWorkItems}
                deps={selectedDeps}
                semesterName={semesterName}
                onEvidence={() => setEvidenceThemeId(selected.theme.id)}
              />
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-serif text-sm italic text-[#9a9186]"
              >
                Select a theme to see linked ADO work — or “no plan yet.”
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-14 text-center text-[11px] text-[#b0a496]">
        Demo mappings · not live Azure DevOps · {snapshot.demoDisclaimer}
      </p>

      <EvidenceSheet
        open={evidenceTheme != null}
        onOpenChange={(o) => {
          if (!o) setEvidenceThemeId(null)
        }}
        title={evidenceTheme?.name ?? 'Theme evidence'}
        mentionCount={evidenceTheme?.mentionCount ?? 0}
        uniqueAuthors={evidenceTheme?.uniqueAuthorCount ?? 0}
        volumeClass={evidenceTheme?.volumeClass ?? 'single'}
        mentions={evidenceMentions}
      />
    </div>
  )
}
