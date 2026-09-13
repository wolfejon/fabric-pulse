import { ModeSwitcher } from './ModeSwitcher'

/** Wordmark + thin cyan line + mode switcher for Weather / Letter. */
export function MinimalChrome({ inkClass = 'text-[#1a2a3a]' }: { inkClass?: string }) {
  return (
    <div className={`relative z-20 ${inkClass}`}>
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div>
          <p className="text-sm font-medium tracking-tight">Fabric Pulse</p>
          <div
            className="mt-2 h-px w-16 bg-gradient-to-r from-[#00b7c3] to-transparent"
            aria-hidden="true"
          />
        </div>
        <ModeSwitcher variant="artistic" />
      </div>
    </div>
  )
}
