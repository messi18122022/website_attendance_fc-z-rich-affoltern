'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Player } from '@/lib/types'
import SessionForm from '@/components/SessionForm'

export default function NewSessionPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('players')
      .select('*')
      .eq('active', true)
      .order('vorname')
      .then(({ data }) => {
        setPlayers(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/" className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/60 transition-colors -ml-1" title="Zurück">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold">Neue Session</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Lädt…</div>
      ) : (
        <SessionForm players={players} />
      )}
    </div>
  )
}
