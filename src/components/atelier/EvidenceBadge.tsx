import type { VolumeClass } from '../../types'
import { evidenceBadgeText } from '../../lib/evidence'

export function EvidenceBadge({
  mentionCount,
  uniqueAuthors,
  volumeClass,
  onClick,
  compact = false,
  tone = 'light',
}: {
  mentionCount: number
  uniqueAuthors: number
  volumeClass: VolumeClass
  onClick?: () => void
  compact?: boolean
  tone?: 'light' | 'dark' | 'ink'
}) {
  const label = evidenceBadgeText(mentionCount, uniqueAuthors, volumeClass)
  const cue =
    volumeClass === 'crowd'
      ? 'border-[#0d7a6f]/40 bg-[#0d7a6f]/10 text-[#0d5c54]'
      : volumeClass === 'thin'
        ? 'border-[#b07d12]/35 bg-[#b07d12]/10 text-[#7a5508]'
        : 'border-[#7a7870]/35 bg-[#7a7870]/08 text-[#5c5a54]'

  const darkCue =
    volumeClass === 'crowd'
      ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
      : volumeClass === 'thin'
        ? 'border-amber-300/40 bg-amber-300/10 text-amber-100'
        : 'border-white/25 bg-white/10 text-white/75'

  const inkCue =
    volumeClass === 'crowd'
      ? 'border-[#00A4A6]/45 bg-[#00A4A6]/08 text-[#0d5c54]'
      : volumeClass === 'thin'
        ? 'border-[#7A3FF2]/35 bg-[#7A3FF2]/08 text-[#5a3a9a]'
        : 'border-[#c8c2b4] bg-[#f3efe6] text-[#5c5a54]'

  const palette = tone === 'dark' ? darkCue : tone === 'ink' ? inkCue : cue
  const short =
    compact && mentionCount === 1
      ? '1 mention · single voice'
      : compact
        ? label
        : label

  const className = `inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] ${palette} ${
    onClick ? 'cursor-pointer transition hover:opacity-90' : ''
  }`

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} title="Open evidence">
        {short}
      </button>
    )
  }

  return <span className={className}>{short}</span>
}
