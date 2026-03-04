import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const themes = {
  light: {
    name: 'Light',
    class: 'light',
    primary: '#0ea5e9',
    background: '#ffffff',
    emoji: '☀️',
    description: 'Clean & bright',
  },
  dark: {
    name: 'Dark',
    class: 'dark',
    primary: '#0ea5e9',
    background: '#111827',
    emoji: '🌙',
    description: 'Easy on the eyes',
  },
  'gb-green': {
    name: 'GB WhatsApp',
    class: 'dark theme-gb-green',
    primary: '#25D366',
    background: '#075E54',
    emoji: '💚',
    description: 'Classic GB style',
  },
  amoled: {
    name: 'AMOLED Black',
    class: 'dark theme-amoled',
    primary: '#25D366',
    background: '#000000',
    emoji: '🖤',
    description: 'True black for OLED',
  },
  midnight: {
    name: 'Midnight',
    class: 'dark midnight',
    primary: '#6366f1',
    background: '#0f0f23',
    emoji: '🌌',
    description: 'Deep midnight blue',
  },
  ocean: {
    name: 'Ocean',
    class: 'dark ocean',
    primary: '#06b6d4',
    background: '#0c4a6e',
    emoji: '🌊',
    description: 'Deep sea vibes',
  },
  'ocean-deep': {
    name: 'Ocean Deep',
    class: 'dark theme-ocean-deep',
    primary: '#06b6d4',
    background: '#0c1929',
    emoji: '🐋',
    description: 'Calm deep blue',
  },
  sunset: {
    name: 'Sunset',
    class: 'dark sunset',
    primary: '#f97316',
    background: '#7c2d12',
    emoji: '🌅',
    description: 'Warm sunset tones',
  },
  'sunset-glow': {
    name: 'Sunset Glow',
    class: 'dark theme-sunset-glow',
    primary: '#f97316',
    background: '#451a03',
    emoji: '🔥',
    description: 'Fiery orange glow',
  },
  forest: {
    name: 'Forest',
    class: 'dark forest',
    primary: '#22c55e',
    background: '#14532d',
    emoji: '🌲',
    description: 'Natural green',
  },
  cyberpunk: {
    name: 'Cyberpunk',
    class: 'dark cyberpunk',
    primary: '#d946ef',
    background: '#0a0a0a',
    emoji: '🤖',
    description: 'Neon future',
  },
  neon: {
    name: 'Neon',
    class: 'dark theme-neon',
    primary: '#00ff88',
    background: '#0a0a1a',
    emoji: '💡',
    description: 'Electric neon glow',
  },
  glass: {
    name: 'Glassmorphism',
    class: 'dark theme-glass',
    primary: '#8b5cf6',
    background: '#1e1b4b',
    emoji: '🪟',
    description: 'Frosted glass look',
  },
  rose: {
    name: 'Rose Gold',
    class: 'dark theme-rose',
    primary: '#f43f5e',
    background: '#1c1917',
    emoji: '🌹',
    description: 'Elegant rose gold',
  },
}

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      customTheme: null,
      chatWallpaper: null,
      fontSize: 'medium',
      bubbleStyle: 'modern', // 'modern', 'classic', 'minimal', 'rounded'
      chatEffect: 'none', // 'none', 'particles', 'snow', 'hearts', 'stars'
      messageAnimation: 'slide', // 'slide', 'fade', 'pop', 'none'

      setTheme: (themeName) => {
        const themeData = themes[themeName]
        set({ theme: themeName })
        if (themeData) {
          document.documentElement.className = themeData.class
          // Apply CSS variable overrides for primary color
          if (themeData.primary) {
            document.documentElement.style.setProperty('--color-primary-500', themeData.primary)
          }
        } else {
          document.documentElement.className = themeName
        }
      },

      setCustomTheme: (colors) => {
        set({ customTheme: colors })
        Object.entries(colors).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--color-${key}`, value)
        })
      },

      setChatWallpaper: (wallpaper) => {
        set({ chatWallpaper: wallpaper })
      },

      setFontSize: (size) => {
        set({ fontSize: size })
        const sizes = {
          small: '14px',
          medium: '16px',
          large: '18px',
          xlarge: '20px',
        }
        document.documentElement.style.fontSize = sizes[size] || '16px'
      },

      setBubbleStyle: (style) => {
        set({ bubbleStyle: style })
      },

      setChatEffect: (effect) => {
        set({ chatEffect: effect })
      },

      setMessageAnimation: (animation) => {
        set({ messageAnimation: animation })
      },

      initTheme: () => {
        const { theme, fontSize } = get()
        const themeData = themes[theme]
        if (themeData) {
          document.documentElement.className = themeData.class
          if (themeData.primary) {
            document.documentElement.style.setProperty('--color-primary-500', themeData.primary)
          }
        } else {
          document.documentElement.className = theme
        }
        get().setFontSize(fontSize)
      },

      getAvailableThemes: () => themes,
    }),
    {
      name: 'theme-storage',
    }
  )
)

export default useThemeStore