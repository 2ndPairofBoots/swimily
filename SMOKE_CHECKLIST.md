# Smoke checklist (local/dev)

## Automated

- `npm run test:smoke`

## Manual (5–10 minutes)

- **Auth**
  - Register → login → logout
  - Refresh behavior: leave the app open ~30 minutes, confirm it stays logged in
  - Password reset request/confirm works in dev mode
  - Verify email page shows success/error and routes back to login

- **Core loop**
  - Log a practice (manual)
  - Calendar shows the practice on the correct day
  - Dashboard stats update (yards, XP, streak)

- **Records**
  - Save a PR time and a goal time
  - Switch course (SCY/LCM) and confirm values persist

- **Meets**
  - Add a meet, then delete it

