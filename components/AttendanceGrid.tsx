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
        <span className="text-sm font-medium">Spieler</span>
        <span className="text-sm text-muted-foreground">
          {presentCount}/{players.length} anwesend
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {players.map((player) => {
          const present = attendance[player.id] ?? false
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onChange(player.id, !present)}
              className={cn(
                'rounded-xl border-2 py-3 px-4 text-sm font-medium text-left transition-all active:scale-95',
                present
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/40'
              )}
            >
              <span className="block leading-tight">{player.vorname}</span>
              <span className="text-xs mt-0.5 block">
                {present ? '✓ da' : '– weg'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
