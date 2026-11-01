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

  // The store applies palette, mode, surfaces and font size to <html>
  useEffect(() => {
    useThemeStore.getState().initTheme()
  }, [theme, customTheme, fontSize])

  const isDarkMode = useCallback(() => {
    const themes = useThemeStore.getState().getAvailableThemes()
    return (themes[theme]?.mode || 'light') === 'dark'
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