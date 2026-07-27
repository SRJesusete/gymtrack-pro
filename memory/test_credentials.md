# Test Credentials — GymTrack Pro

## Auth = Blink SDK (email/password, self-registration)
There is NO fixed admin/seed account. Accounts are created via the **Cuenta** tab
(toggle "Crear una cuenta" → email + password + confirm, min 6 chars). Auth hits
`https://blink.new/api/auth/signup` and `/api/auth/signin/email` (works from the preview).

### To test
Register a fresh account in-app, e.g.:
- email: `tester+<unique>@gymtrack.test`
- password: `test1234`

Verified working sample created during testing (may still exist in Blink):
- email: `v1785168280205@gymtrack.test` / password: `test1234`

### data-testids for auth
- `auth-toggle-btn` (switch signin/signup)
- `auth-email-input`, `auth-password-input`, `auth-confirm-input`
- `auth-submit-btn`

### Calendar data-testids
- `calendar-view-month-btn`, `calendar-view-week-btn`
- `calendar-day-<YYYY-MM-DD>` (month cell), `calendar-day-add-btn`
- `calendar-form-name-input`, `calendar-form-duration-input`, `calendar-form-notes-input`
- `calendar-form-save-btn`, `calendar-form-delete-btn`

Note: The screenshot tool mis-paints Expo web on cold loads; use robust waits
(`wait_for_selector` on "ENTRENOS POR NIVEL" / "GYMTRACK PRO") before asserting.
