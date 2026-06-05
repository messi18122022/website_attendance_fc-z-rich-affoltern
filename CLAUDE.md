# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Next.js 14 (App Router, TypeScript) web app for FC Zürich Affoltern to track player attendance at trainings and tournaments. Data is stored in Supabase. No authentication — open access via link.

## Commands

```bash
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build
npm run lint      # ESLint
```

## Architecture

**Stack:** Next.js 14 App Router · Supabase (PostgreSQL) · Tailwind CSS · shadcn/ui

All pages are Client Components (`'use client'`) — no Server Components, no Server Actions. The single Supabase browser client at `lib/supabase.ts` is used everywhere.

**Pages:**
- `/` — Dashboard: list of sessions with attendance counts
- `/session/new` — Create session (date, type, label) + mark attendance
- `/session/[id]` — Edit an existing session (loads and upserts attendance)
- `/report` — Filter sessions by date range and type, preview matrix, export/share CSV

**Key components:**
- `components/SessionForm.tsx` — Shared form used by both `/session/new` and `/session/[id]`
- `components/AttendanceGrid.tsx` — Toggle grid of player buttons (green = present)
- `components/SessionCard.tsx` — Single session row on the dashboard

**Data flow:**
- `lib/types.ts` — All TypeScript types
- `lib/supabase.ts` — Supabase client (uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `lib/export.ts` — `buildReport()` creates the matrix, `toCsv()` serialises it, `shareCsv()` uses `navigator.share()` on mobile and falls back to download

## Database (Supabase)

Three tables: `players`, `sessions`, `attendance`. Full schema + RLS policies + initial player seed in `supabase_schema.sql` — run this once in the Supabase SQL editor.

`attendance` has a `UNIQUE(session_id, player_id)` constraint; saves use `upsert` with `onConflict: 'session_id,player_id'`.

## Environment

Copy `.env.local.example` to `.env.local` and fill in the Supabase project URL and anon key before running.
