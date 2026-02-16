import { useEffect, useCallback } from 'react'
import useThemeStore from '../store/useThemeStore'

const useTheme = () => {
  const {
    theme,
    customTheme,
    chatWallpaper,
    fontSize,
    setTheme,
    setCustomTheme,
    setChatWallpaper,
    setFontSize,
    getAvailableThemes,
  } = useThemeStore()

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.className = theme
    
    // Apply dark mode preference
    if (theme === 'dark' || theme === 'midnight' || theme === 'cyberpunk') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    // Apply custom theme colors
    if (customTheme) {
      Object.entries(customTheme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value)
      })
    }
  }, [customTheme])

  useEffect(() => {
    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    }
    document.documentElement.style.fontSize = fontSizes[fontSize] || '16px'
  }, [fontSize])

  const isDarkMode = useCallback(() => {
    return ['dark', 'midnight', 'cyberpunk', 'ocean', 'forest', 'sunset'].includes(theme)
  }, [theme])

  const toggleDarkMode = useCallback(() => {
    setTheme(isDarkMode() ? 'light' : 'dark')
  }, [isDarkMode, setTheme])

  return {
    theme,
    customTheme,
    chatWallpaper,
    fontSize,
    isDarkMode: isDarkMode(),
    setTheme,
    setCustomTheme,
    setChatWallpaper,
    setFontSize,
    toggleDarkMode,
    availableThemes: getAvailableThemes(),
  }
}

export default useTheme