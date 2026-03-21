# Swimily OCR server

Small **Express** service that runs **Tesseract.js** on the server (same engine as many “image to text” sites, but under your control). The React app can call it when `VITE_OCR_API_URL` is set—especially useful for **GitHub Pages**, where in-browser Tesseract is flaky.

## Run locally

From the **repo root**:

```bash
cd server && npm install && cd ..
npm run ocr-server
```

Ensure `public/tessdata/eng.traineddata` exists (already in this repo).

Create `.env.local` in the repo root (Vite):

```env
VITE_OCR_API_URL=http://127.0.0.1:3877
```

Restart `npm run dev`, then use **Photo → AI**; the client preprocesses the image, then uploads PNG to the server.

## Environment (server)

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3877` | Listen port |
| `OCR_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | CORS allowlist (comma-separated). Add your GitHub Pages origin, e.g. `https://2ndpairofboots.github.io` |
| `OCR_MAX_MB` | `12` | Max upload size |
| `TESSDATA_DIR` | `../public/tessdata` (from `server/`) | Folder containing `eng.traineddata` |

Use `OCR_ALLOWED_ORIGINS=*` only for quick tests (allows any website to use your OCR API).

## Deploy

1. Deploy this **server** to any Node host (Railway, Render, Fly.io, a VPS). The API must be **`https://`** so the GitHub Pages site can call it (browsers block `http://127.0.0.1` from an HTTPS page).
2. Set `OCR_ALLOWED_ORIGINS` to your real site origin(s).
3. Set `TESSDATA_DIR` if your host doesn’t include `public/tessdata`—copy `eng.traineddata` into the image or volume and point `TESSDATA_DIR` there.
4. Rebuild the **frontend** with `VITE_OCR_API_URL=https://your-api.example.com` in **CI / deploy secrets** — not `.env.local` (localhost URLs get baked into `dist` and will never work from `github.io`).

The app **ignores** a localhost `VITE_OCR_API_URL` when the page is opened from a non-localhost host, so deployed builds won’t waste time on “Failed to fetch”.

### GitHub Actions (already in this repo)

Push to **`main`** or **`master`** runs [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml). Add repository secret **`VITE_OCR_API_URL`** (HTTPS API base URL). Step-by-step: [`docs/GITHUB_PAGES_OCR.md`](../docs/GITHUB_PAGES_OCR.md).

## Docker (build from repo root)

```bash
# From repository root (context must include server/ and public/):
docker build -t swimily-ocr .
# or: docker build -f server/Dockerfile -t swimily-ocr .

docker run -p 3877:3877 -e OCR_ALLOWED_ORIGINS=https://YOURUSER.github.io swimily-ocr
```

On **Render**, use root **`Dockerfile`** and **`dockerContext: .`** — see [`render.yaml`](../render.yaml) (avoids `lstat .../server` when context was wrongly set to `server/`).
