import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const themes = {
  light: {
    name: 'Light',
    class: 'light',
    primary: '#0ea5e9',
    background: '#ffffff',
  },
  dark: {
    name: 'Dark',
    class: 'dark',
    primary: '#0ea5e9',
    background: '#111827',
  },
  midnight: {
    name: 'Midnight',
    class: 'midnight',
    primary: '#6366f1',
    background: '#0f0f23',
  },
  ocean: {
    name: 'Ocean',
    class: 'ocean',
    primary: '#06b6d4',
    background: '#0c4a6e',
  },
  sunset: {
    name: 'Sunset',
    class: 'sunset',
    primary: '#f97316',
    background: '#7c2d12',
  },
  forest: {
    name: 'Forest',
    class: 'forest',
    primary: '#22c55e',
    background: '#14532d',
  },
}

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      customTheme: null,
      chatWallpaper: null,
      fontSize: 'medium',
      
      setTheme: (themeName) => {
        set({ theme: themeName })
        document.documentElement.className = themeName
      },
      
      setCustomTheme: (colors) => {
        set({ customTheme: colors })
        // Apply custom CSS variables
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
      
      initTheme: () => {
        const { theme, fontSize } = get()
        document.documentElement.className = theme
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