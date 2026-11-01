#!/usr/bin/env node
/**
 * check-endpoints.mjs
 *
 * Compares every endpoint the React client calls with the routes the Express
 * server actually registers. Run it after touching `client/src/lib/api.js`, any
 * component that talks to the API, or anything in `server/routes`.
 *
 *   node scripts/check-endpoints.mjs          # report mismatches
 *   node scripts/check-endpoints.mjs --strict # exit 1 when mismatches exist
 *
 * Exit codes: 0 = all client calls have a server route, 1 = mismatches found.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const serverDir = path.join(root, 'gbchat', 'server')
const clientSrc = path.join(root, 'gbchat', 'client', 'src')

const read = (file) => fs.readFileSync(file, 'utf8')

const walk = (dir, extensions) => {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, extensions))
    else if (extensions.some((ext) => entry.name.endsWith(ext))) out.push(full)
  }
  return out
}

/** `/groups/:groupId/polls/:pollId` -> `/api/groups/:id/polls/:id` */
const normalize = (routePath) =>
  routePath
    .replace(/\$\{[^}]+\}/g, ':id')
    .replace(/\?.*$/, '')
    .replace(/:[A-Za-z_]+/g, ':id')
    .replace(/(.)\/$/, '$1')

// ---------------------------------------------------------------- server side
const indexSource = read(path.join(serverDir, 'index.js'))
const mounts = new Map()
for (const match of indexSource.matchAll(/app\.use\(\s*["']([^"']+)["']\s*,\s*(\w+)\s*\)/g)) {
  mounts.set(match[2], match[1])
}

const serverRoutes = new Set()
for (const file of walk(path.join(serverDir, 'routes'), ['.js'])) {
  const routerName = path.basename(file, '.js')
  const prefix = mounts.get(routerName)
  if (!prefix) continue

  const source = read(file)

  // Chained definitions: router.route('/:id').get(handler).delete(handler)
  for (const chain of source.matchAll(/router\.route\(\s*["']([^"']+)["']\s*\)([^;]*)/g)) {
    const chainPath = chain[1]
    const chainMethods = chain[2]
    for (const method of chainMethods.matchAll(/\.(get|post|put|patch|delete)\(/g)) {
      const routePath = chainPath === '/' ? prefix : prefix + chainPath
      serverRoutes.add(`${method[1].toUpperCase()} ${normalize(routePath)}`)
    }
  }

  const patterns = [
    /router\.(get|post|put|patch|delete)\(\s*["']([^"']+)/g,
    /\.(get|post|put|patch|delete)\(\s*["']([^"']+)/g,
  ]

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const method = match[1].toUpperCase()
      const routePath = match[2] === '/' ? prefix : prefix + match[2]
      serverRoutes.add(`${method} ${normalize(routePath)}`)
    }
  }
}

// ---------------------------------------------------------------- client side
const clientCalls = new Map()
for (const file of walk(clientSrc, ['.js', '.jsx'])) {
  if (file.endsWith(path.join('lib', 'api.js'))) continue // the contract itself

  const lines = read(file).split('\n')
  lines.forEach((line, index) => {
    if (line.trim().startsWith('//')) return
    for (const match of line.matchAll(/api\.(get|post|put|patch|delete)\(\s*[`'"]([^`'"]+)/g)) {
      const key = `${match[1].toUpperCase()} ${normalize('/api' + match[2])}`
      if (!clientCalls.has(key)) {
        clientCalls.set(key, `${path.relative(clientSrc, file)}:${index + 1}`)
      }
    }
  })
}

// ---------------------------------------------------------------------- report
const missing = [...clientCalls.entries()]
  .filter(([key]) => !serverRoutes.has(key))
  .sort((a, b) => a[0].localeCompare(b[0]))

console.log(`server routes : ${serverRoutes.size}`)
console.log(`client calls  : ${clientCalls.size}`)
console.log(`unmatched     : ${missing.length}`)

if (missing.length) {
  console.log('\nClient calls without a matching server route:')
  for (const [key, where] of missing) {
    console.log(`  ${key.padEnd(42)} ${where}`)
  }
  if (process.argv.includes('--strict')) process.exit(1)
}
