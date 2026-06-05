'use client'

import Link from 'next/link'
import { SessionWithCount } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
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
  const pct =
    session.total_count > 0
      ? Math.round((session.present_count / session.total_count) * 100)
      : 0

  function handleDelete() {
    if (confirm(`Session vom ${formatDate(session.date)} wirklich löschen?`)) {
      onDelete()
    }
  }

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
        <Link href={`/session/${session.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={session.type === 'training' ? 'secondary' : 'default'}>
              {session.type === 'training' ? 'Training' : 'Turnier'}
            </Badge>
            {session.label && (
              <span className="text-sm font-medium truncate">{session.label}</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{formatDate(session.date)}</span>
            <span className="text-sm font-semibold">
              {session.present_count}/{session.total_count}
              <span className="text-muted-foreground font-normal ml-1">({pct}%)</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/session/${session.id}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Bearbeiten
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            ✕
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
