'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SessionWithCount } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
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
    <Card className="border-border/60 hover:border-border transition-all hover:shadow-lg hover:shadow-black/20">
      <CardContent className="py-3.5 px-4 flex items-center justify-between gap-3">
        <Link href={`/session/${session.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={session.type === 'training' ? 'secondary' : 'default'}
              className={cn(
                'text-xs font-semibold',
                session.type === 'turnier' && 'bg-primary/20 text-primary border-primary/30'
              )}
            >
              {session.type === 'training' ? 'Training' : 'Turnier'}
            </Badge>
            {session.label && (
              <span className="text-sm font-semibold truncate">{session.label}</span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{formatDate(session.date)}</span>
            <span className="text-sm font-bold text-foreground">
              {session.present_count}/{session.total_count}
              <span className="text-muted-foreground font-normal ml-1 text-xs">({pct}%)</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/session/${session.id}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs')}
          >
            Bearbeiten
          </Link>

          <AlertDialog open={open} onOpenChange={setOpen}>
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
      </CardContent>
    </Card>
  )
}
