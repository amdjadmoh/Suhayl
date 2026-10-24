# The repo is an npm workspace: dependencies come from the root package-lock.json.

# ── Stage 1: build the client and the server ──────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN npm ci --workspace client --workspace server

# Vite bakes these into the client bundle, so they are build arguments, not runtime env
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_SENTRY_DSN=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID VITE_SENTRY_DSN=$VITE_SENTRY_DSN

COPY client/ client/
COPY server/ server/
RUN npm run build --workspace client && npm run build --workspace server

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=5000 UPLOAD_DIR=/app/data/uploads

COPY package.json package-lock.json ./
COPY server/package.json server/
RUN npm ci --omit=dev --workspace server && npm cache clean --force

COPY --from=build /app/server/dist server/dist
COPY --from=build /app/client/dist client/dist

RUN mkdir -p /app/data/uploads && chown -R node:node /app/data
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["node", "server/dist/index.js"]
