-- FC Zürich Affoltern – Anwesenheiten Schema
-- Dieses SQL in der Supabase SQL-Editor ausführen

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vorname TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('training', 'turnier')),
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  present BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(session_id, player_id)
);

-- Spieler aus Kader 25/26 einfügen
INSERT INTO players (vorname) VALUES
  ('Flori'),
  ('Leonidas'),
  ('Yasin'),
  ('Kian'),
  ('Rocco'),
  ('Mathias'),
  ('Santiago'),
  ('Valentin'),
  ('Yafet'),
  ('Younes'),
  ('Reza'),
  ('Aurelio'),
  ('Noar'),
  ('Luan'),
  ('Yuri');

-- RLS (Row Level Security) – Tabellen öffentlich lesbar und schreibbar
-- (keine Auth, jeder mit dem Link kann zugreifen)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read players" ON players FOR SELECT USING (true);
CREATE POLICY "public insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "public update players" ON players FOR UPDATE USING (true);

CREATE POLICY "public read sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "public insert sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "public update sessions" ON sessions FOR UPDATE USING (true);
CREATE POLICY "public delete sessions" ON sessions FOR DELETE USING (true);

CREATE POLICY "public read attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "public insert attendance" ON attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "public update attendance" ON attendance FOR UPDATE USING (true);
CREATE POLICY "public delete attendance" ON attendance FOR DELETE USING (true);
