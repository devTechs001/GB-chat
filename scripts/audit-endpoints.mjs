#!/usr/bin/env node
/**
 * audit-endpoints.mjs
 *
 * A deeper companion to `check-endpoints.mjs`. Where that script only asks
 * "does every client call have a server route?", this one audits the API
 * itself and writes a Markdown report:
 *
 *   - every registered route, grouped by mounted router
 *   - whether the router requires auth (`router.use(protect)`)
 *   - whether the client actually calls it
 *   - client calls with no matching server route
 *   - duplicate / shadowed routes
 *   - routes that look public but mutate data
 *
 *   node scripts/audit-endpoints.mjs            # print summary + write report
 *   node scripts/audit-endpoints.mjs --stdout   # print the whole report
 *
 * Report: gbchat/docs/ENDPOINT_AUDIT.md
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const serverDir = path.join(root, 'gbchat', 'server')
const clientSrc = path.join(root, 'gbchat', 'client', 'src')
const reportPath = path.join(root, 'gbchat', 'docs', 'ENDPOINT_AUDIT.md')

const read = (file) => fs.readFileSync(file, 'utf8')

const walk = (dir, extensions) => {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, extensions))
    else if (extensions.some((ext) => entry.name.endsWith(ext))) out.push(full)
  }
  return out
}

const normalize = (routePath) =>
  routePath
    .replace(/\$\{[^}]+\}/g, ':id')
    .replace(/\?.*$/, '')
    .replace(/:[A-Za-z_]+/g, ':id')
    .replace(/(.)\/$/, '$1')

const METHODS = ['get', 'post', 'put', 'patch', 'delete']

// ---------------------------------------------------------------- mounts
const indexSource = read(path.join(serverDir, 'index.js'))
const mounts = new Map()
for (const match of indexSource.matchAll(/app\.use\(\s*["']([^"']+)["']\s*,([^)]*)\)/g)) {
  for (const arg of match[2].split(',')) {
    const name = arg.trim()
    if (/^[A-Za-z_$][\w$]*$/.test(name)) mounts.set(name, match[1])
  }
}

const inlineRoutes = [...indexSource.matchAll(/app\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g)].map(
  (m) => ({ file: 'index.js', method: m[1].toUpperCase(), full: m[2], mount: null, guarded: false })
)

// ---------------------------------------------------------------- server routes
const routes = [...inlineRoutes]

for (const file of walk(path.join(serverDir, 'routes'), ['.js'])) {
  const routerName = path.basename(file, '.js')
  const mount = mounts.get(routerName)
  if (!mount) continue

  const source = read(file)
  // rough but useful: a router that applies protect() to everything
  const guarded = /router\.use\(\s*protect\s*\)/.test(source)
  const perRouteGuard = /protect/.test(source)
  const seen = new Set()

  const add = (method, routePath) => {
    const method_ = method.toUpperCase()
    const full = normalize(routePath === '/' ? mount : mount + routePath)
    const key = `${method_} ${full}`
    if (seen.has(key)) return
    seen.add(key)
    routes.push({
      file: path.relative(path.join(root, 'gbchat'), file),
      router: routerName,
      mount,
      method: method_,
      full,
      guarded: guarded || perRouteGuard,
      routerGuarded: guarded,
    })
  }

  // chained: router.route('/x').get(h).post(h)
  for (const chain of source.matchAll(/router\.route\(\s*["']([^"']+)["']\s*\)([^;]*)/g)) {
    for (const method of chain[2].matchAll(/\.(get|post|put|patch|delete)\(/g)) add(method[1], chain[1])
  }

  for (const match of source.matchAll(/router\.(get|post|put|patch|delete)\(\s*["']([^"']+)/g)) {
    add(match[1], match[2])
  }
}

routes.sort((a, b) => a.full.localeCompare(b.full) || a.method.localeCompare(b.method))

// ---------------------------------------------------------------- client calls
const clientCalls = new Map()
for (const file of walk(clientSrc, ['.js', '.jsx'])) {
  if (file.endsWith(path.join('lib', 'api.js'))) continue
  const lines = read(file).split('\n')
  lines.forEach((line, index) => {
    if (line.trim().startsWith('//')) return
    for (const match of line.matchAll(/api\.(get|post|put|patch|delete)\(\s*[`'"]([^`'"]+)/g)) {
      const key = `${match[1].toUpperCase()} ${normalize('/api' + match[2])}`
      if (!clientCalls.has(key)) clientCalls.set(key, `${path.relative(clientSrc, file)}:${index + 1}`)
    }
  })
}

const routeKeys = new Set(routes.map((r) => `${r.method} ${r.full}`))
const unmatchedCalls = [...clientCalls.entries()]
  .filter(([key]) => !routeKeys.has(key))
  .sort((a, b) => a[0].localeCompare(b[0]))

// duplicates: same "shape" (params collapsed already) registered twice
const shape = new Map()
for (const route of routes) {
  const key = `${route.method} ${route.full}`
  const list = shape.get(key) || []
  list.push(route.file)
  shape.set(key, list)
}
const duplicates = [...shape.entries()].filter(([, files]) => files.length > 1)

// Shadowing: a literal path registered *after* a parameterised path of the same
// shape can never be reached, because Express matches in definition order.
const toRegex = (routePath) =>
  new RegExp(
    '^' + routePath.replace(/\/+$/, '').replace(/:[A-Za-z_]+/g, '[^/]+').replace(/\//g, '\\/') + '/?$'
  )

const shadowed = []
for (const file of walk(path.join(serverDir, 'routes'), ['.js'])) {
  const source = read(file)
  const found = []
  for (const match of source.matchAll(/router\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g)) {
    found.push({ method: match[1].toUpperCase(), path: match[2] })
  }
  for (const chain of source.matchAll(/router\.route\(\s*["']([^"']+)["']\s*\)([^;]*)/g)) {
    for (const method of chain[2].matchAll(/\.(get|post|put|patch|delete)\(/g)) {
      found.push({ method: method[1].toUpperCase(), path: chain[1] })
    }
  }

  found.forEach((later, laterIndex) => {
    if (later.path.includes(':')) return // only literal paths can be shadowed
    found.forEach((earlier, earlierIndex) => {
      if (earlierIndex >= laterIndex) return
      if (earlier.method !== later.method) return
      if (!earlier.path.includes(':')) return
      // Only same-depth paths can shadow each other
      const depth = (value) => value.split('/').filter(Boolean).length
      if (depth(earlier.path) !== depth(later.path)) return
      if (toRegex(earlier.path).test(later.path)) {
        shadowed.push({
          file: path.relative(path.join(root, 'gbchat'), file),
          hidden: `${later.method} ${later.path}`,
          shadowedBy: `${earlier.method} ${earlier.path}`,
        })
      }
    })
  })
}

const unprotected = routes.filter(
  (route) => !route.guarded && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(route.method)
)
const unusedServerRoutes = routes.filter((route) => !clientCalls.has(`${route.method} ${route.full}`))

// ---------------------------------------------------------------- report
const byRouter = routes.reduce((acc, route) => {
  const key = route.router || '(inline in index.js)'
  acc[key] = acc[key] || []
  acc[key].push(route)
  return acc
}, {})

const lines = []
lines.push('# GBChat — endpoint audit')
lines.push('')
lines.push(`Generated: ${new Date().toISOString().slice(0, 10)} · \`node scripts/audit-endpoints.mjs\``)
lines.push('')
lines.push('## Summary')
lines.push('')
lines.push('| Metric | Value |')
lines.push('| --- | --- |')
lines.push(`| Registered routes | **${routes.length}** |`)
lines.push(`| Mounted routers | **${Object.keys(byRouter).length}** |`)
lines.push(`| Distinct client calls | **${clientCalls.size}** |`)
lines.push(`| Client calls without a route | **${unmatchedCalls.length}** |`)
lines.push(`| Routes no client calls yet | ${unusedServerRoutes.length} |`)
lines.push(`| Mutating routes without auth middleware | ${unprotected.length} |`)
lines.push(`| Duplicate route definitions | ${duplicates.length} |`)
lines.push(`| Shadowed routes | ${shadowed.length} |`)
lines.push('')

if (shadowed.length) {
  lines.push('## Shadowed routes (declared after a parameterised sibling)')
  lines.push('')
  lines.push('| Unreachable route | Shadowed by | File |')
  lines.push('| --- | --- | --- |')
  for (const entry of shadowed) {
    lines.push(`| \`${entry.hidden}\` | \`${entry.shadowedBy}\` | ${entry.file} |`)
  }
  lines.push('')
}

lines.push('## Routes per router')
lines.push('')
lines.push('| Router | Mount | Auth | Routes |')
lines.push('| --- | --- | --- | --- |')
for (const [router, list] of Object.entries(byRouter).sort((a, b) => a[0].localeCompare(b[0]))) {
  const authed = list.some((route) => route.guarded)
  lines.push(
    `| \`${router}\` | \`${list[0].mount || '—'}\` | ${authed ? 'yes' : 'no'} | ${list.length} |`
  )
}
lines.push('')

if (shadowed.length) {
  lines.push('## Shadowed routes (declared after a parameterised sibling)')
  lines.push('')
  lines.push('| Unreachable route | Shadowed by | File |')
  lines.push('| --- | --- | --- |')
  for (const entry of shadowed) {
    lines.push(`| \`${entry.hidden}\` | \`${entry.shadowedBy}\` | ${entry.file} |`)
  }
  lines.push('')
}

if (unmatchedCalls.length) {
  lines.push('## Client calls with no server route')
  lines.push('')
  lines.push('| Call | Where |')
  lines.push('| --- | --- |')
  for (const [key, where] of unmatchedCalls) lines.push(`| \`${key}\` | ${where} |`)
  lines.push('')
}

if (unprotected.length) {
  lines.push('## Mutating routes without auth middleware')
  lines.push('')
  lines.push('| Route | File |')
  lines.push('| --- | --- |')
  for (const route of unprotected) lines.push(`| \`${route.method} ${route.full}\` | ${route.file} |`)
  lines.push('')
}

if (duplicates.length) {
  lines.push('## Duplicate route definitions')
  lines.push('')
  for (const [key, files] of duplicates) lines.push(`- \`${key}\` — ${files.join(', ')}`)
  lines.push('')
}

lines.push('## All routes')
lines.push('')
lines.push('| Method | Path | Auth | Called by client | File |')
lines.push('| --- | --- | --- | --- | --- |')
for (const route of routes) {
  const called = clientCalls.has(`${route.method} ${route.full}`)
  lines.push(
    `| ${route.method} | \`${route.full}\` | ${route.guarded ? 'yes' : '—'} | ${called ? 'yes' : '—'} | ${route.file} |`
  )
}
lines.push('')

const report = lines.join('\n')
fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, report)

console.log(`routes             : ${routes.length}`)
console.log(`routers            : ${Object.keys(byRouter).length}`)
console.log(`client calls       : ${clientCalls.size}`)
console.log(`unmatched calls    : ${unmatchedCalls.length}`)
console.log(`unused by client   : ${unusedServerRoutes.length}`)
console.log(`unprotected writes : ${unprotected.length}`)
console.log(`duplicates         : ${duplicates.length}`)
console.log(`shadowed           : ${shadowed.length}`)
console.log(`report             : ${path.relative(root, reportPath)}`)

if (process.argv.includes('--stdout')) console.log(`\n${report}`)
if (unmatchedCalls.length && process.argv.includes('--strict')) process.exit(1)
