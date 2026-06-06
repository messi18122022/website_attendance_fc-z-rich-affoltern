'use client'

import Link from 'next/link'
import { SessionWithCount } from '@/lib/types'

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
}

export default function SessionCard({ session }: Props) {
  const pct =
    session.total_count > 0
      ? Math.round((session.present_count / session.total_count) * 100)
      : 0

  return (
    <Link
      href={`/session/${session.id}`}
      className="flex items-center gap-3 border border-border/60 rounded-xl px-3 py-2 hover:border-border transition-all hover:shadow-md hover:shadow-black/20 bg-card"
    >
      <span className="text-xl shrink-0">{typeEmoji[session.type]}</span>
      <div className="min-w-0 flex-1">
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
  )
}
