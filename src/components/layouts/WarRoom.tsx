import { useMemo, useState } from 'react'
import { CheckCircle2, Clock3, UserPlus, Zap } from 'lucide-react'
import { WORKLOAD_CATALOG } from '../../data/catalog'
import { detectSpikes, severityInbox } from '../../layout/brief'
import { formatNet, initials, relativeFrom } from '../../lib/format'
import { Card, EffortImpact, EmptyState, ToneBadge } from '../ui'
import type { LayoutProps } from './types'

type AssignState = Record<string, { status: 'open' | 'claimed' | 'snoozed'; owner: string }>

export function WarRoom({ snapshot, view, setThemeId, setWorkload }: LayoutProps) {
  const spikes = useMemo(() => detectSpikes(view.daily), [view.daily])
  const inbox = useMemo(
    () => severityInbox(view.themes, snapshot.actions, view.mentions, spikes),
    [view.themes, snapshot.actions, view.mentions, spikes],
  )
  const [selectedId, setSelectedId] = useState(inbox[0]?.id ?? '')
  const [assign, setAssign] = useState<AssignState>({})

  const selected = inbox.find((item) => item.id === selectedId) ?? inbox[0] ?? null

  const evidenceMentions = useMemo(() => {
    if (!selected) return []
    const idSet = new Set(selected.mentionIds)
    return view.mentions.filter((m) => idSet.has(m.id)).slice(0, 6)
  }, [selected, view.mentions])

  const linkedAction = selected?.actionId
    ? snapshot.actions.find((a) => a.id === selected.actionId)
    : selected?.themeId
      ? snapshot.actions.find((a) => a.relatedThemeIds.includes(selected.themeId!))
      : snapshot.actions[0]

  const state = selected ? assign[selected.id] : undefined

  const claim = (owner: string) => {
    if (!selected) return
    setAssign((prev) => ({
      ...prev,
      [selected.id]: { status: 'claimed', owner },
    }))
  }

  const snooze = () => {
    if (!selected) return
    setAssign((prev) => ({
      ...prev,
      [selected.id]: { status: 'snoozed', owner: prev[selected.id]?.owner ?? '—' },
    }))
  }

  const openTheme = () => {
    if (selected?.themeId) {
      setThemeId(selected.themeId)
      setWorkload('all')
    }
  }

  return (
    <div className="ops-dense -mx-1 rounded-xl border border-line bg-canvas/60 p-2 sm:p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-amber" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">War Room · triage</h2>
          <ToneBadge tone="amber" label={`${inbox.length} open`} />
          <ToneBadge tone="mute" label="Demo" />
        </div>
        <p className="text-[11px] text-faint">Dense ops · claim / snooze is local demo state only</p>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[240px_minmax(0,1fr)_280px] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* Inbox */}
        <Card className="!rounded-lg p-2">
          <p className="mb-2 px-1 text-[10px] uppercase tracking-wider text-faint">Severity inbox</p>
          {inbox.length === 0 ? (
            <EmptyState label="All clear for this scope" />
          ) : (
            <ul className="max-h-[70vh] space-y-1 overflow-auto">
              {inbox.map((item) => {
                const active = item.id === selected?.id
                const st = assign[item.id]
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`flex w-full flex-col gap-0.5 rounded-md border px-2 py-1.5 text-left transition ${
                        active
                          ? 'border-amber/50 bg-amber/10'
                          : 'border-transparent hover:border-line hover:bg-elevated/50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <SeverityDot severity={item.severity} />
                        <span className="truncate text-[12px] font-medium text-ink">{item.title}</span>
                      </span>
                      <span className="truncate pl-3.5 text-[10px] text-mute">{item.detail}</span>
                      {st ? (
                        <span className="pl-3.5 text-[10px] text-teal-bright">
                          {st.status === 'claimed' ? `Claimed · ${st.owner}` : 'Snoozed'}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* Evidence */}
        <Card className="!rounded-lg p-3">
          {!selected ? (
            <EmptyState label="Select an inbox item" />
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <SeverityDot severity={selected.severity} />
                    <h3 className="text-sm font-semibold text-ink">{selected.title}</h3>
                    <ToneBadge tone="mute" label={selected.kind} />
                  </div>
                  <p className="mt-1 text-[12px] text-mute">{selected.detail}</p>
                </div>
                {selected.themeId ? (
                  <button
                    type="button"
                    onClick={openTheme}
                    className="rounded-md border border-line px-2 py-1 text-[11px] text-teal-bright hover:bg-elevated"
                  >
                    Scope theme
                  </button>
                ) : null}
              </div>

              {selected.kind === 'spike' && selected.date ? (
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {view.daily
                    .filter((d) => d.date === selected.date)
                    .map((d) => (
                      <div key={d.date} className="rounded-md border border-line bg-elevated/40 px-2 py-1.5 text-center">
                        <p className="text-[10px] text-faint">{d.label}</p>
                        <p className="text-sm font-semibold text-ink">{d.volume}</p>
                        <p className="text-[10px] text-mute">net {formatNet(d.net)}</p>
                      </div>
                    ))}
                  <div className="rounded-md border border-line bg-elevated/40 px-2 py-1.5 text-center">
                    <p className="text-[10px] text-faint">Pos</p>
                    <p className="text-sm font-semibold text-pos">
                      {view.daily.find((d) => d.date === selected.date)?.positive ?? 0}
                    </p>
                  </div>
                  <div className="rounded-md border border-line bg-elevated/40 px-2 py-1.5 text-center">
                    <p className="text-[10px] text-faint">Neg</p>
                    <p className="text-sm font-semibold text-neg">
                      {view.daily.find((d) => d.date === selected.date)?.negative ?? 0}
                    </p>
                  </div>
                </div>
              ) : null}

              <p className="mb-1.5 text-[10px] uppercase tracking-wider text-faint">Evidence mentions</p>
              <ul className="max-h-[48vh] space-y-1.5 overflow-auto">
                {evidenceMentions.length === 0 ? (
                  <li className="text-[12px] text-mute">No linked mentions in demo filter.</li>
                ) : (
                  evidenceMentions.map((mention) => (
                    <li
                      key={mention.id}
                      className="flex gap-2 rounded-md border border-line bg-elevated/30 px-2 py-1.5"
                    >
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-teal/15 text-[9px] font-semibold text-teal-bright">
                        {initials(mention.author)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-x-2 text-[10px] text-faint">
                          <span className="font-medium text-ink">{mention.handle}</span>
                          <span>{relativeFrom(mention.createdAt, snapshot.generatedAt)}</span>
                          <span>{WORKLOAD_CATALOG[mention.workload].shortLabel}</span>
                          <span className="capitalize">{mention.sentiment}</span>
                        </div>
                        <p className="mt-0.5 text-[12px] leading-snug text-ink/90">{mention.text}</p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </>
          )}
        </Card>

        {/* Assign */}
        <Card className="!rounded-lg p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-faint">Action · assign</p>
          {linkedAction ? (
            <div className="rounded-md border border-line bg-elevated/40 p-2.5">
              <p className="text-[13px] font-medium text-ink">{linkedAction.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-mute">{linkedAction.rationale}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <EffortImpact effort={linkedAction.effort} impact={linkedAction.impact} />
                <ToneBadge tone="mute" label={linkedAction.ownerHint} />
              </div>
            </div>
          ) : (
            <EmptyState label="No linked action" />
          )}

          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-faint">Quick assign (demo)</p>
            {['PM on-call', 'Workload lead', linkedAction?.ownerHint ?? 'Owner'].map((owner) => (
              <button
                key={owner}
                type="button"
                onClick={() => claim(owner)}
                className="flex w-full items-center gap-2 rounded-md border border-line px-2 py-1.5 text-left text-[12px] text-ink hover:border-teal/40 hover:bg-teal/10"
              >
                <UserPlus size={12} className="text-teal" />
                Claim → {owner}
              </button>
            ))}
            <button
              type="button"
              onClick={snooze}
              className="flex w-full items-center gap-2 rounded-md border border-line px-2 py-1.5 text-left text-[12px] text-mute hover:bg-elevated"
            >
              <Clock3 size={12} />
              Snooze 24h
            </button>
          </div>

          {state ? (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-pos/30 bg-pos/10 px-2 py-1.5 text-[11px] text-pos">
              <CheckCircle2 size={14} />
              {state.status === 'claimed' ? `Assigned to ${state.owner}` : 'Snoozed locally'}
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-faint">Status: needs owner</p>
          )}
        </Card>
      </div>
    </div>
  )
}

function SeverityDot({ severity }: { severity: 'critical' | 'high' | 'medium' }) {
  const cls =
    severity === 'critical' ? 'bg-neg' : severity === 'high' ? 'bg-amber' : 'bg-mute'
  return <span className={`size-2 shrink-0 rounded-full ${cls}`} title={severity} />
}
