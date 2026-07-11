'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Player } from '@/lib/types'
import { Button } from '@/components/ui/button'
import DatePicker from '@/components/DatePicker'
import { cn } from '@/lib/utils'

const inputClass =
  'w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('de-CH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function TeamPage() {
  const today = new Date().toISOString().slice(0, 10)

  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Austritt inline state
  const [austrittFor, setAustrittFor] = useState<string | null>(null)
  const [austrittDate, setAustrittDate] = useState(today)

  // Geburtsdatum-Bearbeiten inline state
  const [editBirthdateFor, setEditBirthdateFor] = useState<string | null>(null)
  const [editBirthdateValue, setEditBirthdateValue] = useState('')

  // Neuer Spieler form state
  const [showAdd, setShowAdd] = useState(false)
  const [newVorname, setNewVorname] = useState('')
  const [newJoinedAt, setNewJoinedAt] = useState(today)
  const [newBirthdate, setNewBirthdate] = useState('')

  useEffect(() => {
    loadPlayers()

    const onVisible = () => {
      if (document.visibilityState === 'visible') loadPlayers()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  async function loadPlayers() {
    const { data } = await supabase.from('players').select('*').order('vorname')
    setPlayers(data ?? [])
    setLoading(false)
  }

  async function handleAustritt(playerId: string) {
    setSaving(true)
    await supabase
      .from('players')
      .update({ left_at: austrittDate, active: false })
      .eq('id', playerId)
    setAustrittFor(null)
    await loadPlayers()
    setSaving(false)
  }

  async function handleWiedereintritt(playerId: string) {
    setSaving(true)
    await supabase
      .from('players')
      .update({ left_at: null, active: true })
      .eq('id', playerId)
    await loadPlayers()
    setSaving(false)
  }

  async function handleAddPlayer() {
    if (!newVorname.trim() || !newBirthdate) return
    setSaving(true)
    await supabase.from('players').insert({
      vorname: newVorname.trim(),
      joined_at: newJoinedAt,
      birthdate: newBirthdate,
      active: true,
    })
    setNewVorname('')
    setNewJoinedAt(today)
    setNewBirthdate('')
    setShowAdd(false)
    await loadPlayers()
    setSaving(false)
  }

  async function handleSaveBirthdate(playerId: string) {
    if (!editBirthdateValue) return
    setSaving(true)
    await supabase
      .from('players')
      .update({ birthdate: editBirthdateValue })
      .eq('id', playerId)
    setEditBirthdateFor(null)
    await loadPlayers()
    setSaving(false)
  }

  const active = players.filter((p) => p.active)
  const former = players.filter((p) => !p.active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Mannschaft</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {active.length} aktive Spieler
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setNewVorname(''); setNewJoinedAt(today); setNewBirthdate('') }}
          className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
          title="Spieler hinzufügen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Neuer-Spieler-Form */}
      {showAdd && (
        <div className="bg-muted/40 rounded-xl border p-4 space-y-3">
          <p className="text-sm font-semibold">Neuer Spieler</p>
          <input
            type="text"
            placeholder="Vorname"
            value={newVorname}
            onChange={(e) => setNewVorname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            className={inputClass}
            autoFocus
          />
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Eintrittsdatum</label>
            <DatePicker value={newJoinedAt} onChange={setNewJoinedAt} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Geburtsdatum</label>
            <DatePicker
              value={newBirthdate}
              onChange={setNewBirthdate}
              captionLayout="dropdown"
              fromYear={new Date().getFullYear() - 25}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddPlayer}
              disabled={saving || !newVorname.trim() || !newBirthdate}
              className="flex-1 rounded-xl h-10 text-sm font-semibold"
            >
              Hinzufügen
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowAdd(false)}
              className="rounded-xl h-10"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Lädt…</div>
      ) : (
        <>
          {/* Aktives Kader */}
          <div className="space-y-2">
            {active.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Keine aktiven Spieler.</p>
            )}
            {active.map((player) => (
              <div key={player.id} className="bg-card rounded-xl border border-border/60 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 gap-3">
                  <div>
                    <p className="font-semibold text-sm">{player.vorname}</p>
                    <p className="text-xs text-muted-foreground">
                      Eintritt: {formatDate(player.joined_at)}
                    </p>
                    {player.birthdate ? (
                      <p className="text-xs text-muted-foreground">
                        Geburtstag: {formatDate(player.birthdate)}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-500 font-medium">
                        ⚠ Kein Geburtsdatum
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {editBirthdateFor === player.id ? (
                      <button
                        onClick={() => setEditBirthdateFor(null)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Abbrechen
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditBirthdateFor(player.id)
                          setEditBirthdateValue(player.birthdate ?? '')
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Geburtsdatum bearbeiten
                      </button>
                    )}
                    {austrittFor === player.id ? (
                      <button
                        onClick={() => setAustrittFor(null)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Abbrechen
                      </button>
                    ) : (
                      <button
                        onClick={() => { setAustrittFor(player.id); setAustrittDate(today) }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Austritt erfassen
                      </button>
                    )}
                  </div>
                </div>

                {editBirthdateFor === player.id && (
                  <div className="border-t bg-muted/30 px-4 py-3 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        Geburtsdatum
                      </label>
                      <DatePicker
                        value={editBirthdateValue}
                        onChange={setEditBirthdateValue}
                        captionLayout="dropdown"
                        fromYear={new Date().getFullYear() - 25}
                      />
                    </div>
                    <Button
                      onClick={() => handleSaveBirthdate(player.id)}
                      disabled={saving || !editBirthdateValue}
                      className="w-full rounded-xl h-10 text-sm font-semibold"
                    >
                      Speichern
                    </Button>
                  </div>
                )}

                {austrittFor === player.id && (
                  <div className="border-t bg-muted/30 px-4 py-3 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        Austrittsdatum
                      </label>
                      <DatePicker value={austrittDate} onChange={setAustrittDate} />
                    </div>
                    <button
                      onClick={() => handleAustritt(player.id)}
                      disabled={saving}
                      className={cn(
                        'w-full h-10 rounded-xl text-sm font-semibold transition-colors',
                        'bg-destructive/90 text-destructive-foreground hover:bg-destructive',
                        saving && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      Austritt bestätigen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Ehemalige */}
          {former.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ehemalige
              </p>
              {former.map((player) => (
                <div
                  key={player.id}
                  className="bg-card/50 rounded-xl border border-border/40 px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">{player.vorname}</p>
                    <p className="text-xs text-muted-foreground/60">
                      {formatDate(player.joined_at)}
                      {player.left_at ? ` → ${formatDate(player.left_at)}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleWiedereintritt(player.id)}
                    disabled={saving}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    Wiedereintritt
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
