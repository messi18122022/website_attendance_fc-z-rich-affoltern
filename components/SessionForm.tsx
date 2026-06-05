'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Player, Session, SessionType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AttendanceGrid from '@/components/AttendanceGrid'
import { cn } from '@/lib/utils'

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
    <div className="space-y-6">
      {/* Datum */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Datum</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Typ */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Typ</label>
        <div className="flex gap-2">
          {(['training', 'turnier'] as SessionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                type === t
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-muted-foreground/40'
              )}
            >
              {t === 'training' ? '🏃 Training' : '🏆 Turnier'}
            </button>
          ))}
        </div>
      </div>

      {/* Label (optional) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Name <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="z.B. Pfingstturnier"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Anwesenheiten */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={setAllPresent}
            className="text-xs text-green-700 underline underline-offset-2"
          >
            Alle da
          </button>
          <span className="text-xs text-muted-foreground">·</span>
          <button
            type="button"
            onClick={setAllAbsent}
            className="text-xs text-muted-foreground underline underline-offset-2"
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
      <Button
        className="w-full"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Speichert…' : initialSession ? 'Änderungen speichern' : 'Session speichern'}
      </Button>
    </div>
  )
}
