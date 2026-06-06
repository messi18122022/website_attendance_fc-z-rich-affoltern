'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SessionWithCount } from '@/lib/types'
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

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('de-CH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const typeEmoji = { training: '🏃', turnier: '🏆' }

interface Props {
  session: SessionWithCount
  onDelete: () => void
}

export default function SessionCard({ session, onDelete }: Props) {
  const [open, setOpen] = useState(false)

  const pct =
    session.total_count > 0
      ? Math.round((session.present_count / session.total_count) * 100)
      : 0

  return (
    <div className="flex items-center gap-2 border border-border/60 rounded-xl px-3 py-2 hover:border-border transition-all hover:shadow-md hover:shadow-black/20 bg-card">
      <Link href={`/session/${session.id}`} className="flex-1 min-w-0 flex items-center gap-3">
        <span className="text-xl shrink-0">{typeEmoji[session.type]}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{formatDate(session.date)}</span>
            {session.label && (
              <span className="text-sm font-semibold truncate">{session.label}</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground/70">
            {session.present_count}/{session.total_count}
            <span className="ml-1">({pct}%)</span>
          </div>
        </div>
      </Link>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
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
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => { setOpen(false); onDelete() }}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
