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
- DONE (2026-07-29): Calendario y Plantillas ahora son visibles SIN registro (quitado ProtectedRoute). Como invitado se ve la UI completa con `GuestBanner` (componente nuevo `components/GuestBanner.js`) invitando a iniciar sesión; las acciones de guardar/crear (Añadir/Nueva) redirigen a /cuenta. Verificado como invitado.
- DONE (2026-07-31): ENTRENOS SIN REGISTRO. Los invitados pueden crear/editar/borrar entrenos que se guardan en localStorage del dispositivo. Nueva capa de datos `lib/sessionData.js` (usa API si autenticado, `lib/guestStore.js` si invitado) con detección de PR local. Rutas /sesion/nueva y /sesion/:id ya NO protegidas. Actualizados Home, Calendar, History, Progress, SessionNew, SessionDetail para usar la capa unificada. GuestBanners actualizados a "modo invitado, se guarda en este dispositivo". Verificado e2e: entreno completo (600kg + PR), quick-log de calendario (cardio) y aparición en Historial/Progreso.
- DONE (2026-07-31): IMPORTACIÓN AUTOMÁTICA de datos de invitado al autenticarse. Nuevo endpoint POST /api/sessions/import (bulk, recalcula volumen y PRs en orden cronológico). `AuthContext` llama a importGuestData() tras login/register/google: sube las sesiones locales, limpia el guestStore (`guest.clear()`) y muestra toast "N entrenos importados". Verificado e2e (2 sesiones locales → importadas a la cuenta, historial correcto, PR recalculado, local limpiado).
- DONE (2026-08-01): Vídeo dentro de la app en Ayuda. `constants/muscleGroups.js` con VIDEO_IDS + getVideoId(). El botón de vídeo abre un modal in-app (`help-video-modal`) que muestra la MINIATURA del vídeo de técnica con botón de play (abre el vídeo en YouTube) o, si el ejercicio no está mapeado, un botón "Ver en YouTube" (búsqueda). NOTA: el reproductor incrustado (iframe) NO funciona en este entorno preview — YouTube devuelve "Video unavailable" para embeds — por eso se usa miniatura + apertura en YouTube (fiable). Todos los 46 ejercicios tienen guía escrita (técnica+errores). `getVideoId`/`getVideoInfo` usan matching insensible a acentos.
- DONE (2026-08-04): AMPLIACIÓN DE VÍDEOS a **46/46 ejercicios con miniatura de vídeo curada** (YouTube IDs validados por oEmbed). Los 5 que faltaban (Encogimientos, Extensión de Tríceps en Polea, Fondos, Peck Deck, Pullover) ahora tienen ID curado. Verificado visualmente (screenshot): los 5 muestran miniatura con play. El fallback de búsqueda "Ver en YouTube" queda solo para ejercicios personalizados sin mapear. Frontend compila (solo warnings eslint). Proveniencia: agent-tested por screenshot. NO reintentar iframe embed (bloqueado en este entorno).
- DONE (2026-09-01): CRONÓMETRO DE DESCANSO entre series en /sesion/nueva. Nuevo componente `components/RestTimer.js` (forwardRef, widget flotante inferior): cuenta regresiva con barra de progreso volt, botones -15/+15s, pausar/reanudar, saltar (X), y al terminar → aviso visual (fondo volt completo "¡Descanso terminado! ¡A darle!"), beep por Web Audio API y vibración móvil, con botones "Otra vez" y cerrar. En `SessionNew.js`: selector de duración (1/1.5/2/3 min, chips `rest-option-{s}`) y botón Timer por serie (`session-set-rest-{i}-{j}`). Solo estado UI, funciona igual para invitados y autenticados. Fix aplicado: clases inválidas bg-obsidian/text-obsidian → bg-bg/text-bg/text-txt; y ancho de barra 100% en estado done (el texto oscuro era ilegible con barra a 0%). Verificado e2e por screenshot automation: inicio desde botón de serie, cuenta regresiva, pausa estable, reanudar, -15 hasta fin, estado terminado legible. Proveniencia: agent-tested.
- DONE (2026-07-30): "Plantillas de ejemplo" en la pantalla Plantillas — se muestran las 9 rutinas predefinidas (WORKOUT_PRESETS) a todos (incl. invitados). Cada una con botón "Empezar" (→ /sesion/nueva?preset=id), "Vista previa" (Eye, abre modal con desglose ejercicio + grupo muscular + series×reps + botón empezar) y guardar (BookmarkPlus) que clona la rutina en las plantillas del usuario vía POST /templates. Sección "Mis plantillas" separada debajo. Verificado.
- DONE (2026-07-28 seguridad): Auditoría de seguridad → PASS. Aplicado: eliminado fallback de cookie muerto en get_current_user; añadido backend/.gitignore (excluye .env). Implementado **rate limiting** en auth: login con bloqueo por fuerza bruta (5 fallos por ip:email → 15 min, se limpia al acierto), register (10/15min por IP) y google/session (20/15min por IP), con índices TTL en login_attempts y rate_limits. Verificado por curl (6º intento → 429; reset al login correcto).
- P2: `durationMinutes` en POST /sessions es auto-calculado (len*5); permitir que el cliente envíe la duración real del entreno completo.
- P2: Migrar `@app.on_event('startup')` a lifespan (deprecación FastAPI).
- P2 (UX/testabilidad): dar contenedor de scroll propio al picker de ejercicios en /sesion/nueva (el header sticky intercepta clics en desktop).
- P3 (seguridad): JWT en localStorage es vulnerable a XSS; evaluar cookie httpOnly (ya hay fallback de cookie en get_current_user).
- P3: editar/borrar plantillas con ejercicios personalizados; añadir ejercicios personalizados desde la UI (endpoint /user-exercises ya existe).

## Credenciales de prueba
Ver `/app/memory/test_credentials.md` (demo@gymtrack.pro / demo1234).
