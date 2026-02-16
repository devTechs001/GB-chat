import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useAuthStore from './store/useAuthStore'
import useThemeStore from './store/useThemeStore'
import useSocket from './hooks/useSocket'
import Loader from './components/common/Loader'
import Splash from './components/common/Splash'
import Onboard from './components/common/Onboard'
import MainLayout from './components/layout/MainLayout'

// Lazy load pages for better performance
const AuthPage = React.lazy(() => import('./pages/AuthPage'))
const ChatPage = React.lazy(() => import('./pages/ChatPage'))
const StoriesPage = React.lazy(() => import('./pages/StoriesPage'))
const ChannelsPage = React.lazy(() => import('./pages/ChannelsPage'))
const CallsPage = React.lazy(() => import('./pages/CallsPage'))
const GroupsPage = React.lazy(() => import('./pages/GroupsPage'))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))
const TermsAndConditions = React.lazy(() => import('./pages/legal/TermsAndConditions'))
const PrivacyPolicy = React.lazy(() => import('./pages/legal/PrivacyPolicy'))

function App() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const { theme, initTheme } = useThemeStore()
  const { connect, disconnect } = useSocket()

  // State for onboarding flow
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Check onboarding status
      const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true'

      // Check if user has persisted auth
      const persistedState = localStorage.getItem('auth-storage')
      let hasValidToken = false

      if (persistedState) {
        try {
          const parsed = JSON.parse(persistedState)
          hasValidToken = !!(parsed.token && parsed.isAuthenticated)
        } catch (e) {
          console.error('Error parsing persisted auth state:', e)
        }
      }

      // Initialize theme
      initTheme()

      // Verify auth status
      await checkAuth()

      // Determine what to show
      if (hasValidToken) {
        // User has valid token - skip splash, go to app
        setShowSplash(false)
        setShowOnboarding(false)
      } else if (hasCompletedOnboarding) {
        // User completed onboarding but no token - show splash briefly
        setTimeout(() => {
          setShowSplash(false)
        }, 1500)
      } else {
        // New user - show splash then onboarding
        setTimeout(() => {
          setShowSplash(false)
          setShowOnboarding(true)
        }, 2000)
      }

      setIsInitialized(true)
    }

    initializeApp()
  }, [])

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true')
    setShowOnboarding(false)
  }

  // Connect socket when user is authenticated
  useEffect(() => {
    if (user) {
      connect(user._id)
    } else {
      disconnect()
    }
    return () => disconnect()
  }, [user])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.className = theme
    document.documentElement.style.setProperty('color-scheme', theme)
  }, [theme])

  // Show splash during initialization
  if (!isInitialized || showSplash) {
    return <Splash />
  }

  // Show onboarding if needed
  if (showOnboarding) {
    return <Onboard onComplete={handleOnboardingComplete} />
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <Loader size="lg" />
      </div>
    )
  }

  // Main app routes
  return (
    <AnimatePresence mode="wait">
      <React.Suspense fallback={<Loader fullScreen />}>
        <Routes>
          {/* Public route */}
          <Route
            path="/auth"
            element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={isAuthenticated ? <MainLayout /> : <Navigate to="/auth" replace />}
          >
            <Route index element={<ChatPage />} />
            <Route path="chats" element={<ChatPage />} />
            <Route path="stories" element={<StoriesPage />} />
            <Route path="channels" element={<ChannelsPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="calls" element={<CallsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile/:userId" element={<ProfilePage />} />
          </Route>

          {/* Public legal pages */}
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
    </AnimatePresence>
  )
}

export default App
