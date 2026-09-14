import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, FolderOpen, Volume2, VolumeX, X } from 'lucide-react'
import { WORKLOAD_CATALOG } from '../../../data/catalog'
import { resolveThemeMapping } from '../../../lib/aggregate'
import { formatCloudBoundary } from '../../../lib/format'
import { playPageFlip, prefetchPageFlipSound } from '../../../lib/pageFlipSound'
import type {
  CloudBoundary,
  CloudBoundaryFilter,
  CoverageStatus,
  Mention,
  ThemeInsight,
  ThemePolarity,
  ThemeSignalMapping,
  WorkloadFilter,
} from '../../../types'
import type { LayoutProps } from '../types'

type CaseFile = {
  id: string
  theme: ThemeInsight
  mapping: ThemeSignalMapping | null
  notes: Mention[]
  photoSeed: number
}

function coverageLabel(status: CoverageStatus | null): string {
  if (!status) return 'Unmapped'
  if (status === 'covered') return 'Covered'
  if (status === 'partial') return 'Partial'
  return 'Gap'
}

function polarityStamp(polarity: ThemePolarity, score: number): {
  label: string
  className: string
} {
  if (polarity === 'want' || (polarity === 'mixed' && score >= 0.2)) {
    return {
      label: 'WANT',
      className: 'border-[#0d7a6f] text-[#0d5c54] bg-[#0d7a6f]/08',
    }
  }
  if (polarity === 'dont-like' || polarity === 'mixed') {
    return {
      label: "DON'T LIKE",
      className: 'border-[#a33b3b] text-[#8a2f2f] bg-[#a33b3b]/08',
    }
  }
  return {
    label: 'MIXED',
    className: 'border-[#7a7268] text-[#5c554c] bg-[#7a7268]/08',
  }
}

function cloudTag(boundary?: CloudBoundary): string | null {
  if (!boundary || boundary === 'unknown') return null
  return formatCloudBoundary(boundary)
}

function filterLabel(workload: WorkloadFilter, cloud: CloudBoundaryFilter): string {
  const w =
    workload === 'all' ? 'ALL WORKLOADS' : (WORKLOAD_CATALOG[workload]?.shortLabel ?? workload).toUpperCase()
  const c =
    cloud === 'all'
      ? 'ALL CLOUDS'
      : formatCloudBoundary(cloud).toUpperCase()
  return `${w} · ${c}`
}

function folderTabLabel(workload: WorkloadFilter): string {
  if (workload === 'all') return 'FABRIC PULSE — CASE FILE'
  const short = WORKLOAD_CATALOG[workload]?.shortLabel ?? workload
  return `FABRIC PULSE — ${short.toUpperCase()}`
}

/** Abstract “evidence photo” — product metaphors, no faces. */
function EvidencePhoto({ seed, label }: { seed: number; label: string }) {
  const hue = 180 + (seed % 7) * 22
  const hue2 = (hue + 80) % 360
  const pattern = seed % 4
  return (
    <div
      className="dossier-polaroid relative w-[7.5rem] shrink-0 rotate-[6deg] bg-[#f7f4ee] p-1.5 pb-7 shadow-[2px_3px_8px_rgba(40,30,10,0.22)] sm:w-[8.5rem]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 100" className="block h-auto w-full overflow-hidden rounded-[1px]">
        <defs>
          <linearGradient id={`ev-g-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`hsl(${hue} 35% 28%)`} />
            <stop offset="55%" stopColor={`hsl(${hue2} 40% 22%)`} />
            <stop offset="100%" stopColor={`hsl(${hue} 25% 14%)`} />
          </linearGradient>
          <pattern id={`ev-p-${seed}`} width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 8L8 0M-2 2L2 -2M6 10L10 6" stroke="rgba(0,188,242,0.25)" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="120" height="100" fill={`url(#ev-g-${seed})`} />
        {pattern === 0 ? (
          <>
            <rect x="18" y="22" width="84" height="52" rx="3" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            <path d="M28 62 L48 42 L62 55 L78 35 L92 58" fill="none" stroke="#00BCF2" strokeWidth="1.8" opacity="0.7" />
            <circle cx="78" cy="35" r="3" fill="#7A3FF2" opacity="0.8" />
          </>
        ) : null}
        {pattern === 1 ? (
          <>
            <ellipse cx="60" cy="50" rx="38" ry="28" fill="none" stroke="rgba(0,164,166,0.55)" strokeWidth="1.2" />
            <ellipse cx="60" cy="50" rx="22" ry="16" fill="none" stroke="rgba(122,63,242,0.45)" strokeWidth="1" />
            <circle cx="60" cy="50" r="4" fill="#00BCF2" opacity="0.85" />
          </>
        ) : null}
        {pattern === 2 ? (
          <>
            <rect width="120" height="100" fill={`url(#ev-p-${seed})`} />
            <rect x="30" y="28" width="28" height="44" rx="2" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" />
            <rect x="62" y="28" width="28" height="44" rx="2" fill="rgba(0,188,242,0.15)" stroke="rgba(0,188,242,0.5)" />
          </>
        ) : null}
        {pattern === 3 ? (
          <>
            <path d="M20 70 Q40 30 60 55 T100 40" fill="none" stroke="#00BCF2" strokeWidth="2" opacity="0.65" />
            <circle cx="40" cy="42" r="5" fill="none" stroke="#7A3FF2" strokeWidth="1.2" />
            <circle cx="72" cy="48" r="7" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <text x="12" y="18" fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily="monospace">
              SURV · {String(seed % 900 + 100)}
            </text>
          </>
        ) : null}
      </svg>
      <p className="absolute bottom-1.5 left-1.5 right-1.5 truncate text-center font-serif text-[9px] italic text-[#5c5348]">
        {label.slice(0, 28)}
      </p>
      {/* Paperclip */}
      <svg
        className="absolute -right-2 -top-3 h-8 w-5 drop-shadow-sm"
        viewBox="0 0 20 32"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 4c-2.5 0-4.5 2-4.5 4.5v14a3.5 3.5 0 007 0V10.5a2 2 0 10-4 0v11"
          stroke="#8a9098"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function BinderClip({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 28" fill="none" aria-hidden="true">
      <rect x="2" y="8" width="36" height="12" rx="2" fill="#c4c8ce" stroke="#8a9098" strokeWidth="1" />
      <rect x="6" y="4" width="28" height="8" rx="1.5" fill="#d8dce2" stroke="#8a9098" strokeWidth="0.8" />
      <rect x="14" y="10" width="12" height="8" rx="1" fill="#aeb4bc" />
    </svg>
  )
}

function RedStringTie() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 520" aria-hidden="true">
      <path
        d="M 40 40 Q 200 80 360 40"
        fill="none"
        stroke="#8b1a1a"
        strokeWidth="1.4"
        opacity="0.55"
      />
      <circle cx="40" cy="40" r="5" fill="#8b1a1a" opacity="0.5" />
      <circle cx="360" cy="40" r="5" fill="#8b1a1a" opacity="0.5" />
      <path
        d="M 200 48 L 205 62 L 195 62 Z"
        fill="#8b1a1a"
        opacity="0.45"
      />
    </svg>
  )
}

function CasePage({
  file,
  index,
  total,
  reduced,
}: {
  file: CaseFile
  index: number
  total: number
  reduced: boolean
}) {
  const stamp = polarityStamp(file.theme.polarity, file.theme.sentimentScore)
  const coverage = file.mapping?.coverage ?? null
  const cloud = cloudTag(file.theme.cloudBoundary ?? file.mapping?.cloudBoundary)
  const coverClass =
    coverage === 'covered'
      ? 'border-[#0d7a6f] text-[#0d5c54]'
      : coverage === 'partial'
        ? 'border-[#b07d12] text-[#7a5508]'
        : coverage === 'gap'
          ? 'border-[#a33b3b] text-[#8a2f2f]'
          : 'border-[#7a7268] text-[#5c554c]'

  return (
    <article
      className="dossier-page relative flex h-full min-h-[28rem] w-full flex-col overflow-hidden rounded-sm border border-[#c9b896] bg-[#faf6eb] px-5 pb-5 pt-8 shadow-[0_8px_28px_rgba(60,40,10,0.18)] sm:px-8 sm:pt-10"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(80,60,30,0.04) 27px, rgba(80,60,30,0.04) 28px)',
      }}
    >
      <BinderClip className="absolute left-1/2 top-0 z-10 h-7 w-10 -translate-x-1/2 -translate-y-1/3" />
      <RedStringTie />

      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8a7f72]">
            File {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            {cloud ? ` · ${cloud}` : ''}
          </p>
          <h2 className="font-display mt-2 text-[clamp(1.35rem,3.5vw,2rem)] font-medium leading-snug tracking-tight text-[#1c1915]">
            {file.theme.name}
          </h2>
          <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-[#5c554c]">
            {file.theme.description}
          </p>
        </div>
        <EvidencePhoto seed={file.photoSeed} label={file.theme.name} />
      </div>

      <div className="relative z-[1] mt-5 flex flex-wrap items-center gap-2">
        <span
          className={`inline-block rotate-[-3deg] border-2 px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.18em] ${stamp.className}`}
          style={reduced ? undefined : { boxShadow: 'inset 0 0 0 1px currentColor' }}
        >
          {stamp.label}
        </span>
        <span
          className={`inline-block rotate-[2deg] border-2 border-dashed px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${coverClass}`}
        >
          ADO · {coverageLabel(coverage)}
        </span>
        <span className="inline-block rotate-[-1deg] border border-[#a33b3b]/70 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.2em] text-[#a33b3b]/90">
          CLASSIFIED / DEMO
        </span>
      </div>

      <div className="relative z-[1] mt-6 flex-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#8a7f72]">Field notes</p>
        <ul className="mt-3 space-y-3">
          {file.notes.length === 0 ? (
            <li className="font-serif text-sm italic text-[#8a7f72]">No mentions filed for this theme.</li>
          ) : (
            file.notes.map((m) => (
              <li
                key={m.id}
                className="border-l-2 border-[#c9b896] pl-3 font-serif text-[13px] leading-relaxed text-[#3d362e]"
              >
                <span className="text-[#8a7f72]">“</span>
                {m.text.length > 160 ? `${m.text.slice(0, 157)}…` : m.text}
                <span className="text-[#8a7f72]">”</span>
                <span className="mt-0.5 block font-sans text-[10px] text-[#8a7f72]">
                  — {m.handle}
                  {m.cloudBoundary && m.cloudBoundary !== 'unknown'
                    ? ` · ${cloudTag(m.cloudBoundary)}`
                    : ''}
                </span>
              </li>
            ))
          )}
        </ul>
        {file.mapping?.notes ? (
          <p className="mt-4 border-t border-dashed border-[#c9b896] pt-3 font-mono text-[11px] leading-relaxed text-[#5c554c]">
            Plan note: {file.mapping.notes}
          </p>
        ) : null}
      </div>

      <footer className="relative z-[1] mt-4 flex items-center justify-between border-t border-[#c9b896]/80 pt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#8a7f72]">
        <span>
          {file.theme.mentionCount} mention{file.theme.mentionCount === 1 ? '' : 's'} · trend{' '}
          {file.theme.trend > 0 ? '+' : ''}
          {Math.round(file.theme.trend)}%
        </span>
        <span>Fabric Pulse dossier</span>
      </footer>
    </article>
  )
}

/**
 * Dossier — manilla folder of case files (themes as pages) with paper-flip sound.
 */
export function Dossier({ snapshot, view, workload, cloud }: LayoutProps) {
  const reduced = useReducedMotion() ?? false
  const [opened, setOpened] = useState(false)
  const [index, setIndex] = useState(0)
  const [muted, setMuted] = useState(false)
  const [flipDir, setFlipDir] = useState<1 | -1>(1)
  const dragStartX = useRef<number | null>(null)

  const files: CaseFile[] = useMemo(() => {
    const sorted = [...view.themes].sort(
      (a, b) => b.mentionCount - a.mentionCount || Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore),
    )
    return sorted.map((theme, i) => {
      const mapping = resolveThemeMapping(theme.id, snapshot.themeMappings, cloud, workload)
      const ids = new Set(theme.mentionIds)
      const notes = view.mentions
        .filter((m) => ids.has(m.id))
        .sort((a, b) => a.sentimentScore - b.sentimentScore || b.likes - a.likes)
        .slice(0, 3)
      // stable-ish seed from theme id
      let seed = i * 17 + 3
      for (let c = 0; c < theme.id.length; c++) seed = (seed + theme.id.charCodeAt(c) * (c + 1)) % 997
      return { id: theme.id, theme, mapping, notes, photoSeed: seed }
    })
  }, [view.themes, view.mentions, snapshot.themeMappings, cloud, workload])

  // Reset page when filter / corpus changes
  useEffect(() => {
    setIndex(0)
  }, [workload, cloud, files.length])

  useEffect(() => {
    prefetchPageFlipSound()
  }, [])

  const go = useCallback(
    (next: number, dir: 1 | -1) => {
      if (files.length === 0) return
      const clamped = Math.max(0, Math.min(files.length - 1, next))
      if (clamped === index) return
      setFlipDir(dir)
      setIndex(clamped)
      void playPageFlip(muted)
    },
    [files.length, index, muted],
  )

  const next = useCallback(() => go(index + 1, 1), [go, index])
  const prev = useCallback(() => go(index - 1, -1), [go, index])

  useEffect(() => {
    if (!opened) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Escape') {
        setOpened(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [opened, next, prev])

  const openFolder = () => {
    setOpened(true)
    void playPageFlip(muted)
  }

  const tab = folderTabLabel(workload)
  const current = files[index] ?? null
  const duration = reduced ? 0.12 : 0.45

  return (
    <div className="dossier-stage relative flex min-h-[calc(100svh-7rem)] flex-col items-center justify-center overflow-hidden px-4 pb-10 pt-2 text-[#1c1915]">
      {/* Desk wood grain wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(255,250,240,0.5), transparent 60%), linear-gradient(160deg, #5c4030 0%, #3d2a1f 40%, #2a1c14 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)',
        }}
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="closed"
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            transition={{ duration }}
            className="relative z-10 w-full max-w-md"
          >
            <button
              type="button"
              onClick={openFolder}
              className="group relative mx-auto block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00BCF2]/60"
              aria-label="Open dossier"
            >
              {/* Folder tab */}
              <div className="ml-6 inline-block rounded-t-md border border-b-0 border-[#c4a96a] bg-[#e8d5a8] px-5 py-2 shadow-sm">
                <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#5c4a28]">
                  {tab}
                </p>
              </div>
              {/* Folder body */}
              <div
                className="relative overflow-hidden rounded-b-md rounded-tr-md border border-[#c4a96a] bg-gradient-to-br from-[#e8d5a8] via-[#dcc48a] to-[#c9b074] px-6 pb-8 pt-10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition group-hover:shadow-[0_24px_60px_rgba(0,0,0,0.42)]"
                style={{
                  transform: reduced ? undefined : 'perspective(800px) rotateX(2deg)',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-black/10 to-transparent" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[#6b5a38]">
                      Investigative brief
                    </p>
                    <p className="font-display mt-3 text-2xl font-medium tracking-tight text-[#2a2214]">
                      Case files
                    </p>
                    <p className="mt-2 font-mono text-[11px] text-[#6b5a38]">
                      {filterLabel(workload, cloud)}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[#6b5a38]">
                      {files.length} file{files.length === 1 ? '' : 's'} · {snapshot.dateRange.label}
                    </p>
                  </div>
                  <span className="rotate-[-8deg] border-2 border-[#a33b3b]/80 px-2 py-1 font-mono text-[10px] font-bold tracking-[0.16em] text-[#a33b3b]">
                    DEMO
                  </span>
                </div>
                {/* Stack peek */}
                <div className="relative mt-8 h-16">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="absolute inset-x-4 h-12 rounded-sm border border-[#c9b896]/80 bg-[#faf6eb]"
                      style={{
                        top: i * 5,
                        transform: `rotate(${(i - 1) * 1.2}deg)`,
                        opacity: 0.85 - i * 0.15,
                      }}
                    />
                  ))}
                </div>
                <p className="mt-6 flex items-center justify-center gap-2 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-[#5c4a28] transition group-hover:text-[#2a2214]">
                  <FolderOpen size={14} aria-hidden="true" />
                  Open dossier
                </p>
              </div>
            </button>
            <p className="mt-6 text-center font-serif text-sm italic text-[#e8dcc8]/80">
              Themes as case files — flip through the week’s evidence.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ opacity: 0, rotateY: reduced ? 0 : -18 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl"
            style={{ perspective: 1200 }}
          >
            {/* Open folder flaps */}
            <div className="relative">
              <div className="pointer-events-none absolute -left-3 top-6 bottom-6 w-8 rounded-l-md bg-gradient-to-r from-[#c9b074] to-[#dcc48a] opacity-90 shadow-md sm:-left-5 sm:w-10" />
              <div className="pointer-events-none absolute -right-3 top-6 bottom-6 w-8 rounded-r-md bg-gradient-to-l from-[#c9b074] to-[#dcc48a] opacity-90 shadow-md sm:-right-5 sm:w-10" />

              {/* Chrome */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpened(false)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#e8dcc8]/30 bg-[#2a1c14]/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#e8dcc8] backdrop-blur-sm hover:bg-[#2a1c14]/70"
                  >
                    <X size={12} aria-hidden="true" />
                    Close
                  </button>
                  <p className="font-mono text-[10px] tracking-[0.16em] text-[#e8dcc8]/70">
                    {tab}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dcc8]/30 bg-[#2a1c14]/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#e8dcc8] backdrop-blur-sm hover:bg-[#2a1c14]/70"
                  aria-pressed={muted}
                  aria-label={muted ? 'Unmute page flip sound' : 'Mute page flip sound'}
                >
                  {muted ? <VolumeX size={12} aria-hidden="true" /> : <Volume2 size={12} aria-hidden="true" />}
                  {muted ? 'Muted' : 'Sound'}
                </button>
              </div>

              <div
                className="relative touch-pan-y"
                onPointerDown={(e) => {
                  dragStartX.current = e.clientX
                }}
                onPointerUp={(e) => {
                  if (dragStartX.current == null) return
                  const dx = e.clientX - dragStartX.current
                  dragStartX.current = null
                  if (dx < -48) next()
                  else if (dx > 48) prev()
                }}
                onPointerCancel={() => {
                  dragStartX.current = null
                }}
              >
                <AnimatePresence mode="wait" custom={flipDir}>
                  {current ? (
                    <motion.div
                      key={current.id}
                      custom={flipDir}
                      initial={
                        reduced
                          ? { opacity: 0 }
                          : { opacity: 0, rotateY: flipDir * 55, x: flipDir * 40 }
                      }
                      animate={{ opacity: 1, rotateY: 0, x: 0 }}
                      exit={
                        reduced
                          ? { opacity: 0 }
                          : { opacity: 0, rotateY: flipDir * -45, x: flipDir * -30 }
                      }
                      transition={{ duration: reduced ? 0.1 : 0.38, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformStyle: 'preserve-3d', transformOrigin: 'left center' }}
                    >
                      <CasePage
                        file={current}
                        index={index}
                        total={files.length}
                        reduced={!!reduced}
                      />
                    </motion.div>
                  ) : (
                    <div className="rounded-sm border border-[#c9b896] bg-[#faf6eb] px-8 py-16 text-center shadow-lg">
                      <p className="font-display text-xl text-[#1c1915]">Empty dossier</p>
                      <p className="mt-2 font-serif text-sm text-[#8a7f72]">
                        No themes in this workload / cloud slice.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Nav */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={prev}
                  disabled={index <= 0 || files.length === 0}
                  className="inline-flex items-center gap-1 rounded-full border border-[#e8dcc8]/35 bg-[#2a1c14]/55 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#e8dcc8] disabled:opacity-30"
                >
                  <ChevronLeft size={14} aria-hidden="true" />
                  Prev
                </button>
                <p className="font-mono text-[11px] tracking-[0.16em] text-[#e8dcc8]/75">
                  {files.length === 0 ? '0 / 0' : `${index + 1} / ${files.length}`}
                </p>
                <button
                  type="button"
                  onClick={next}
                  disabled={index >= files.length - 1 || files.length === 0}
                  className="inline-flex items-center gap-1 rounded-full border border-[#e8dcc8]/35 bg-[#2a1c14]/55 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#e8dcc8] disabled:opacity-30"
                >
                  Next
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
              <p className="mt-3 text-center font-mono text-[9px] tracking-[0.16em] text-[#e8dcc8]/45">
                ← → keys · drag to flip · demo evidence only
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
