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

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/session/${session.id}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-xs')}
          >
            Bearbeiten
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive text-xs"
            onClick={handleDelete}
          >
            ✕
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
