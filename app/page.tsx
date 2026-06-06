'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SessionWithCount } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import SessionCard from '@/components/SessionCard'
import { cn } from '@/lib/utils'

function SessionCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 px-4 py-3.5 animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-4 w-28 rounded bg-muted" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-12 rounded bg-muted" />
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="h-8 w-16 rounded-lg bg-muted" />
          <div className="h-8 w-8 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()

    const onVisible = () => {
      if (document.visibilityState === 'visible') loadSessions()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
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
        <Link href="/session/new" className={cn(buttonVariants(), 'rounded-xl h-10 w-10 p-0')} title="Neue Session">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </Link>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SessionCardSkeleton key={i} />)}
        </div>
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
