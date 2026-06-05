'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SessionWithCount } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import SessionCard from '@/components/SessionCard'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    setLoading(true)

    const { data: sessionData } = await supabase
      .from('sessions')
      .select('*')
      .order('date', { ascending: false })

    if (!sessionData) { setLoading(false); return }

    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('session_id, present')

    const { data: playerData } = await supabase
      .from('players')
      .select('id')
      .eq('active', true)

    const totalPlayers = playerData?.length ?? 0

    const enriched: SessionWithCount[] = sessionData.map((s) => {
      const relevant = (attendanceData ?? []).filter((a) => a.session_id === s.id)
      const presentCount = relevant.filter((a) => a.present).length
      return { ...s, present_count: presentCount, total_count: totalPlayers }
    })

    setSessions(enriched)
    setLoading(false)
  }

  async function deleteSession(id: string) {
    await supabase.from('sessions').delete().eq('id', id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Anwesenheiten</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Saison 25/26</p>
        </div>
        <Link href="/session/new" className={cn(buttonVariants(), 'font-bold rounded-xl')}>
          + Neue Session
        </Link>
      </div>

      {loading && (
        <div className="text-center py-12 text-muted-foreground text-sm">Lädt…</div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">⚽</p>
          <p className="text-muted-foreground text-sm">Noch keine Sessions erfasst.</p>
          <Link href="/session/new" className={cn(buttonVariants({ variant: 'outline' }))}>
            Erste Session erstellen
          </Link>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={() => deleteSession(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
