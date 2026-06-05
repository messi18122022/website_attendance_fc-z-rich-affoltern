'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Player, Session } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import SessionForm from '@/components/SessionForm'
import { cn } from '@/lib/utils'

export default function EditSessionPage() {
  const { id } = useParams<{ id: string }>()
  const [players, setPlayers] = useState<Player[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: sessionData }, { data: playerData }, { data: attendanceData }] =
        await Promise.all([
          supabase.from('sessions').select('*').eq('id', id).single(),
          supabase.from('players').select('*').eq('active', true).order('vorname'),
          supabase.from('attendance').select('*').eq('session_id', id),
        ])

      setSession(sessionData)
      setPlayers(playerData ?? [])

      const map: Record<string, boolean> = {}
      for (const p of playerData ?? []) {
        const record = (attendanceData ?? []).find((a) => a.player_id === p.id)
        map[p.id] = record?.present ?? false
      }
      setAttendance(map)
      setLoading(false)
    }
    load()
  }, [id])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2')}>
          ← Zurück
        </Link>
        <h1 className="text-xl font-bold">Session bearbeiten</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Lädt…</div>
      ) : session ? (
        <SessionForm
          players={players}
          initialSession={session}
          initialAttendance={attendance}
        />
      ) : (
        <p className="text-muted-foreground text-sm">Session nicht gefunden.</p>
      )}
    </div>
  )
}
