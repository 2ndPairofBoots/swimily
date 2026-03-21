/**
 * Minimal Swimily OCR API: POST multipart field `image` → JSON { text }.
 * Run from repo root: `npm run ocr-server`
 * Deploy separately (Railway, Fly.io, Render, VPS). Point the SPA at it with VITE_OCR_API_URL.
 */
import express from "express";
import cors from "cors";
import multer from "multer";
import Tesseract from "tesseract.js";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 3877);
const MAX_MB = Number(process.env.OCR_MAX_MB || 12);

/** Comma-separated origins, or * for any (dev only). */
const allowedOrigins = (process.env.OCR_ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const tessdataDir = process.env.TESSDATA_DIR
  ? path.resolve(process.env.TESSDATA_DIR)
  : path.resolve(__dirname, "../public/tessdata");

// Node: pass a real directory path (not file://); file URLs can break in the worker on some OSes.
const langPath = path.join(tessdataDir, path.sep);

const app = express();
app.use(express.json({ limit: "1mb" }));

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes("*")) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      console.warn("CORS blocked origin:", origin);
      cb(null, false);
    },
    maxAge: 86400,
  }),
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024 },
});

/** Reuse one worker so repeat requests stay fast (like a hosted OCR site). */
let workerReady = null;

async function getWorker() {
  if (!workerReady) {
    // Signature: createWorker(langs, oem, options). Options-only first arg breaks (langs must be string).
    // OEM 1 = LSTM_ONLY (tesseract.js default).
    workerReady = Tesseract.createWorker("eng", 1, { langPath });
  }
  return workerReady;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, tessdataDir });
});

app.post("/api/ocr", upload.single("image"), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: "Missing file field `image` (multipart/form-data)." });
    }

    const worker = await getWorker();
    const recognizeOptions = {
      tessedit_pageseg_mode: "6",
    };
    const { data } = await worker.recognize(req.file.buffer, recognizeOptions);
    const text = (data?.text || "").trim();
    res.json({ text });
  } catch (err) {
    console.error("OCR error:", err);
    res.status(500).json({ error: err?.message || "OCR failed" });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Swimily OCR server listening on http://127.0.0.1:${PORT}`);
  console.log(`TESSDATA / langPath: ${tessdataDir}`);
  console.log(`CORS allowed: ${allowedOrigins.join(", ")}`);
});

async function shutdown() {
  try {
    if (workerReady) {
      const w = await workerReady.catch(() => null);
      if (w?.terminate) await w.terminate();
    }
  } catch (_) {}
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
