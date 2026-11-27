/**
 * wallpapers.js — the chat background library.
 *
 * Problems with the old library:
 *  1. `AppearanceSettings` pointed at `/wallpapers/*.jpg` — those files do not
 *     exist in `public/`, so every thumbnail was a broken image.
 *  2. The picker stored a *data-URI string* per chat, so a photo cost ~200 KB of
 *     localStorage per conversation and the quota died after a handful of chats.
 *  3. Wallpapers were flat single-colour or one-stop gradients, which look dated.
 *
 * What replaces them:
 *  - **Generated CSS art**: layered radial/linear gradients (mesh-gradient style)
 *    and inline SVG patterns. Zero network requests, zero storage cost, crisp at
 *    any resolution and they follow the active theme.
 *  - **An id, not a blob.** `{ kind: 'css', value }` is stored as a tiny key.
 *    A user photo is still supported but capped and stored separately.
 *
 * Every entry is a pure value, so a wallpaper can be rendered in a thumbnail
 * with the exact same `background` shorthand used by the chat area.
 */

/** Mesh gradients: 3–4 radial blobs over a base — the modern "aurora" look. */
const mesh = (base, blobs) =>
  [
    ...blobs.map(
      ({ x, y, size, color, opacity = 0.9 }) =>
        `radial-gradient(${size} at ${x} ${y}, ${color} 0%, transparent ${opacity * 100}%)`
    ),
    base,
  ].join(', ')

export const WALLPAPERS = [
  // ---- Signature (the app's own gradients) --------------------------------
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'signature',
    kind: 'css',
    dark: true,
    background: mesh('#0b1220', [
      { x: '12%', y: '8%', size: '60% 55%', color: 'rgba(56,189,248,0.55)' },
      { x: '88%', y: '18%', size: '55% 50%', color: 'rgba(168,85,247,0.50)' },
      { x: '50%', y: '92%', size: '70% 60%', color: 'rgba(16,185,129,0.40)' },
    ]),
  },
  {
    id: 'midnight-mesh',
    name: 'Midnight',
    category: 'signature',
    kind: 'css',
    dark: true,
    background: mesh('#070a14', [
      { x: '18%', y: '22%', size: '55% 50%', color: 'rgba(59,130,246,0.45)' },
      { x: '78%', y: '78%', size: '60% 55%', color: 'rgba(129,140,248,0.38)' },
    ]),
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    category: 'signature',
    kind: 'css',
    background: mesh('#fff7ed', [
      { x: '10%', y: '10%', size: '65% 60%', color: 'rgba(251,146,60,0.55)' },
      { x: '85%', y: '30%', size: '55% 50%', color: 'rgba(244,114,182,0.45)' },
      { x: '50%', y: '95%', size: '70% 60%', color: 'rgba(253,224,71,0.45)' },
    ]),
  },
  {
    id: 'mint',
    name: 'Mint',
    category: 'signature',
    kind: 'css',
    background: mesh('#f0fdf4', [
      { x: '20%', y: '15%', size: '60% 55%', color: 'rgba(52,211,153,0.45)' },
      { x: '90%', y: '80%', size: '60% 55%', color: 'rgba(56,189,248,0.35)' },
    ]),
  },
  {
    id: 'orchid',
    name: 'Orchid',
    category: 'signature',
    kind: 'css',
    background: mesh('#faf5ff', [
      { x: '15%', y: '20%', size: '60% 60%', color: 'rgba(192,132,252,0.50)' },
      { x: '85%', y: '75%', size: '60% 55%', color: 'rgba(244,114,182,0.35)' },
    ]),
  },
  {
    id: 'graphite',
    name: 'Graphite',
    category: 'signature',
    kind: 'css',
    dark: true,
    background: mesh('#101214', [
      { x: '25%', y: '20%', size: '55% 50%', color: 'rgba(148,163,184,0.28)' },
      { x: '80%', y: '85%', size: '60% 55%', color: 'rgba(75,85,99,0.40)' },
    ]),
  },

  // ---- Textures (inline SVG, tileable) ------------------------------------
  {
    id: 'paper',
    name: 'Paper',
    category: 'texture',
    kind: 'css',
    size: '220px 220px',
    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E"), #f7f6f3`,
  },
  {
    id: 'dots',
    name: 'Dots',
    category: 'texture',
    kind: 'css',
    size: '22px 22px',
    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='2' cy='2' r='1.4' fill='%2394a3b8' fill-opacity='0.35'/%3E%3C/svg%3E"), #f8fafc`,
  },
  {
    id: 'grid',
    name: 'Grid',
    category: 'texture',
    kind: 'css',
    size: '28px 28px',
    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M0 0h28v28H0z' fill='none' stroke='%2394a3b8' stroke-opacity='0.22' stroke-width='1'/%3E%3C/svg%3E"), #f8fafc`,
  },
  {
    id: 'waves-lines',
    name: 'Contour',
    category: 'texture',
    kind: 'css',
    size: '64px 32px',
    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='32'%3E%3Cpath d='M0 24c16-16 32-16 48 0s16 16 32 0' fill='none' stroke='%2338bdf8' stroke-opacity='0.22' stroke-width='1.5'/%3E%3C/svg%3E"), #f5f9ff`,
  },
  {
    id: 'honeycomb',
    name: 'Honeycomb',
    category: 'texture',
    kind: 'css',
    size: '40px 46px',
    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='46'%3E%3Cpath d='M20 0l20 11.5v23L20 46 0 34.5v-23z' fill='none' stroke='%23fbbf24' stroke-opacity='0.30' stroke-width='1.2'/%3E%3C/svg%3E"), #fffdf5`,
  },
  {
    id: 'terrazzo',
    name: 'Terrazzo',
    category: 'texture',
    kind: 'css',
    size: '120px 120px',
    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg opacity='0.35'%3E%3Ccircle cx='18' cy='24' r='4' fill='%23f472b6'/%3E%3Ccircle cx='74' cy='12' r='3' fill='%2338bdf8'/%3E%3Ccircle cx='96' cy='62' r='5' fill='%2334d399'/%3E%3Ccircle cx='34' cy='82' r='3' fill='%23fbbf24'/%3E%3Ccircle cx='62' cy='102' r='4' fill='%23a78bfa'/%3E%3C/g%3E%3C/svg%3E"), #fdfcfa`,
  },

  // ---- Classic plain (still the calmest option) ---------------------------
  {
    id: 'whatsapp',
    name: 'Classic Sand',
    category: 'plain',
    kind: 'css',
    background: '#efe7dd',
  },
  {
    id: 'slate',
    name: 'Slate',
    category: 'plain',
    kind: 'css',
    dark: true,
    background: '#0f172a',
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    category: 'plain',
    kind: 'css',
    dark: true,
    background: '#17181b',
  },
  {
    id: 'porcelain',
    name: 'Porcelain',
    category: 'plain',
    kind: 'css',
    background: '#f8f8f7',
  },
  {
    id: 'linen',
    name: 'Linen',
    category: 'plain',
    kind: 'css',
    background: '#faf7f2',
  },
  {
    id: 'deep-forest',
    name: 'Deep Forest',
    category: 'plain',
    kind: 'css',
    dark: true,
    background: '#0b1f17',
  },
]

export const WALLPAPER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'signature', label: 'Signature' },
  { id: 'texture', label: 'Textures' },
  { id: 'plain', label: 'Plain' },
  { id: 'custom', label: 'Yours' },
]

export const DEFAULT_WALLPAPER_ID = 'aurora'

export const getWallpaper = (id) => WALLPAPERS.find((entry) => entry.id === id) || null

/**
 * Turn a stored wallpaper reference into CSS the chat area can use directly.
 * Accepts:
 *   - an id ('aurora')
 *   - { kind: 'css', value } / { kind: 'image', value }
 *   - a legacy absolute URL or data-URI (what the old picker saved)
 */
export const resolveWallpaper = (stored) => {
  if (!stored) return null

  if (typeof stored === 'string') {
    const known = getWallpaper(stored)
    if (known) {
      return {
        background: known.background,
        backgroundSize: known.size || 'cover',
        backgroundPosition: 'center',
        isDark: Boolean(known.dark),
      }
    }
    if (/^(https?:|data:|blob:)/.test(stored)) {
      return {
        background: `url("${stored}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        isDark: false,
      }
    }
    return null
  }

  if (stored.kind === 'css') {
    return {
      background: stored.value,
      backgroundSize: stored.size || 'cover',
      backgroundPosition: 'center',
      isDark: Boolean(stored.dark),
    }
  }

  if (stored.kind === 'image' && stored.value) {
    return {
      background: `url("${stored.value}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      isDark: Boolean(stored.dark),
    }
  }

  return null
}

/** The compact thing we persist for a wallpaper choice. */
export const serializeWallpaper = (wallpaper) => {
  if (!wallpaper) return null
  if (typeof wallpaper === 'string') {
    const known = getWallpaper(wallpaper)
    if (known) return { kind: 'css', value: known.background, size: known.size, dark: Boolean(known.dark), id: known.id }
    return { kind: 'image', value: wallpaper }
  }
  if (wallpaper.kind) return wallpaper
  return null
}
