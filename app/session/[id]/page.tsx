'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Player, Session } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import SessionForm from '@/components/SessionForm'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('de-CH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function SessionFormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-3 w-12 rounded bg-muted" />
        <div className="h-11 w-full rounded-xl bg-muted" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-8 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 rounded-xl bg-muted" />
          <div className="h-12 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-11 w-full rounded-xl bg-muted" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
      <div className="h-12 w-full rounded-xl bg-muted" />
    </div>
  )
}

export default function EditSessionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    load()

    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [id])

  async function load() {
    setLoading(true)
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

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('sessions').delete().eq('id', id)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2')}>
            ← Zurück
          </Link>
          <h1 className="text-xl font-bold">Session bearbeiten</h1>
        </div>

        {session && (
          <AlertDialog>
            <AlertDialogTrigger
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Session löschen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Session löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  {formatDate(session.date)}{session.label ? ` – ${session.label}` : ''} wird unwiderruflich gelöscht.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {loading ? (
        <SessionFormSkeleton />
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
