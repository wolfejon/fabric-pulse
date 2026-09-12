export function DemoBanner() {
  return (
    <div className="border-b border-amber/25 bg-amber/10 px-4 py-2 text-center text-[13px] text-amber">
      <strong className="font-semibold">Demo data — not live X feed.</strong>
      <span className="ml-1.5 text-amber/80">
        Sample mentions, themes, and news for product-team prototyping. No live scraping or API calls.
      </span>
    </div>
  )
}
