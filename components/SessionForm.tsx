'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Player, Session, SessionType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import AttendanceGrid from '@/components/AttendanceGrid'
import DatePicker from '@/components/DatePicker'
import { cn } from '@/lib/utils'

const inputClass = 'w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all'

interface Props {
  players: Player[]
  initialSession?: Session
  initialAttendance?: Record<string, boolean>
  onDelete?: () => void
}

export default function SessionForm({ players, initialSession, initialAttendance, onDelete }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)

  const [date, setDate] = useState(initialSession?.date ?? today)
  const [type, setType] = useState<SessionType>(initialSession?.type ?? 'training')
  const [label, setLabel] = useState(initialSession?.label ?? '')
  const [attendance, setAttendance] = useState<Record<string, boolean>>(
    initialAttendance ?? Object.fromEntries(players.map((p) => [p.id, false]))
  )
  const [saving, setSaving] = useState(false)

  function toggleAttendance(playerId: string, present: boolean) {
    setAttendance((prev) => ({ ...prev, [playerId]: present }))
  }

  function setAllPresent() {
    setAttendance(Object.fromEntries(players.map((p) => [p.id, true])))
  }

  function setAllAbsent() {
    setAttendance(Object.fromEntries(players.map((p) => [p.id, false])))
  }

  async function handleSave() {
    setSaving(true)

    let sessionId = initialSession?.id

    if (initialSession) {
      await supabase
        .from('sessions')
        .update({ date, type, label: label || null })
        .eq('id', initialSession.id)
    } else {
      const { data } = await supabase
        .from('sessions')
        .insert({ date, type, label: label || null })
        .select()
        .single()
      sessionId = data?.id
    }

    if (!sessionId) { setSaving(false); return }

    const upserts = players.map((p) => ({
      session_id: sessionId!,
      player_id: p.id,
      present: attendance[p.id] ?? false,
    }))

    await supabase
      .from('attendance')
      .upsert(upserts, { onConflict: 'session_id,player_id' })

    router.push('/')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Datum */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Datum</label>
        <DatePicker value={date} onChange={setDate} />
      </div>

      {/* Typ */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Typ</label>
        <div className="grid grid-cols-2 gap-2">
          {(['training', 'turnier'] as SessionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'py-3 rounded-xl border-2 text-sm font-semibold transition-all',
                type === t
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
              )}
            >
              {t === 'training' ? '🏃 Training' : '🏆 Turnier'}
            </button>
          ))}
        </div>
      </div>

      {/* Anwesenheiten */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={setAllPresent}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Alle da
          </button>
          <span className="text-muted-foreground/40">·</span>
          <button
            type="button"
            onClick={setAllAbsent}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Alle weg
          </button>
        </div>
        <AttendanceGrid
          players={players}
          attendance={attendance}
          onChange={toggleAttendance}
        />
      </div>

      {/* Aktionen */}
      <div className="flex items-center justify-between">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            title="Session löschen"
            className="h-12 w-12 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        ) : <div />}

        <Button
          className="h-12 w-12 rounded-xl p-0"
          onClick={handleSave}
          disabled={saving}
          title={initialSession ? 'Änderungen speichern' : 'Session speichern'}
        >
          {saving ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin opacity-60">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </Button>
      </div>
    </div>
  )
}
