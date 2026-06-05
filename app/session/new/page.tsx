'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Player } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import SessionForm from '@/components/SessionForm'
import { cn } from '@/lib/utils'

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
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2')}>
          ← Zurück
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
