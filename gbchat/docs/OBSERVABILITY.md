# Observability

No APM agent, no metrics dependency. Three pieces, all in-process:

| Piece | File | What it gives you |
| --- | --- | --- |
| Request id | `server/middleware/observability.js` → `requestId` | every response carries `x-request-id`; logs and error lines include it |
| Per-route metrics | same file → `metricsMiddleware` | count, avg / max, p50 / p95 / p99, 4xx & 5xx, last status per route template |
| Endpoints | `GET /api/system/metrics`, `POST /api/system/metrics/reset` | JSON by default, Prometheus text with `?format=prom` |

## Request ids

* An upstream id is reused when it is 8–128 characters (`x-request-id`), so one
  trace keeps one identifier through nginx / a cloud LB / a client retry.
* Otherwise a UUID is generated.
* `errorHandler` prepends the id to the error log and echoes it on failures, and
  slow requests are logged as
  `[slow] GET /api/messages/:id 200 1420ms id=… user=…`.

Curl a broken request and you can grep the exact line:

```bash
curl -sD - -H 'x-request-id: my-trace-1234' http://localhost:5000/api/nope
# x-request-id: my-trace-1234
grep my-trace-1234 server.log
```

## Metrics

```bash
TOKEN=<jwt>
curl -s -H "Authorization: Bearer $TOKEN" localhost:5000/api/system/metrics | jq '.totals, .routes[:5]'
curl -s -H "Authorization: Bearer $TOKEN" 'localhost:5000/api/system/metrics?format=prom' | head
```

Shape:

```json
{
  "uptimeSeconds": 812,
  "process": { "pid": 42, "memoryMb": 118, "cpuUserMs": 9310 },
  "totals": {
    "requests": 1520, "avgMs": 12.4, "slowRequests": 3, "slowThresholdMs": 1000,
    "statusClasses": { "2xx": 1489, "3xx": 1, "4xx": 27, "5xx": 3 },
    "errorRate": 0.2, "trackedRoutes": 41
  },
  "routes": [
    { "route": "POST /api/messages/:id", "count": 240, "errors": 1,
      "avgMs": 31.2, "maxMs": 1420, "p50": 18.6, "p95": 96.1, "p99": 1418.4,
      "lastStatus": 201, "lastAt": "2026-11-01T10:02:11.004Z" }
  ]
}
```

**Route templates, not URLs.** `/api/chats/65f1…/messages` is recorded as
`/api/chats/:id/messages`, so cardinality stays bounded. Memory is capped too:
at most 200 routes (least-used evicted) and a 200-sample ring per route, so
percentiles stay recent without growing.

### Prometheus

`?format=prom` emits `gbchat_http_requests_total`,
`gbchat_http_request_duration_ms{quantile=…}`, `gbchat_process_resident_memory_mb`
and `gbchat_uptime_seconds`. Scrape config:

```yaml
scrape_configs:
  - job_name: gbchat
    metrics_path: /api/system/metrics
    params: { format: ["prom"] }
    authorization: { credentials: "<token>" }
    static_configs: [{ targets: ["gbchat:5000"] }]
```

> The endpoint sits behind `protect` (any signed-in user). If you scrape it,
> issue a dedicated account and keep the token in the scraper's secret store —
> or front it with the LB and an allowlist for the scrape network only.

## Tuning

| Env var | Default | Meaning |
| --- | --- | --- |
| `SLOW_REQUEST_MS` | `1000` | Threshold for `[slow]` log lines and the `slowRequests` counter |

## What this does not do

* Nothing is persisted — restarting the process resets counters (that is fine
  for "what is happening right now"; use the log lines for history).
* No distributed tracing beyond the request id: that id *is* forwarded on
  internal gRPC calls (see below), but there are no spans or timings per hop.
* `POST /api/system/metrics/reset` clears counters without authentication
  beyond `protect`; treat it as a debugging affordance, not an admin API.

## Client-side error reporting

`components/common/RouteErrorBoundary.jsx` catches a render error in any routed
page, keeps the shell (sidebar / bottom nav) alive, shows the message and offers
**Try again**, **Back to chats** and **Copy details** (path, message, stack,
component stack, user agent) for a bug report. It resets automatically when the
route changes.

The boundary previously existed only around the two chat panes, so a crash in
Profile, Stories, Channels or Settings blanked the entire app.

## Trace propagation into gRPC

`requestId` runs the rest of the request inside an `AsyncLocalStorage` store, so
the id survives `await`s without being threaded through function arguments.
`grpc/client.js` reads it when building call metadata:

```
HTTP request (x-request-id: trace-abc) → ALS store → grpc.Send metadata
                                                     → payload.requestId
```

Consequences:

* an internal fan-out appears in the gRPC node's payload and logs with the same
  id the HTTP client was given;
* calls made outside a request (a cron job, a boot-time probe) send no id at all
  rather than a fabricated one;
* concurrent requests never cross ids — covered by
  `test/grpcTrace.test.mjs`.

## Browser crash digest

The route error boundary and two global handlers (`window.onerror`,
`unhandledrejection`) POST to `POST /api/system/client-error`:

```json
{ "message": "…", "stack": "…", "route": "/channels",
  "component": "…", "kind": "boundary|error|unhandledrejection",
  "userAgent": "…", "requestId": "…" }
```

* **Public intake.** A crash on the login screen still matters, so the endpoint
  does not require a token. It is throttled by the global limiter, validates that
  `message` or `stack` is present, and truncates every field (500/4000/200
  chars) so one client cannot fill the buffer.
* **Bounded in memory.** The last `CLIENT_ERROR_BUFFER` (default 100) reports,
  plus grouped counts by fingerprint (message + first stack frame, with
  `line:col` stripped so a deploy that shifts lines does not split a group).
  A restart clears them — reports are diagnostics, not records.
* **Operator view.** `GET /api/system/client-errors?limit=25` returns
  `{ total, bufferSize, reports, groups }`; `DELETE` clears it. The client
  surfaces both on Settings → **System health**, next to the live metrics.
* **Client side.** Reports are deduped per session (same crash once a minute)
  and sent with `keepalive` so they survive the tab closing mid-unload.

