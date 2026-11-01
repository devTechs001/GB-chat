# syntax=docker/dockerfile:1
# ---------- GBChat API node (HTTP + Socket.IO + internal gRPC) ----------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++ vips-dev
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=5000 \
    GRPC_PORT=50051

RUN apk add --no-cache vips curl tini && addgroup -S gbchat && adduser -S gbchat -G gbchat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir -p uploads && chown -R gbchat:gbchat /app
USER gbchat

EXPOSE 5000 50051

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:5000/api/system/live || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
