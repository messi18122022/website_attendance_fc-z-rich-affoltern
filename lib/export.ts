import { Player, Session, Attendance } from './types'

export type CellStatus = 'x' | '' | 'v.E.' | 'n.A.'

export interface ReportRow {
  vorname: string
  sessions: Record<string, CellStatus>
  total: number
  eligible: number
  quote: number
}

export function buildReport(
  players: Player[],
  sessions: Session[],
  attendance: Attendance[]
): ReportRow[] {
  return players.map((player) => {
    const sessionMap: Record<string, CellStatus> = {}
    let total = 0
    let eligible = 0

    for (const session of sessions) {
      if (session.date < player.joined_at) {
        sessionMap[session.id] = 'v.E.'
      } else if (player.left_at !== null && session.date > player.left_at) {
        sessionMap[session.id] = 'n.A.'
      } else {
        eligible++
        const record = attendance.find(
          (a) => a.session_id === session.id && a.player_id === player.id
        )
        const present = record?.present ?? false
        sessionMap[session.id] = present ? 'x' : ''
        if (present) total++
      }
    }

    const quote = eligible > 0 ? Math.round((total / eligible) * 100) : 0
    return { vorname: player.vorname, sessions: sessionMap, total, eligible, quote }
  })
}

export function toCsv(rows: ReportRow[], sessions: Session[]): string {
  const playerNames = rows.map((r) => r.vorname)
  const header = ['Datum', 'Typ', ...playerNames].join(',')

  const dataLines = sessions.map((s) => {
    const label = s.label ? ` – ${s.label}` : ''
    const playerCols = rows.map((row) => row.sessions[s.id] ?? '')
    return [`${s.date}${label}`, s.type, ...playerCols].join(',')
  })

  const usesVE = rows.some((r) => Object.values(r.sessions).includes('v.E.'))
  const usesNA = rows.some((r) => Object.values(r.sessions).includes('n.A.'))
  const legend: string[] = []
  if (usesVE || usesNA) legend.push('')
  if (usesVE) legend.push('v.E. = vor Eintritt (war noch nicht im Team)')
  if (usesNA) legend.push('n.A. = nach Austritt (war nicht mehr im Team)')

  return [header, ...dataLines, ...legend].join('\n')
}

export function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function shareCsv(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const file = new File([blob], filename, { type: 'text/csv' })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: filename })
  } else {
    downloadCsv(csvContent, filename)
  }
}
