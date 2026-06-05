'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Player, Session, Attendance, SessionType } from '@/lib/types'
import { buildReport, toCsv, downloadCsv, shareCsv } from '@/lib/export'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type FilterType = 'all' | SessionType

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('de-CH', {
    day: 'numeric',
    month: 'short',
  })
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
  const [sharing, setSharing] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: p }, { data: s }, { data: a }] = await Promise.all([
      supabase.from('players').select('*').eq('active', true).order('vorname'),
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

  const report = buildReport(players, filteredSessions, attendance)

  async function handleExport() {
    const csv = toCsv(report, filteredSessions)
    const filename = `anwesenheiten_${from}_${to}.csv`
    setSharing(true)
    try {
      await shareCsv(csv, filename)
    } finally {
      setSharing(false)
    }
  }

  function handleDownload() {
    const csv = toCsv(report, filteredSessions)
    downloadCsv(csv, `anwesenheiten_${from}_${to}.csv`)
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
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bis</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
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
                {t === 'all' ? 'Alle' : t === 'training' ? 'Training' : 'Turnier'}
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
          {/* Zusammenfassung */}
          <div className="text-sm text-muted-foreground">
            {filteredSessions.length} Session{filteredSessions.length !== 1 ? 's' : ''} gefunden
          </div>

          {/* Vorschau-Tabelle */}
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Datum</th>
                  <th className="text-left px-2 py-2 font-medium whitespace-nowrap">Typ</th>
                  {report.map((row) => (
                    <th key={row.vorname} className="px-2 py-2 font-medium text-center whitespace-nowrap">
                      {row.vorname}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => {
                  return (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatDate(s.date)}{s.label ? ` – ${s.label}` : ''}
                      </td>
                      <td className="px-2 py-2">
                        <Badge variant={s.type === 'training' ? 'secondary' : 'default'} className="text-[10px] px-1 py-0">
                          {s.type === 'training' ? 'Training' : 'Turnier'}
                        </Badge>
                      </td>
                      {report.map((row) => (
                        <td key={row.vorname} className="px-2 py-2 text-center">
                          {row.sessions[s.id] ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-muted-foreground/40">–</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Export-Buttons */}
          <div className="flex gap-3">
            {canShare ? (
              <Button className="flex-1" onClick={handleExport} disabled={sharing}>
                {sharing ? 'Teilt…' : '⬆ Teilen / Speichern'}
              </Button>
            ) : (
              <Button className="flex-1" onClick={handleDownload}>
                ⬇ CSV herunterladen
              </Button>
            )}
            {canShare && (
              <Button variant="outline" onClick={handleDownload}>
                ⬇ Download
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
