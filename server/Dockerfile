# Build from repository root only: docker build -f server/Dockerfile -t swimily-ocr .
# On Render, prefer repo-root /Dockerfile + dockerContext "." (see render.yaml) — using this
# file with context = server/ breaks COPY server/... paths.
FROM node:20-bookworm-slim

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/index.js ./
COPY public/tessdata ./tessdata

ENV TESSDATA_DIR=/app/tessdata
ENV PORT=3877

EXPOSE 3877

CMD ["node", "index.js"]
