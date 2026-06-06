'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Player, Session, Attendance, SessionType } from '@/lib/types'
import { buildReport, toCsv, downloadCsv, CellStatus } from '@/lib/export'
import { Button } from '@/components/ui/button'
import DatePicker from '@/components/DatePicker'
import { cn } from '@/lib/utils'

type FilterType = 'all' | SessionType

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('de-CH', {
    day: 'numeric',
    month: 'short',
  })
}

function Cell({ status }: { status: CellStatus }) {
  if (status === 'x') return <span className="text-green-600 font-bold">✓</span>
  if (status === 'v.E.' || status === 'n.A.')
    return <span className="text-muted-foreground/50 text-[10px] italic">{status}</span>
  return <span className="text-muted-foreground/40">–</span>
}

export default function ReportPage() {
  const today = new Date().toISOString().slice(0, 10)
  const firstOfYear = new Date().getFullYear() + '-01-01'

  const [from, setFrom] = useState(firstOfYear)
  const [to, setTo] = useState(today)
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [players, setPlayers] = useState<Player[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()

    const onVisible = () => {
      if (document.visibilityState === 'visible') loadData()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: p }, { data: s }, { data: a }] = await Promise.all([
      supabase.from('players').select('*').order('vorname'),
      supabase.from('sessions').select('*').order('date'),
      supabase.from('attendance').select('*'),
    ])
    setPlayers(p ?? [])
    setSessions(s ?? [])
    setAttendance(a ?? [])
    setLoading(false)
  }

  const filteredSessions = sessions.filter((s) => {
    if (s.date < from || s.date > to) return false
    if (typeFilter !== 'all' && s.type !== typeFilter) return false
    return true
  })

  // Only include players who were active during any part of the selected period
  const reportPlayers = players.filter(
    (p) => p.joined_at <= to && (p.left_at === null || p.left_at >= from)
  )

  const report = buildReport(reportPlayers, filteredSessions, attendance)

  const hasAnnotations = report.some(
    (r) =>
      Object.values(r.sessions).includes('v.E.') ||
      Object.values(r.sessions).includes('n.A.')
  )

  function handleDownload() {
    const csv = toCsv(report, filteredSessions)
    downloadCsv(csv, `fc-zuerich-affoltern-fb_anwesenheiten_${from}_${to}.csv`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Report</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Anwesenheiten als CSV exportieren</p>
      </div>

      {/* Filter */}
      <div className="space-y-4 bg-muted/40 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Von</label>
            <DatePicker value={from} onChange={setFrom} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bis</label>
            <DatePicker value={to} onChange={setTo} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Typ</label>
          <div className="flex gap-2">
            {(['all', 'training', 'turnier'] as FilterType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all',
                  typeFilter === t
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground'
                )}
              >
                {t === 'all' ? 'Alle' : t === 'training' ? '🏃 Training' : '🏆 Turnier'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-muted-foreground text-sm">Lädt…</div>
      )}

      {!loading && filteredSessions.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">
          Keine Sessions im gewählten Zeitraum.
        </p>
      )}

      {!loading && filteredSessions.length > 0 && (
        <>
          <div className="text-sm text-muted-foreground">
            {filteredSessions.length} Session{filteredSessions.length !== 1 ? 's' : ''} · {reportPlayers.length} Spieler
          </div>

          {/* Vorschau-Tabelle */}
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Vorname</th>
                  {filteredSessions.map((s) => (
                    <th
                      key={s.id}
                      className="px-2 py-2 font-medium text-center whitespace-nowrap"
                      title={`${s.date}${s.label ? ' – ' + s.label : ''}`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-base leading-none">{s.type === 'training' ? '🏃' : '🏆'}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDate(s.date)}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.map((row) => (
                  <tr key={row.vorname} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{row.vorname}</td>
                    {filteredSessions.map((s) => (
                      <td key={s.id} className="px-2 py-2 text-center">
                        <Cell status={row.sessions[s.id] ?? ''} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legende */}
          {hasAnnotations && (
            <div className="text-xs text-muted-foreground/70 space-y-0.5">
              <p><span className="italic">v.E.</span> = vor Eintritt (war noch nicht im Team)</p>
              <p><span className="italic">n.A.</span> = nach Austritt (war nicht mehr im Team)</p>
            </div>
          )}

          {/* Export-Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleDownload}
              className="rounded-xl h-11 w-11 p-0 bg-primary hover:bg-primary/80 text-primary-foreground"
              title="CSV herunterladen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
