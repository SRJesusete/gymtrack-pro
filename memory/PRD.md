# GymTrack Pro — PRD

## Problem statement
1. "En base a ese codigo añade un calendario donde se pueda guardar los entrenos"
2. "rediseña la app con una interfaz mas moderna"
3. "Rediseña la pantalla de inicio y mete los ejercicios de entrenos rapidos en las categorias por niveles"

## Stack (IMPORTANT — non-standard)
- Expo + React Native Web (expo-router), Tamagui via `@blinkdotnew/mobile-ui`.
- Backend = **Blink SDK** (`@blinkdotnew/sdk`): hosted DB + email/password auth at `https://blink.new` / `https://core.blink.new`. projectId `gymtrack-mobile-app-u6wmrz3v` (in `lib/blink.ts`).
- App lives in `/app/frontend`; supervisor runs `yarn start` → `expo start --web --port 3000`.
- No FastAPI/Mongo used. `/app/backend` intentionally unused (its supervisor stays FATAL, harmless).

## User personas
- Gym-goers tracking workouts, logging sessions per day, following level-based workout presets.

## Core requirements (static)
- Calendar to save/review workouts by day (login required), fields: date + notes + duration. Month + week views.
- Modern UI ("Performance Pro": Obsidian #09090B + Volt Lime #D4FF00).
- Home shows quick workouts grouped inside level categories with exercise lists.

## Implemented (2026-07-27)
- **Calendar** (`app/(tabs)/calendar.tsx`): month grid + week list toggle, day dots, quick-log modal (name/duration/notes) via `useQuickLogSession`, edit via `useUpdateSession`, delete via `useDeleteSession`. Saves to Blink `sessions` with custom `startedAt`. VERIFIED e2e (201 create, persists after reload).
- **Tab nav** (`app/(tabs)/_layout.tsx`): added Calendario + Ayuda tabs, Volt tab bar.
- **Home redesign** (`app/(tabs)/index.tsx`): hero image + gradient, bento stats, expandable level categories (accordion) each listing presets + exercises, Volt pill CTAs. Recent session + auth CTA.
- **Theme** (`constants/theme.ts`): shared Obsidian+Volt palette `C`.
- **DB hooks** (`hooks/useDatabase.ts`): `useQuickLogSession`, `useUpdateSession`, `useUserExercises` (fixes broken Help tab), `useCreateSession` now accepts optional `startedAt`.
- **session/new.tsx**: respects `?date=` param → startedAt on that day.
- Profile auth already had Volt styling + data-testids.

## Verification
- Verified with headless chromium (playwright-core in /tmp) since screenshot_tool mis-paints slow Expo web loads. Blink signup → 200, tokens stored; calendar create → 201; reload persistence OK.

## Backlog / Next
- DONE (2026-07-27 P2): DatePicker in add/edit modal (mobile-ui `DatePicker`, value=Date) replacing the text date field. Startedat = chosen date + preserved time-of-day.
- DONE (2026-07-27 P2): "Distribución por tipo" mini bar chart on calendar (per-type count/minutes/kg for current Mes/Semana, `typeStats`). Colored bars by type.
- DONE (2026-07-27 P2): Edit workout date + filter calendar by type (type encoded in `notes` via `::tipo=` since Blink sessions schema is fixed). Colored chips/dots/badges.
- DONE (2026-07-27 P2): Oswald headings + Manrope body (Google Fonts CDN in `app/_layout.tsx`).
- DONE (2026-07-27 P2): Calendar period summary bento (entrenos · kg · minutos).
- P1: Restyle remaining screens (History, Templates, Progress, Session detail) to Volt/Obsidian.
- P2: Per-type breakdown chart also on Progreso screen.
