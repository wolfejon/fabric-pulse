import { ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'
import type { CompetitorFeature, CompetitorPage, FabricCompetitorStatus } from '../../../types'

function statusLabel(status: FabricCompetitorStatus): string {
  if (status === 'ships') return 'Ships'
  if (status === 'planned') return 'Planned'
  if (status === 'gap') return 'Gap'
  return 'Unknown'
}

function statusClass(status: FabricCompetitorStatus): string {
  if (status === 'ships') return 'border-[#0d7a6f]/40 bg-[#0d7a6f]/12 text-[#0d5c54]'
  if (status === 'planned') return 'border-[#7A3FF2]/35 bg-[#7A3FF2]/10 text-[#5a3a9a]'
  if (status === 'gap') return 'border-[#a33b3b]/35 bg-[#a33b3b]/08 text-[#8a2f2f]'
  return 'border-[#c8c2b4] bg-[#f3efe6] text-[#5c5a54]'
}

function RivalCard({ feature }: { feature: CompetitorFeature }) {
  return (
    <article className="relative overflow-hidden rounded-sm border border-[#c8c2b4] bg-[#fffcf7]/90 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00A4A6]">
            {feature.competitorLabel}
          </p>
          <h3 className="font-display mt-2 text-xl font-semibold leading-snug text-[#141412]">
            {feature.capability}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass(feature.fabricStatus)}`}
        >
          Fabric · {statusLabel(feature.fabricStatus)}
        </span>
      </div>

      {feature.fabricStatus === 'planned' && feature.adoUrl ? (
        <p className="mt-4 text-[12px] text-[#5c5a54]">
          On the plan mirror —{' '}
          <a
            href={feature.adoUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[#7A3FF2] underline-offset-2 hover:underline"
          >
            ADO work item
          </a>
        </p>
      ) : null}

      {feature.evidenceUrls?.[0] ? (
        <p className="mt-3 text-[11px] text-[#9a968c]">
          Rival note ·{' '}
          <a
            href={feature.evidenceUrls[0]}
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:underline"
          >
            public docs
          </a>
        </p>
      ) : null}

      <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-[#b0a496]">
        Updated {feature.updatedAt.slice(0, 10)}
        {feature.updatedBy ? ` · ${feature.updatedBy}` : ''}
      </p>
    </article>
  )
}

/**
 * Chronicle back page — editorial competitor matrix for a theme/complaint.
 * Sparse columns, not a dense SaaS table.
 */
export function CompetitorBackPage({
  page,
  features,
  onBack,
}: {
  page: CompetitorPage
  features: CompetitorFeature[]
  onBack: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-3xl px-1 py-4"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[#5c5a54] transition hover:text-[#00A4A6]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to article
      </button>

      <header className="mt-6 border-b-2 border-[#1a1a18] pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7A3FF2]">
          Chronicle · Back page · Pipelines
        </p>
        <h2 className="font-display mt-3 text-[clamp(1.75rem,4vw,2.6rem)] font-semibold leading-[1.15] tracking-tight text-[#141412]">
          {page.title}
        </h2>
        <p className="mt-4 font-serif text-[15px] leading-relaxed text-[#4a4842]">
          {page.summary}
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <RivalCard key={f.id} feature={f} />
        ))}
      </div>

      <p className="mt-10 text-center font-serif text-[11px] italic text-[#9a968c]">
        Human-curated rival notes · not a scrape · demo only
      </p>
    </motion.div>
  )
}
