# Test Credentials — GymTrack Pro (React web + FastAPI + MongoDB)

## Auth backend
Custom JWT (email/password) + Emergent Google Auth. Both issue an app JWT stored in
localStorage (`gymtrack_token`) and sent as `Authorization: Bearer <token>`.

### Test account (email/password, created during testing)
- email: `demo@gymtrack.pro`
- password: `demo1234`
- (min password length is 8 chars)

Register a fresh one anytime via the Cuenta tab (toggle "Regístrate").

### Auth endpoints (all under /api)
- POST `/api/auth/register`  {email, password, name?}  -> {token, user}
- POST `/api/auth/login`     {email, password}         -> {token, user}
- POST `/api/auth/google/session` {session_id}         -> {token, user}
- GET  `/api/auth/me`        (Bearer)                  -> user
- POST `/api/auth/logout`

### App data endpoints (Bearer required unless noted)
- GET  `/api/exercises`  (public, 46 seeded)
- GET/POST `/api/user-exercises`
- GET/POST `/api/templates`, GET/DELETE `/api/templates/{id}`
- GET `/api/sessions`, POST `/api/sessions` (full workout, PR detection),
  POST `/api/sessions/quick` (calendar quick-log), GET/PUT/DELETE `/api/sessions/{id}`
- GET `/api/personal-records`

### Key frontend data-testids
- Auth: `auth-toggle-btn`, `auth-email-input`, `auth-password-input`, `auth-name-input`, `auth-submit-btn`, `google-login-btn`, `logout-btn`, `auth-error`
- Nav: `nav-home-desktop/mobile`, `nav-calendar-*`, `nav-progress-*`, `nav-help-*`, `nav-account-*`
- Home: `start-empty-workout-btn`, `level-toggle-<level>`, `preset-<id>`
- Calendar: `calendar-add-btn`, `calendar-view-month-btn`, `calendar-view-week-btn`, `calendar-day-<YYYY-MM-DD>`, `calendar-form-name-input`, `calendar-form-date-input`, `calendar-form-duration-input`, `calendar-form-volume-input`, `calendar-form-notes-input`, `calendar-form-type-<id>`, `calendar-form-save-btn`, `calendar-form-delete-btn`
- Session: `session-name-input`, `session-add-exercise-btn`, `session-pick-<exId>`, `session-set-weight-<i>-<j>`, `session-set-reps-<i>-<j>`, `session-add-set-<i>`, `session-save-btn`
- Templates: `new-template-btn`, `template-name-input`, `template-ex-<exId>`, `template-save-btn`, `template-start-<id>`
- Progress: `range-month/year/all`, `progress-volume-chart`, `type-dist-<type>`, `pr-<id>`
- Help: `help-search-input`, `help-filter-<group>`, `help-exercise-<id>`, `help-tips-toggle-<id>`, `help-video-<id>`
