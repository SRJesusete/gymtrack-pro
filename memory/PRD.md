# GymTrack Pro — PRD

## Problem statement (histórico)
1. "En base a ese codigo añade un calendario donde se pueda guardar los entrenos"
2. "rediseña la app con una interfaz mas moderna"
3. "Rediseña la pantalla de inicio y mete los ejercicios de entrenos rapidos en las categorias por niveles"
4. "Rediseña el apartado de ayuda y modernizalo"
5. "Rediseña la app y elimina toda referencia de blink" (migración completa)

## Stack ACTUAL (desde 2026-07-28 — reconstrucción total)
- **Frontend**: React web estándar (Create React App / react-scripts) + Tailwind CSS + lucide-react + recharts + framer-motion + sonner + react-router-dom. En `/app/frontend/src`. Supervisor corre `yarn start` en puerto 3000.
- **Backend**: FastAPI + MongoDB (motor) en `/app/backend/server.py`, puerto 8001, prefijo `/api`.
- **Auth**: JWT propio (email/contraseña, bcrypt) + Emergent Google Auth. Ambos emiten un JWT (7 días) guardado en localStorage `gymtrack_token`, enviado como `Authorization: Bearer`.
- **DB**: MongoDB local, DB_NAME=gymtrack. Colecciones: users, exercises (46 sembrados), user_exercises, templates, sessions, personal_records.
- **Blink ELIMINADO por completo** (SDK, Expo, Tamagui, todos los hooks). Se exportaron las 46 ejercicios públicas y se sembraron en Mongo (`/app/backend/seed_exercises.json`).

## Diseño
- Volt/Obsidian pulido. Tokens en `tailwind.config.js` + `design_guidelines.json`. Fondo Obsidian #09090B, superficies #141414, acento Volt Lime #D4FF00, Oswald (headings) + Manrope (body). Colores por grupo muscular. Nav superior en desktop, inferior en móvil.

## Endpoints (todos /api)
- Auth: POST /auth/register, /auth/login, /auth/google/session, GET /auth/me, POST /auth/logout
- GET /exercises (público, 46)
- GET/POST /user-exercises
- GET/POST /templates, GET/DELETE /templates/{id}
- GET /sessions, POST /sessions (entreno completo + detección PR), POST /sessions/quick (quick-log calendario), GET/PUT/DELETE /sessions/{id}
- GET /personal-records

## Pantallas frontend
Inicio (hero+stats+acordeones por nivel con presets), Calendario (mes/semana, quick-log, filtros, distribución), Historial, Plantillas (crear/usar), Progreso (rango Mes/Año/Todo, gráfica volumen recharts, distribución, PRs), Ayuda (biblioteca + buscador + filtros + consejos), Cuenta (login/registro/Google + perfil), SessionNew (registrar entreno con series), SessionDetail.

## Estado / Verificación (2026-07-28)
- Reconstrucción completa VERIFICADA por testing_agent: Backend 100% (14/14 pytest), Frontend 100% e2e (auth, home, sesión con PR, calendario, historial, progreso, plantillas, ayuda; rutas protegidas redirigen a /cuenta).
- Fix aplicado: detección de PR ahora crea 1 solo PR por ejercicio/sesión (la serie más pesada), verificado por curl.
- Report: `/app/test_reports/iteration_2.json`. Tests backend en `/app/backend/tests/backend_test.py`.

## Backlog / Next (P1/P2)
- DONE (2026-07-28 seguridad): Auditoría de seguridad → PASS. Aplicado: eliminado fallback de cookie muerto en get_current_user; añadido backend/.gitignore (excluye .env). Implementado **rate limiting** en auth: login con bloqueo por fuerza bruta (5 fallos por ip:email → 15 min, se limpia al acierto), register (10/15min por IP) y google/session (20/15min por IP), con índices TTL en login_attempts y rate_limits. Verificado por curl (6º intento → 429; reset al login correcto).
- P2: `durationMinutes` en POST /sessions es auto-calculado (len*5); permitir que el cliente envíe la duración real del entreno completo.
- P2: Migrar `@app.on_event('startup')` a lifespan (deprecación FastAPI).
- P2 (UX/testabilidad): dar contenedor de scroll propio al picker de ejercicios en /sesion/nueva (el header sticky intercepta clics en desktop).
- P3 (seguridad): JWT en localStorage es vulnerable a XSS; evaluar cookie httpOnly (ya hay fallback de cookie en get_current_user).
- P3: editar/borrar plantillas con ejercicios personalizados; añadir ejercicios personalizados desde la UI (endpoint /user-exercises ya existe).

## Credenciales de prueba
Ver `/app/memory/test_credentials.md` (demo@gymtrack.pro / demo1234).
