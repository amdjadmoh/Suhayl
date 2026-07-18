# ── Stage 1: Client build ──────────────────────────────────────────────────────
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ── Stage 2: Server build ──────────────────────────────────────────────────────
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# ── Stage 3: Runtime ───────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Copy the compiled server code
COPY --from=server-build /app/server/dist ./server/dist

# Copy & install production-only server dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy the compiled client SPA
COPY --from=client-build /app/client/dist ./client/dist

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server/dist/index.js"]
