# GBChat — rate limiting, gRPC, multi-server & Docker

This document covers the operational layer added in round 3: request throttling,
the internal gRPC API, horizontal scaling (Redis + Socket.IO adapter + cluster)
and the container topology.

---

## 1. Rate limiting

`server/middleware/rateLimiter.js` builds every policy from one factory, so all
of them share the same store, key generator, 429 shape and skip rules.

| Policy | Scope | Window | Max (env) |
| --- | --- | --- | --- |
| `rateLimiter` | whole API | 15 min | 600 (`RATE_LIMIT_MAX`) |
| `authLimiter` | login, OTP verify | 15 min | 20 (`RATE_LIMIT_AUTH_MAX`), successful requests are not counted |
| `registerLimiter` | `POST /api/auth/register` | 1 h | 10 (`RATE_LIMIT_REGISTER_MAX`) |
| `passwordResetLimiter` | forgot / reset password | 1 h | 5 (`RATE_LIMIT_RESET_MAX`) |
| `writeLimiter` | messages, stories | 1 min | 120 (`RATE_LIMIT_WRITE_MAX`) |
| `uploadLimiter` | avatar & media uploads | 1 h | 60 (`RATE_LIMIT_UPLOAD_MAX`) |
| `searchLimiter` | user search | 1 min | 90 (`RATE_LIMIT_SEARCH_MAX`) |
| `callLimiter` | call signalling | 1 min | 30 (`RATE_LIMIT_CALL_MAX`) |

Details that matter in production:

* **Key** — `u:<userId>` when the request is authenticated, otherwise
  `ip:<address>`. IPv6 addresses are normalised to their `/64` prefix so one
  subscriber cannot rotate through 2⁶⁴ addresses to bypass a limit.
* **Store** — `rate-limit-redis` when `REDIS_URL`/`REDIS_HOST` is set, so limits
  are enforced *across replicas*; otherwise an in-memory store (single node).
* **Response** — HTTP 429 with
  `{ success: false, code: "RATE_LIMITED", message, retryAfter }` and standard
  `RateLimit-*` headers.
* **Skips** — `OPTIONS`, `/api/health`, `/api/ready`, `/api/system/live`.
* **Trusted proxy** — `app.set('trust proxy', TRUST_PROXY || 1)` so `req.ip` is
  the real client behind nginx / a cloud LB.

Sockets get their own guard: `server/socket/rateLimit.js` gives every connection
a token bucket (40 events burst, 20/s refill) and answers with a `rateLimited`
event instead of dropping messages silently. The client shows a toast.

Inspect the live configuration:

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/system/info
```

---

## 2. Internal gRPC API

`server/proto/gbchat.proto` (package `gbchat.v1`) defines three services:

| Service | Method | Purpose |
| --- | --- | --- |
| `HealthService` | `Ping` | liveness of a specific node (id, version, hostname, pid, uptime, redis flag, socket count) |
| `PresenceService` | `GetPresence`, `SetStatus` | online state + socket ids, stored in Redis with a 60 s TTL and a local fallback |
| `NotificationService` | `Send` | fan-out an in-app notification to a list of users on *any* node |

* **Server** — `server/grpc/server.js`, started from `server/index.js` on
  `GRPC_HOST:GRPC_PORT` (default `0.0.0.0:50051`), toggled by `GRPC_ENABLED`.
  Every call may present `authorization: Bearer $GRPC_AUTH_TOKEN`; when the
  variable is set, unauthenticated calls are rejected.
* **Client** — `server/grpc/client.js` exposes `grpcPing`, `grpcGetPresence`,
  `grpcSetStatus`, `grpcNotify`. Every helper fails soft (returns `null` and
  logs a warning) so a REST request never hangs on an unavailable internal API.
* **Presence** — sockets call `markPresence(userId, { online, socketId })` on
  connect/disconnect, so `GetPresence` reflects all nodes.
* **HTTP bridge** — `GET /api/system/presence/:userId` and
  `POST /api/system/notify` (both authenticated).
* **Smoke test** — `npm run grpc:check` (in `server/`) pings the node, reads a
  presence record and sends a notification.

Client-side, the notification event (`notification` / `notification:new`) is
picked up by `hooks/useSocket.js` and pushed into the notification store.

---

## 3. Horizontal scaling

Three independent mechanisms, each optional:

1. **Redis** (`server/config/redis.js`) — one lazy ioredis client shared by the
   rate limiter, the presence registry and the Socket.IO adapter. It never
   throws: without `REDIS_URL` the API logs one warning and runs single-node.
2. **Socket.IO Redis adapter** (`server/socket/index.js`) — when Redis is
   configured, rooms and broadcasts are shared by every replica, so a message
   sent through node A reaches a socket connected to node B. Connection state
   recovery is enabled (2 min window) so brief reconnects do not lose events.
3. **Node cluster** (`server/cluster.js`, `npm run start:cluster`) — forks one
   worker per CPU (or `WEB_CONCURRENCY`), respawns crashed workers, and gives
   each worker its own gRPC port (`GRPC_PORT + index`) with `NODE_ID`
   `host-1`, `host-2`, …

Readiness for a load balancer:

| Endpoint | Meaning |
| --- | --- |
| `GET /api/system/live` | process is up (no dependencies) — use for liveness probes |
| `GET /api/health` | backwards-compatible alias returning uptime/pid |
| `GET /api/system/ready` | Mongo + Redis + gRPC status; **503** while degraded |
| `GET /api/system/info` | node, scaling, rate-limit and gRPC diagnostics |

Graceful shutdown: `SIGTERM`/`SIGINT` stop accepting connections, close Redis,
then exit (15 s hard timeout) so replicas drain cleanly during a rollout.

---

## 4. Docker

| File | What it builds |
| --- | --- |
| `gbchat/server/Dockerfile` | API node (node:20-alpine, non-root `gbchat` user, `tini`, healthcheck on `/api/system/live`, ports 5000 + 50051) |
| `gbchat/client/Dockerfile` | multi-stage build → nginx serving the SPA, proxying `/api`, `/uploads`, `/socket.io` |
| `gbchat/client/nginx.conf` | SPA fallback, asset caching, WebSocket upgrade, SPA-safe routing |
| `gbchat/docker/nginx-lb.conf` | internal LB: `ip_hash` sticky upstream over `server1`/`server2`, edge rate limits (`30 r/s` API, `5 r/min` login) |
| `gbchat/docker-compose.yml` | mongodb + redis + 2 API replicas + nginx LB + client + background worker |

```bash
cd gbchat
cp server/.env.example server/.env      # fill in the secrets you need
docker compose up --build               # client :80 · LB :8080 · API replicas internal
open http://localhost                   # app
curl http://localhost:8080/lb-health    # LB health
```

Topology:

```
client (nginx :80) ──► lb (nginx :8080, ip_hash) ──┬─► server1 (API + Socket.IO + gRPC)
                                                   └─► server2 (API + Socket.IO + gRPC)
                                                          │            │
                                                    mongodb        redis
                                              (data)     (adapter, limits, presence)
```

Adding capacity:

* more replicas on one host → `docker compose up -d --scale server1=1 --scale server2=1`,
  then add the new service name to the `upstream` block in `docker/nginx-lb.conf`;
* more workers in one container → `WEB_CONCURRENCY=4 npm run start:cluster`
  (each worker takes `GRPC_PORT + index`, so do **not** publish a fixed gRPC port
  when scaling this way);
* several hosts → point every replica at the same Redis and Mongo, and put the
  nginx LB (or a cloud LB with sticky sessions) in front.

Because Socket.IO rooms, rate-limit counters and presence all live in Redis, any
number of nodes can serve the same users; sticky sessions are only needed while
the long-polling fallback handshake is in flight.

### 4.1 Background jobs

Cron jobs must not run once per replica. Two supported layouts:

| Layout | Config | Notes |
| --- | --- | --- |
| In-process | `SCHEDULER_ENABLED` unset/`true` | `services/schedulerService.js` starts inside the API, but every tick takes `SET NX PX` lock `gbchat:lock:scheduler` (55 s TTL), so only one replica actually runs it. |
| Dedicated worker (default in Compose) | API: `SCHEDULER_ENABLED=false`; run `node services/worker.js` | `worker` service shares the API image. Jobs: story expiry, scheduled channel posts (atomic claim), 30-day notification pruning, stale-call cleanup. |

`node services/worker.js --once` runs a single cycle and exits — handy for a
Kubernetes CronJob. Without Redis the lock helper returns `true`, which is
correct for a single-node deployment.

```bash
cd gbchat/server
npm run worker          # long-running
node services/worker.js --once
```
