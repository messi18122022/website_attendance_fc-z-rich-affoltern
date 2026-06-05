import { Player, Session, Attendance } from './types'

export interface ReportRow {
  vorname: string
  sessions: Record<string, boolean>
  total: number
  quote: number
}

export function buildReport(
  players: Player[],
  sessions: Session[],
  attendance: Attendance[]
): ReportRow[] {
  return players.map((player) => {
    const sessionMap: Record<string, boolean> = {}
    let total = 0

    for (const session of sessions) {
      const record = attendance.find(
        (a) => a.session_id === session.id && a.player_id === player.id
      )
      const present = record?.present ?? false
      sessionMap[session.id] = present
      if (present) total++
    }

    const quote = sessions.length > 0 ? Math.round((total / sessions.length) * 100) : 0

    return { vorname: player.vorname, sessions: sessionMap, total, quote }
  })
}

export function toCsv(rows: ReportRow[], sessions: Session[]): string {
  const sessionHeaders = sessions.map(
    (s) => `${s.date} (${s.type}${s.label ? ` – ${s.label}` : ''})`
  )
  const header = ['Vorname', ...sessionHeaders, 'Total', 'Quote %'].join(',')

  const lines = rows.map((row) => {
    const sessionCols = sessions.map((s) => (row.sessions[s.id] ? '1' : '0'))
    return [row.vorname, ...sessionCols, row.total, `${row.quote}%`].join(',')
  })

  return [header, ...lines].join('\n')
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
