# GymTrack Pro — PRD

## Original problem statement
"En base a ese codigo añade un calendario donde se pueda guardar los entrenos" + "rediseña la app con una interfaz mas moderna".

## Stack (given codebase)
- Expo + React Native Web (expo-router), UI via `@blinkdotnew/mobile-ui` (Tamagui).
- Backend/DB/Auth via **Blink SDK** (`@blinkdotnew/sdk`) → Blink cloud (`blink.new` / `core.blink.new`). No local FastAPI/Mongo used.
- Runs as frontend at `/app/frontend`, served on port 3000 via `expo start --web` (supervisor `frontend`). `start` script edited to serve web on 3000.

## User choices
- Calendar: both month + week views.
- Per-entry data: date + notes + duration.
- Auth: with login (reuses existing Blink email/password auth).
- Design: modernize freely.

## Implemented (2026-07-27)
- **Calendar tab** (`app/(tabs)/calendar.tsx`): month grid + week list toggle, workout dots, day selection.
  - Quick-log modal: Nombre + Duración (min) + Notas → saved to Blink `sessions` with chosen date (`startedAt`).
  - Edit + delete existing entries; opens full session (if it has exercises/volume).
- **DB hooks** (`hooks/useDatabase.ts`): `useQuickLogSession`, `useUpdateSession`; `useCreateSession` now accepts `startedAt`; added minimal `useUserExercises` (fixes previously-broken Ayuda tab import).
- **Nav** (`app/(tabs)/_layout.tsx`): registered Calendario (Calendar icon) + Ayuda (Info icon) tabs; volt/obsidian tab bar.
- **`session/new`** now honors `?date=` param → dates the session correctly.
- **Redesign — "Performance Pro" (Obsidian #09090B + Volt Lime #D4FF00)**: shared palette `constants/theme.ts`; rebuilt Home (`index.tsx`) with hero image + gradient, bento stats, pill CTAs; restyled Calendar; restyled auth form (`profile.tsx`) with volt pill + data-testids.

## Verified (direct browser automation)
- Blink signup/signin return tokens (HTTP 200). Login → authenticated profile.
- Logged-in: add workout → renders name + "55 min" + notes; volt dot on day; Edit action. No page errors on any tab (incl. Ayuda).

## Backlog / Next
- P1: Apply the volt/obsidian palette to History, Templates, Progress, Session screens (currently default dark theme, functional but not fully restyled).
- P2: Load Oswald/Manrope Google fonts for the condensed/geometric type from the guidelines.
- P2: Week-view: allow inline edit + swipe actions; month-view multi-dot color coding by volume.
- P2: Calendar summary stats (streak, weekly minutes).
