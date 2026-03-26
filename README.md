
# Swimily

This repo is a Vite + React (mobile-first) app with a local/dev Express + Postgres backend.

## Quickstart (local/dev)

Install deps:

```bash
npm install
npm install --prefix server
```

Backend env:

- Copy `server/.env.example` → `server/.env`
- Set `DATABASE_URL` (Neon/local Postgres). If `DATABASE_URL` is missing, the server still boots but DB-backed endpoints will fail.
- Generate JWT keys (Windows-friendly):

```bash
npm run gen:jwt-keys --prefix server
```

Run web + server together:

```bash
npm run dev:all
```

- Web: Vite dev server
- API: `http://localhost:3000` (proxied under `/api` from the web app)

## Smoke tests

```bash
npm run test:smoke
```

Manual checklist: see `SMOKE_CHECKLIST.md`.
  