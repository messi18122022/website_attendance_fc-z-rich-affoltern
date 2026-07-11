export type SessionType = 'training' | 'turnier'

export interface Player {
  id: string
  vorname: string
  active: boolean
  birthdate: string | null
  joined_at: string
  left_at: string | null
  created_at: string
}

export interface Session {
  id: string
  date: string
  type: SessionType
  label: string | null
  created_at: string
}

export interface Attendance {
  id: string
  session_id: string
  player_id: string
  present: boolean
}

export interface SessionWithCount extends Session {
  present_count: number
  total_count: number
}

export interface AttendanceWithPlayer extends Attendance {
  players: Player
}
