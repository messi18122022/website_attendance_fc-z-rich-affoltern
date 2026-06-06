'use client'

import { Player } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  players: Player[]
  attendance: Record<string, boolean>
  onChange: (playerId: string, present: boolean) => void
}

export default function AttendanceGrid({ players, attendance, onChange }: Props) {
  const presentCount = Object.values(attendance).filter(Boolean).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Spieler</span>
        <span className="text-xs font-semibold text-muted-foreground">
          <span className="text-primary">{presentCount}</span>/{players.length} anwesend
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {players.map((player) => {
          const present = attendance[player.id] ?? false
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onChange(player.id, !present)}
              className={cn(
                'rounded-xl border-2 py-3.5 px-4 text-sm font-semibold text-left transition-all active:scale-95',
                present
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-border/60 hover:text-foreground'
              )}
            >
              <span className="block leading-tight">{player.vorname}</span>
              <span className={cn('text-xs mt-0.5 block font-normal', present ? 'text-primary/70' : 'text-muted-foreground/50')}>
                {present ? '✓ da' : '– weg'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
