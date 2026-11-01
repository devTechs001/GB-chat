#!/usr/bin/env node
/**
 * audit-endpoints.mjs — deeper companion to `check-endpoints.mjs`.
 *
 * `check-endpoints` answers "does every call the client makes exist?".
 * This one answers the ops questions:
 *
 *   • what does each mounted router expose, and how many routes is that?
 *   • which routes are reachable without `protect` (auth) on the router itself?
 *   • which method+path pairs are declared twice (first one wins silently)?
 *   • which endpoints has no client called (dead surface, or admin/ops only)?
 *
 * Output: gbchat/docs/ENDPOINT_AUDIT.md  (+ a short stdout summary)
 *
 *   node scripts/audit-endpoints.mjs [--json]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const gb = path.join(root, 'gbchat')
const serverRoutesDir = path.join(gb, 'server', 'routes')
const clientSrc = path.join(gb, 'client', 'src')
const indexFile = path.join(gb, 'server', 'index.js')
const outFile = path.join(gb, 'docs', 'ENDPOINT_AUDIT.md')

const walk = (dir, exts = ['.js']) => {
  const out = []
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) continue
        visit(full)
      } else if (exts.includes(path.extname(entry.name))) {
        out.push(full)
      }
    }
  }
  visit(dir)
  return out
}

// ---------------------------------------------------------------- helpers
const normalize = (route) => {
  // Query strings never identify a route — drop them before comparing.
  const cleaned = route
    .split('?')[0]
    .replace(/\$\{[^}]+\}/g, ':id')
    .replace(/:[A-Za-z0-9_]+/g, ':id')
    .replace(/\/+$/, '')
    .replace(/\/{2,}/g, '/')
  return cleaned !== '' ? cleaned : '/'
}

const METHODS = ['get', 'post', 'put', 'patch', 'delete']

// ---------------------------------------------------------------- mounts
const indexSource = fs.readFileSync(indexFile, 'utf8')
const mounts = new Map()

for (const match of indexSource.matchAll(/app\.use\(\s*["']([^"']+)["']\s*,([^)]*)\)/g)) {
  const mountPath = match[1]
  const args = match[2]
  const identifiers = args
    .split(',')
    .map((part) => part.trim())
    .filter((part) => /^[A-Za-z_$][\w$]*$/.test(part))
  for (const identifier of identifiers) {
    if (!mounts.has(identifier)) mounts.set(identifier, [])
    if (!mounts.get(identifier).includes(mountPath)) mounts.get(identifier).push(mountPath)
  }
}

// ---------------------------------------------------------------- routes
const routers = []
const allRoutes = []
const seen = new Map()

for (const file of walk(serverRoutesDir).sort()) {
  const routerName = path.basename(file, '.js')
  const prefixes = mounts.get(routerName) || []
  const source = fs.readFileSync(file, 'utf8')

  const usesProtect = /router\.use\(\s*protect\s*\)/.test(source)
  const perRouteAuth = /(get|post|put|patch|delete)\(\s*["'][^"']+["']\s*,\s*protect/.test(source)

  const found = []

  // chained: router.route('/x').get(a).post(b)
  for (const chain of source.matchAll(/router\.route\(\s*["']([^"']+)["']\s*\)([^;]*)/g)) {
    for (const method of chain[2].matchAll(/\.(get|post|put|patch|delete)\(/g)) {
      found.push({
        method: method[1].toUpperCase(),
        route: chain[1],
        pos: chain.index + (method.index || 0),
      })
    }
  }

  for (const match of source.matchAll(/router\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g)) {
    found.push({ method: match[1].toUpperCase(), route: match[2], pos: match.index })
  }

  // Declaration order in the file is registration order — sort by offset, not
  // by which regex happened to run first.
  found.sort((a, b) => a.pos - b.pos)

  // Order matters in Express: an earlier route can swallow a later literal one
  // (`GET /:id` before `GET /mine`). Record the declaration order per router.
  const ordered = []

  for (const [index, item] of found.entries()) {
    ordered.push({ ...item, index })
  }

  const entries = []
  for (const { method, route } of found) {
    const fullPaths = prefixes.length
      ? prefixes.map((prefix) => normalize(prefix + (route === '/' ? '' : route)))
      : [normalize(route)]

    for (const fullPath of fullPaths) {
      const key = `${method} ${fullPath}`
      const auth = usesProtect || perRouteAuth
      entries.push({ method, path: fullPath, auth, key })

      if (seen.has(key)) {
        seen.get(key).duplicates = (seen.get(key).duplicates || 0) + 1
        seen.get(key).duplicateFiles.push(routerName)
      } else {
        const record = { ...entries[entries.length - 1], router: routerName, prefixes, duplicates: 0, duplicateFiles: [routerName] }
        seen.set(key, record)
        allRoutes.push(record)
      }
    }
  }

  // Does an earlier pattern match a later, more specific path?
  const shadowed = []
  for (const earlier of ordered) {
    const pattern = new RegExp(
      '^' + earlier.route.replace(/:[A-Za-z0-9_]+/g, '[^/]+').replace(/\*/g, '.*') + '$'
    )
    for (const later of ordered) {
      if (later.index <= earlier.index) continue
      if (later.method !== earlier.method) continue
      if (later.route.includes(':') || later.route === earlier.route) continue
      if (pattern.test(later.route)) {
        shadowed.push({ method: later.method, literal: later.route, swallowedBy: earlier.route })
      }
    }
  }

  routers.push({
    shadowed,
    name: routerName,
    file: path.relative(root, file),
    prefixes,
    mounted: prefixes.length > 0,
    usesProtect,
    perRouteAuth,
    routes: entries,
  })
}

// ---------------------------------------------------------------- client calls
const clientCalls = new Map()
for (const file of walk(clientSrc, ['.js', '.jsx'])) {
  if (file.endsWith(path.join('lib', 'api.js')) || file.endsWith(path.join('lib', 'token.js'))) continue
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (line.trim().startsWith('//')) return
    for (const m of line.matchAll(/api\.(get|post|put|patch|delete)\(\s*[`'"]([^`'"]+)/g)) {
      const key = `${m[1].toUpperCase()} ${normalize('/api' + m[2])}`
      if (!clientCalls.has(key)) clientCalls.set(key, `${path.relative(clientSrc, file)}:${i + 1}`)
    }
  })
}

const clientSet = new Set(clientCalls.keys())
const routeSet = new Set(allRoutes.map((r) => r.key))

const unmatchedClient = [...clientSet].filter((key) => !routeSet.has(key))
const unusedRoutes = allRoutes.filter((route) => !clientSet.has(route.key))
const duplicates = [...seen.values()].filter((route) => route.duplicates > 0)
const unauthenticated = allRoutes.filter((route) => !route.auth)
const unmounted = routers.filter((router) => !router.mounted)
const shadowedRoutes = routers.flatMap((router) =>
  (router.shadowed || []).map((entry) => ({ ...entry, router: router.name }))
)

// ---------------------------------------------------------------- report
const byRouter = [...routers].sort((a, b) => b.routes.length - a.routes.length)
const stamp = new Date().toISOString().slice(0, 10)

const lines = []
lines.push('# Endpoint audit')
lines.push('')
lines.push(`Generated by \`node scripts/audit-endpoints.mjs\` on ${stamp}.`)
lines.push('')
lines.push('| Metric | Value |')
lines.push('| --- | --- |')
lines.push(`| Server routes | ${allRoutes.length} |`)
lines.push(`| Routers mounted | ${routers.filter((r) => r.mounted).length} / ${routers.length} |`)
lines.push(`| Client calls | ${clientCalls.size} |`)
lines.push(`| Client calls without a server route | ${unmatchedClient.length} |`)
lines.push(`| Server routes no client calls | ${unusedRoutes.length} |`)
lines.push(`| Duplicate method + path | ${duplicates.length} |`)
lines.push(`| Routes without an auth guard | ${unauthenticated.length} |`)
lines.push(`| Shadowed routes (declared too late) | ${shadowedRoutes.length} |`)
lines.push('')

lines.push('## Routes per router')
lines.push('')
lines.push('| Router | Mount | Routes | Router-level `protect` |')
lines.push('| --- | --- | ---: | --- |')
for (const router of byRouter) {
  lines.push(
    `| \`${router.name}\` | ${router.prefixes.map((p) => `\`${p}\``).join(', ') || '— (not mounted)'} | ${router.routes.length} | ${router.usesProtect ? 'yes' : router.perRouteAuth ? 'per route' : '**no**'} |`
  )
}
lines.push('')

if (unmounted.length) {
  lines.push('## Routers that are never mounted')
  lines.push('')
  for (const router of unmounted) lines.push(`- \`${router.file}\` — ${router.routes.length} routes unreachable`)
  lines.push('')
}

if (shadowedRoutes.length) {
  lines.push('## Shadowed routes')
  lines.push('')
  lines.push('A more specific path is declared **after** a parameterised one, so Express matches the parameterised route first and the literal is unreachable.')
  lines.push('')
  lines.push('| Method | Literal (unreachable) | Swallowed by | Router |')
  lines.push('| --- | --- | --- | --- |')
  for (const route of shadowedRoutes) {
    lines.push(`| ${route.method} | \`${route.literal}\` | \`${route.swallowedBy}\` | \`${route.router}\` |`)
  }
  lines.push('')
}

if (duplicates.length) {
  lines.push('## Duplicate declarations (the first registration wins)')
  lines.push('')
  for (const route of duplicates) {
    lines.push(`- \`${route.key}\` — declared ${route.duplicates + 1}× (${[...new Set(route.duplicateFiles)].join(', ')})`)
  }
  lines.push('')
}

if (unauthenticated.length) {
  lines.push('## Routes with no auth guard')
  lines.push('')
  lines.push('These are public by design or a security bug — each one needs a decision.')
  lines.push('')
  lines.push('| Method | Path | Router |')
  lines.push('| --- | --- | --- |')
  for (const route of unauthenticated.sort((a, b) => a.path.localeCompare(b.path))) {
    lines.push(`| ${route.method} | \`${route.path}\` | \`${route.router}\` |`)
  }
  lines.push('')
}

if (unmatchedClient.length) {
  lines.push('## Client calls with no server route (broken)')
  lines.push('')
  for (const key of unmatchedClient) lines.push(`- \`${key}\` — ${clientCalls.get(key)}`)
  lines.push('')
}

lines.push('## Server routes the client never calls')
lines.push('')
lines.push('Not automatically a bug: some are for admin tooling, mobile clients or the gRPC bridge.')
lines.push('')
lines.push('| Method | Path | Router |')
lines.push('| --- | --- | --- |')
for (const route of unusedRoutes.sort((a, b) => a.path.localeCompare(b.path))) {
  lines.push(`| ${route.method} | \`${route.path}\` | \`${route.router}\` |`)
}
lines.push('')

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, lines.join('\n'))

const summary = {
  serverRoutes: allRoutes.length,
  routers: routers.length,
  mounted: routers.filter((r) => r.mounted).length,
  clientCalls: clientCalls.size,
  unmatchedClient: unmatchedClient.length,
  unusedRoutes: unusedRoutes.length,
  duplicates: duplicates.length,
  shadowed: shadowedRoutes.length,
  unauthenticated: unauthenticated.length,
  report: path.relative(root, outFile),
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ summary, unmatchedClient, duplicates: duplicates.map((d) => d.key), unauthenticated: unauthenticated.map((r) => r.key) }, null, 2))
} else {
  console.log('server routes      :', summary.serverRoutes)
  console.log('routers mounted    :', `${summary.mounted}/${summary.routers}`)
  console.log('client calls       :', summary.clientCalls)
  console.log('unmatched calls    :', summary.unmatchedClient)
  console.log('unused by client   :', summary.unusedRoutes)
  console.log('duplicate routes   :', summary.duplicates)
  console.log('shadowed routes    :', summary.shadowed)
  console.log('no auth guard      :', summary.unauthenticated)
  console.log('report             :', summary.report)
}

process.exitCode = unmatchedClient.length ? 1 : 0
