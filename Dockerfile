# Swimily OCR API — build context MUST be the repository root (where server/ and public/ live).
# Render: use this file, Root Directory = empty, Dockerfile Path = Dockerfile
# CLI:    docker build -t swimily-ocr .
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
