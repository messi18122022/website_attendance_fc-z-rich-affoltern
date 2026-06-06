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
  const [confirmDelete, setConfirmDelete] = useState(false)
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
      <div className="flex items-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2')}>
          ← Zurück
        </Link>
        <h1 className="text-xl font-bold">Session bearbeiten</h1>
      </div>

      {loading ? (
        <SessionFormSkeleton />
      ) : session ? (
        <>
          <SessionForm
            players={players}
            initialSession={session}
            initialAttendance={attendance}
            onDelete={() => setConfirmDelete(true)}
          />

          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
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
        </>
      ) : (
        <p className="text-muted-foreground text-sm">Session nicht gefunden.</p>
      )}
    </div>
  )
}
