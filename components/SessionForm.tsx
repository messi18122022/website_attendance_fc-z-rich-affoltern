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
}

export default function SessionForm({ players, initialSession, initialAttendance }: Props) {
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

      {/* Label (optional) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Name <span className="normal-case font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="z.B. Pfingstturnier"
          className={inputClass}
        />
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

      {/* Speichern */}
      <Button className="w-full h-12 text-sm font-bold rounded-xl" onClick={handleSave} disabled={saving}>
        {saving ? 'Speichert…' : initialSession ? 'Änderungen speichern' : 'Session speichern'}
      </Button>
    </div>
  )
}
