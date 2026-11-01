import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Theme system
 * -------------
 * Every theme declares a full palette (primary scale + surfaces + borders) and a
 * `mode`. `applyTheme()` writes those values to CSS custom properties on the
 * <html> element, which is what `index.css` and Tailwind (via
 * `tailwind.config.js`) consume — so switching a theme now changes the entire
 * UI, not just one accent colour.
 */

const scale = (base) => ({
  50: base[0],
  100: base[1],
  200: base[2],
  300: base[3],
  400: base[4],
  500: base[5],
  600: base[6],
  700: base[7],
  800: base[8],
  900: base[9],
})

const makeTheme = ({
  name,
  mode,
  description,
  primary,
  background,
  surface,
  surfaceAlt,
  border,
  text,
  textMuted,
  swatch,
}) => ({
  name,
  mode,
  description,
  class: mode === 'dark' ? 'dark' : 'light',
  primary: primary[5],
  background,
  surface,
  surfaceAlt,
  border,
  text,
  textMuted,
  swatch: swatch || [primary[5], background, surface],
  palette: scale(primary),
})

const themes = {
  light: makeTheme({
    name: 'Daylight',
    mode: 'light',
    description: 'Clean, bright and neutral',
    primary: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'],
    background: '#f6f7f9',
    surface: '#ffffff',
    surfaceAlt: '#f3f4f6',
    border: '#e5e7eb',
    text: '#0f172a',
    textMuted: '#64748b',
  }),
  dark: makeTheme({
    name: 'Graphite',
    mode: 'dark',
    description: 'Balanced dark grey',
    primary: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'],
    background: '#0f1115',
    surface: '#171a21',
    surfaceAlt: '#1f232c',
    border: '#2a2f3a',
    text: '#f8fafc',
    textMuted: '#94a3b8',
  }),
  'gb-green': makeTheme({
    name: 'GB Green',
    mode: 'dark',
    description: 'Classic messenger green',
    primary: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#25D366', '#128C7E', '#0b6b60', '#075E54', '#053b34'],
    background: '#0b141a',
    surface: '#111c22',
    surfaceAlt: '#16262e',
    border: '#21333b',
    text: '#ecfdf5',
    textMuted: '#9cb8b3',
  }),
  amoled: makeTheme({
    name: 'AMOLED',
    mode: 'dark',
    description: 'True black, battery friendly',
    primary: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#25D366', '#128C7E', '#0b6b60', '#075E54', '#053b34'],
    background: '#000000',
    surface: '#08090b',
    surfaceAlt: '#101114',
    border: '#1c1e22',
    text: '#ffffff',
    textMuted: '#8b949e',
  }),
  midnight: makeTheme({
    name: 'Midnight',
    mode: 'dark',
    description: 'Deep indigo night',
    primary: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'],
    background: '#0b0b1a',
    surface: '#141428',
    surfaceAlt: '#1b1b36',
    border: '#26264a',
    text: '#eef2ff',
    textMuted: '#9aa0c0',
  }),
  ocean: makeTheme({
    name: 'Ocean',
    mode: 'dark',
    description: 'Cool deep-water blue',
    primary: ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
    background: '#081725',
    surface: '#0d2233',
    surfaceAlt: '#123044',
    border: '#1b3f56',
    text: '#e6faff',
    textMuted: '#8fb8c9',
  }),
  forest: makeTheme({
    name: 'Forest',
    mode: 'dark',
    description: 'Earthy deep green',
    primary: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
    background: '#0b1512',
    surface: '#10201b',
    surfaceAlt: '#152a23',
    border: '#1f3a31',
    text: '#eafaf2',
    textMuted: '#8fb5a4',
  }),
  sunset: makeTheme({
    name: 'Sunset',
    mode: 'dark',
    description: 'Warm amber glow',
    primary: ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
    background: '#160f0c',
    surface: '#1f1611',
    surfaceAlt: '#2a1d16',
    border: '#3a2a20',
    text: '#fff4ea',
    textMuted: '#c2a495',
  }),
  rose: makeTheme({
    name: 'Rose',
    mode: 'dark',
    description: 'Muted pink accents',
    primary: ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337'],
    background: '#150d10',
    surface: '#20141a',
    surfaceAlt: '#2a1a22',
    border: '#3a2530',
    text: '#fff1f4',
    textMuted: '#c9a2ae',
  }),
  cyberpunk: makeTheme({
    name: 'Cyberpunk',
    mode: 'dark',
    description: 'Neon magenta on black',
    primary: ['#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf', '#86198f', '#701a75'],
    background: '#07060d',
    surface: '#120a1c',
    surfaceAlt: '#1b0f2a',
    border: '#2c1a44',
    text: '#fbeaff',
    textMuted: '#b39ac9',
  }),
  forestlight: makeTheme({
    name: 'Sage',
    mode: 'light',
    description: 'Soft light theme with green accents',
    primary: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
    background: '#f4f8f6',
    surface: '#ffffff',
    surfaceAlt: '#eef4f1',
    border: '#dfe8e4',
    text: '#0f231d',
    textMuted: '#5c766d',
  }),
  sakura: makeTheme({
    name: 'Sakura',
    mode: 'light',
    description: 'Airy blossom pink',
    primary: ['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'],
    background: '#fff7fb',
    surface: '#ffffff',
    surfaceAlt: '#fdf0f6',
    border: '#f6e0ea',
    text: '#2b1020',
    textMuted: '#8a6478',
  }),
}

const FONT_SIZES = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '20px',
}

const cssVarName = (shade) => `--color-primary-${shade}`

const applyTheme = (themeName, overrides = {}) => {
  if (typeof document === 'undefined') return
  const theme = themes[themeName] || themes.light
  const root = document.documentElement

  // Mode class drives Tailwind's `dark:` variant
  root.classList.remove('light', 'dark')
  root.classList.add(theme.mode)

  // Palette + surfaces
  Object.entries(theme.palette).forEach(([shade, value]) => {
    root.style.setProperty(cssVarName(shade), value)
  })
  root.style.setProperty('--color-dark-bg', theme.background)
  root.style.setProperty('--color-dark-surface', theme.surface)

  root.style.setProperty('--app-bg', theme.background)
  root.style.setProperty('--app-surface', theme.surface)
  root.style.setProperty('--app-surface-alt', theme.surfaceAlt)
  root.style.setProperty('--app-border', theme.border)
  root.style.setProperty('--app-text', theme.text)
  root.style.setProperty('--app-text-muted', theme.textMuted)

  Object.entries(overrides).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })

  root.style.setProperty('color-scheme', theme.mode)
  root.dataset.theme = themeName
  root.dataset.mode = theme.mode
}

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      customTheme: null,
      chatWallpaper: null,
      globalWallpaper: null,
      fontSize: 'medium',
      bubbleStyle: 'modern',
      chatEffect: 'none',
      messageAnimation: 'slide',
      reducedMotion: false,

      setTheme: (themeName) => {
        if (!themes[themeName]) return
        set({ theme: themeName })
        applyTheme(themeName)
      },

      setCustomTheme: (colors) => {
        const next = { ...(get().customTheme || {}), ...colors }
        set({ customTheme: next })
        applyTheme(get().theme, next)
      },

      setChatWallpaper: (wallpaper) => set({ chatWallpaper: wallpaper }),

      setGlobalWallpaper: (wallpaper) => {
        set({ globalWallpaper: wallpaper })
        try {
          if (wallpaper) localStorage.setItem('global-wallpaper', wallpaper)
          else localStorage.removeItem('global-wallpaper')
        } catch {
          /* ignore quota errors */
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('global-wallpaper-change', { detail: { wallpaper } })
          )
        }
      },

      setFontSize: (size) => {
        set({ fontSize: size })
        if (typeof document === 'undefined') return
        document.documentElement.style.fontSize = FONT_SIZES[size] || FONT_SIZES.medium
        document.documentElement.dataset.fontSize = size
      },

      setBubbleStyle: (style) => {
        set({ bubbleStyle: style })
        if (typeof document !== 'undefined') document.documentElement.dataset.bubble = style
      },

      setChatEffect: (effect) => set({ chatEffect: effect }),

      setMessageAnimation: (animation) => set({ messageAnimation: animation }),

      setReducedMotion: (value) => {
        set({ reducedMotion: value })
        if (typeof document !== 'undefined') {
          document.documentElement.dataset.reducedMotion = value ? 'true' : 'false'
        }
      },

      resetAppearance: () => {
        set({
          theme: 'light',
          customTheme: null,
          chatWallpaper: null,
          fontSize: 'medium',
          bubbleStyle: 'modern',
          chatEffect: 'none',
          messageAnimation: 'slide',
        })
        applyTheme('light')
        if (typeof document !== 'undefined') {
          document.documentElement.style.fontSize = FONT_SIZES.medium
          document.documentElement.dataset.bubble = 'modern'
          document.documentElement.dataset.fontSize = 'medium'
        }
      },

      /** Re-apply persisted preferences (called once on boot) */
      initTheme: () => {
        const { theme, fontSize, bubbleStyle, chatEffect, customTheme } = get()
        applyTheme(theme, customTheme || {})
        get().setFontSize(fontSize)
        get().setBubbleStyle(bubbleStyle)
        if (chatEffect) document.documentElement.dataset.effect = chatEffect
      },

      getAvailableThemes: () => themes,
      getThemeList: () =>
        Object.entries(themes).map(([id, theme]) => ({ id, ...theme })),
      isDarkTheme: () => (themes[get().theme] || themes.light).mode === 'dark',
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Re-apply as soon as persisted values are restored
        state?.initTheme?.()
      },
    }
  )
)

export { themes, applyTheme }
export default useThemeStore
