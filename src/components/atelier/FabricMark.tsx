/** Quiet Fabric wordmark / weave mark — one placement per screen. */
export function FabricMark({
  variant = 'wordmark',
  className = '',
}: {
  variant?: 'wordmark' | 'weave' | 'seal'
  className?: string
}) {
  if (variant === 'weave') {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`size-5 text-[#00BCF2] ${className}`}
        aria-hidden="true"
      >
        <path
          d="M4 10h24M4 16h24M4 22h24M10 4v24M16 4v24M22 4v24"
          stroke="currentColor"
          strokeWidth="1.1"
          fill="none"
          opacity="0.85"
        />
        <path d="M4 16h24" stroke="#7A3FF2" strokeWidth="1.4" opacity="0.7" />
      </svg>
    )
  }

  if (variant === 'seal') {
    return (
      <div
        className={`inline-flex size-10 items-center justify-center rounded-sm border-2 border-[#7A3FF2]/80 text-[9px] font-semibold tracking-wider text-[#7A3FF2] ${className}`}
        aria-hidden="true"
      >
        FP
      </div>
    )
  }

  return (
    <div className={className}>
      <p className="text-sm font-medium tracking-tight">Fabric Pulse</p>
      <div
        className="mt-1.5 h-px w-14 bg-gradient-to-r from-[#00BCF2] via-[#00A4A6] to-transparent"
        aria-hidden="true"
      />
    </div>
  )
}
