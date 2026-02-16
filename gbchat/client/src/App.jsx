import React, { useEffect, lazy, Suspense, useState } from 'react'
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
const AuthPage = lazy(() => import('./pages/AuthPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const StoriesPage = lazy(() => import('./pages/StoriesPage'))
const ChannelsPage = lazy(() => import('./pages/ChannelsPage'))
const CallsPage = lazy(() => import('./pages/CallsPage'))
const GroupsPage = lazy(() => import('./pages/GroupsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions'))
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'))

function App() {
  const { user, checkAuth, isLoading } = useAuthStore()
  const { theme, initTheme } = useThemeStore()
  const { connect, disconnect } = useSocket()

  // State for onboarding flow
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has already completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding')

    // Check if there's a persisted token (user might be logged in)
    const persistedState = localStorage.getItem('auth-storage')

    let hasToken = false
    if (persistedState) {
      try {
        const parsedState = JSON.parse(persistedState)
        if (parsedState.token && parsedState.isAuthenticated) {
          hasToken = true
        }
      } catch (e) {
        console.error('Error parsing persisted auth state:', e)
      }
    }

    // If there's a persisted token, don't show splash initially
    // We'll still call checkAuth to verify the token is valid
    if (!hasToken) {
      if (hasCompletedOnboarding) {
        // Show splash if user is not authenticated and onboarding is completed
        const splashTimer = setTimeout(() => {
          setShowSplash(false)
        }, 1500) // Show splash for 1.5 seconds even if onboarding is completed

        return () => clearTimeout(splashTimer)
      } else {
        // Show splash then onboarding for new users
        const splashTimer = setTimeout(() => {
          setShowSplash(false)
          setShowOnboarding(true)
        }, 2000)

        return () => clearTimeout(splashTimer)
      }
    } else {
      // If there's a persisted token, skip splash initially
      setShowSplash(false)
      if (hasCompletedOnboarding) {
        setShowOnboarding(false)
      }
    }

    // Call checkAuth and initTheme
    checkAuth()
    initTheme()
  }, []) // Empty dependency array to run only once on mount

  // Update splash/onboarding state when user authentication status changes
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding')

    if (user) {
      // User is authenticated, hide splash and onboarding
      setShowSplash(false)
      if (hasCompletedOnboarding) {
        setShowOnboarding(false)
      }
    }
  }, [user])

  useEffect(() => {
    if (user) {
      connect(user._id)
    } else {
      disconnect()
    }
    return () => disconnect()
  }, [user])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.className = theme
    document.documentElement.style.setProperty('color-scheme', theme)
  }, [theme])

  // Show splash screen initially
  if (showSplash) {
    return <Splash />
  }

  // Show onboarding flow if not completed
  if (showOnboarding) {
    return <Onboard onComplete={() => {
      localStorage.setItem('hasCompletedOnboarding', 'true')
      setShowOnboarding(false)
    }} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
          <Route path="/auth" element={
            user ? <Navigate to="/" /> : <AuthPage />
          } />

          <Route path="/" element={
            user ? <MainLayout /> : <Navigate to="/auth" />
          }>
            <Route index element={<ChatPage />} />
            <Route path="chats" element={<ChatPage />} />
            <Route path="stories" element={<StoriesPage />} />
            <Route path="channels" element={<ChannelsPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="calls" element={<CallsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile/:userId" element={<ProfilePage />} />
          </Route>

          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

export default App