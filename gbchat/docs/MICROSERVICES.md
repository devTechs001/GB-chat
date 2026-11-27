# Microservices — how the split works

The API is **one codebase with a per-service entrypoint**, not five copies of
the app. A service mounts a subset of the *same* routers, so a migrated prefix
cannot behave differently from an in-process one — there is only one
implementation of every handler.

```
                     ┌──────────────┐
client ──▶ lb :8080 ─▶│ server1/2    │  API + Socket.IO + gRPC (unchanged)
                     │  (gateway)   │──┐
                     └──────────────┘  │  GATEWAY_ROUTES selects who owns what
                                       ▼
        ┌──────────┬───────────┬───────────┬──────────┬────────┐
     identity   messaging     social     content     data    (worker)
      :5001       :5002       :5003      :5004      :5005
```

## Why this shape

| Concern | Decision |
| --- | --- |
| Local development | **Unchanged.** `GATEWAY_ENABLED` defaults to false: every route mounts in-process exactly as before. |
| Realtime | Socket.IO and gRPC stay on the API replicas. Splitting them out needs sticky sessions and a Redis adapter, which is a different problem from stateless HTTP routes. |
| Data | All services share MongoDB/Redis. The split is along **route ownership**, not data ownership — no dual-write, no migration. |
| Rollback | Delete one id from `GATEWAY_ROUTES`. The prefix goes back to being served in-process on the next restart. |
| Failure isolation | Each service has a circuit breaker at the gateway; a dead service returns `503 SERVICE_UNAVAILABLE` in ~50 ms instead of holding a socket for 30 s. |

## Running it

### Local (single process — the default)

```bash
cd gbchat/server
node index.js            # every route, socket.io, gRPC, on :5000
```

### Local (gateway + one extracted service)

```bash
# terminal 1 — the social service on :5003
cd gbchat/server
SERVICE=social PORT=5003 node services/gateway/serviceEntry.js social

# terminal 2 — the API, forwarding /api/{groups,stories,channels,calls} to it
GATEWAY_ENABLED=true GATEWAY_ROUTES=social GRPC_ENABLED=false node index.js
```

`GET /api/system/gateway` then reports the composition and the live breaker
state:

```json
{
  "enabled": true,
  "migrated": ["social"],
  "services": [{ "id": "social", "migrated": true, "target": "http://127.0.0.1:5003" }],
  "breakers": [{ "name": "social", "status": "closed", "failures": 0 }]
}
```

### Docker Compose

```bash
docker compose up -d                                   # monolith (2 replicas + worker + lb)
docker compose --profile services up -d                # + all five services
GATEWAY_ENABLED=true GATEWAY_ROUTES=all docker compose --profile services up -d
```

The service containers are **profile-gated** (`profiles: ["services"]`), so a
plain `docker compose up` starts exactly what it started before this change.

## Service map

| Service | Port | Prefixes |
| --- | --- | --- |
| `identity` | 5001 | `/api/auth` `/api/users` `/api/contacts` `/api/devices` `/api/privacy` `/api/account` `/api/recovery` `/api/push` |
| `messaging` | 5002 | `/api/chats` `/api/messages` `/api/chat-lock` `/api/chat-settings` `/api/chat-display` `/api/translations` `/api/emoji` |
| `social` | 5003 | `/api/groups` `/api/stories` `/api/channels` `/api/calls` |
| `content` | 5004 | `/api/gb-settings` `/api/gb-features` `/api/appearance` `/api/notifications` `/api/permissions` |
| `data` | 5005 | `/api/storage` `/api/backup/local` `/api/backup/offline` `/api/backup` |

The registry lives in `server/services/gateway/registry.js` — adding a service is
one entry plus one `ROUTERS` function in `serviceEntry.js`.

## Environment

| Variable | Default | Meaning |
| --- | --- | --- |
| `GATEWAY_ENABLED` | `false` | Turn the proxy on. |
| `GATEWAY_ROUTES` | *(empty)* | Comma-separated service ids, or `all`. Empty = monolith. |
| `GATEWAY_<ID>_URL` | `http://<id>:<port>` / `http://127.0.0.1:<port>` | Where to forward. |
| `GATEWAY_TIMEOUT_MS` | `30000` | Per-request upstream timeout. |
| `GATEWAY_MAX_ATTEMPTS` | `2` | Retry budget for safe requests. |
| `GATEWAY_BREAKER_THRESHOLD` / `..._COOLDOWN_MS` | `5` / `10000` | Breaker tuning. |
| `SERVICE`, `PORT` | — | Which service a container runs and on which port. |

## Gateway behaviour (the parts that matter)

- **Tracing** — the gateway's `x-request-id` is forwarded and echoed, and the
  response carries `x-gateway-service`, `x-gateway-attempts`, `x-gateway-ms`.
- **Retries are idempotency-safe.** `GET`/`HEAD` retry on connection errors.
  `POST`/`PUT`/`PATCH`/`DELETE` retry **only** when the caller sent an
  `Idempotency-Key` — replaying an unauthored POST would duplicate a message.
- **No phantom writes.** A response is buffered only until its first byte; after
  that it streams straight through and is never replayed.
- **Errors keep the API envelope**: `{ success: false, code: "SERVICE_UNAVAILABLE", message, service, requestId }`.
- **Never proxies `/api/system/*`** — probes must answer even when every service
  is down (that is what lets the LB see "degraded" instead of a time-out).

## Tests

```bash
cd gbchat/server && npm test        # includes test/gateway.test.mjs
```

The tests cover: monolith default off, prefix uniqueness across services,
longest-prefix matching (`/api/backup/local` before `/api/backup`), env
overrides, `all`, and the breaker's closed → open → half-open → closed cycle.
