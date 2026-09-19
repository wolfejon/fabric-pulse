/** Quiet Fabric wordmark / weave mark — one placement per screen. */
export function FabricMark({
  variant = 'wordmark',
  className = '',
}: {
  variant?: 'wordmark' | 'weave' | 'seal' | 'lockup'
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

  /** Fabric portal-style lockup for BI / analytics surfaces. */
  if (variant === 'lockup') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <svg viewBox="0 0 28 28" className="size-7 shrink-0" aria-hidden="true">
          <defs>
            <linearGradient id="fabricBloom" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00BCF2" />
              <stop offset="55%" stopColor="#00A4A6" />
              <stop offset="100%" stopColor="#7A3FF2" />
            </linearGradient>
          </defs>
          <polygon
            points="14,2 25,8.5 25,19.5 14,26 3,19.5 3,8.5"
            fill="url(#fabricBloom)"
            opacity="0.92"
          />
          <polygon
            points="14,7 20,10.5 20,17.5 14,21 8,17.5 8,10.5"
            fill="#ffffff"
            opacity="0.92"
          />
        </svg>
        <div className="min-w-0 leading-tight">
          <p className="text-[18px] font-semibold tracking-tight text-[#242424]">
            <span className="relative inline-block">
              Fabric
              <span
                className="absolute inset-x-0 -bottom-0.5 h-px bg-[#00BCF2]"
                aria-hidden="true"
              />
            </span>{' '}
            <span>Pulse</span>
          </p>
          <p className="mt-0.5 text-[11px] font-normal text-[#616161]">
            Analytics · Microsoft Fabric
          </p>
        </div>
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
