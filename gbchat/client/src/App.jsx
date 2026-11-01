import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useAuthStore from './store/useAuthStore'
import useThemeStore from './store/useThemeStore'
import useSocket from './hooks/useSocket'
import Loader from './components/common/Loader'
import Splash from './components/common/Splash'
import Onboard from './components/common/Onboard'
import MainLayout from './components/layout/MainLayout'
import ServiceWorkerRegistration from './components/common/ServiceWorkerRegistration'
import InstallPrompt from './components/common/InstallPrompt'
import AppLock from './components/auth/AppLock'
import AppUpdateChecker from './components/common/AppUpdateChecker'
import IncomingCallOverlay from './components/calls/IncomingCallOverlay'
import ScrollToTop from './components/common/ScrollToTop'
import { RoutedErrorBoundary } from './components/common/RouteErrorBoundary'
import ShortcutSheet from './components/common/ShortcutSheet'
import useGlobalShortcuts from './hooks/useGlobalShortcuts'
import { syncPushSubscription } from './lib/push'

// Lazy load pages for better performance
const AuthPage = React.lazy(() => import('./pages/AuthPage'))
const ChatPage = React.lazy(() => import('./pages/ChatPage'))
const StoriesPage = React.lazy(() => import('./pages/StoriesPage'))
const ChannelsPage = React.lazy(() => import('./pages/ChannelsPage'))
const CallsPage = React.lazy(() => import('./pages/CallsPage'))
const GroupsPage = React.lazy(() => import('./pages/GroupsPage'))
const ContactsPage = React.lazy(() => import('./pages/ContactsPage'))
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))
const HomePage = React.lazy(() => import('./pages/HomePage'))
const BackupPage = React.lazy(() => import('./pages/BackupPage'))
const TermsAndConditions = React.lazy(() => import('./pages/legal/TermsAndConditions'))
const PrivacyPolicy = React.lazy(() => import('./pages/legal/PrivacyPolicy'))

/**
 * Legacy `/chat?chatId=<id>` → `/chats?chat=<id>` (the conversation route).
 * Kept forever: notification rows and shared links shipped with the old shape.
 */
function LegacyChatRedirect() {
  const location = useLocation()
  const { chatId: pathChatId } = useParams()
  const params = new URLSearchParams(location.search)
  const chatId = params.get('chatId') || params.get('chat') || pathChatId
  const messageId = params.get('messageId') || params.get('message')

  const next = new URLSearchParams()
  if (chatId) next.set('chat', chatId)
  if (messageId) next.set('message', messageId)

  return <Navigate to={`/chats${next.toString() ? `?${next.toString()}` : ''}`} replace />
}

function App() {
  const { user, isAuthenticated, isLoading, isDemo, checkAuth } = useAuthStore()
  const { theme, initTheme } = useThemeStore()
  const { connect, disconnect } = useSocket()
  useGlobalShortcuts()

  // If this browser already holds a push subscription (returning visitor, or a
  // different account on a shared device) make sure the server has it. Silent:
  // never prompts for permission, so it cannot annoy anyone on load.
  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    const timer = setTimeout(() => {
      if (!cancelled) syncPushSubscription()
    }, 2500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [isAuthenticated])

  // State for onboarding flow
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showAppLock, setShowAppLock] = useState(false)
  const [appLockEnabled, setAppLockEnabled] = useState(false)

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

      // Check if app lock is enabled
      const appLockType = localStorage.getItem('app-lock-type')
      if (appLockType) {
        setAppLockEnabled(true)
        setShowAppLock(true)
      }

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

  // Show app lock when user returns to the app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && appLockEnabled) {
        // Check if lock is set
        const appLockType = localStorage.getItem('app-lock-type')
        if (appLockType) {
          setShowAppLock(true)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [appLockEnabled])

  // Connect socket when user is authenticated (never in offline demo mode)
  useEffect(() => {
    if (user && user._id && !isDemo) {
      console.log('[App] Connecting socket for user:', user._id)
      // Small delay to ensure server is ready
      const timer = setTimeout(() => {
        connect(user._id)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      console.log('[App] Disconnecting socket - no user')
      disconnect()
    }
    return () => disconnect()
  }, [user, isDemo, connect, disconnect])

  // Apply theme to document
  useEffect(() => {
    // applyTheme() owns palette + mode + surfaces for the whole app
    useThemeStore.getState().initTheme()
  }, [theme])

  // Show splash during initialization
  if (!isInitialized || showSplash) {
    return <Splash message={isLoading ? 'Signing you in…' : undefined} />
  }

  // Show onboarding if needed
  if (showOnboarding) {
    return <Onboard onComplete={handleOnboardingComplete} />
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center app-canvas">
        <Loader size="lg" />
      </div>
    )
  }

  // Main app routes
  return (
    <>
      <ServiceWorkerRegistration />
      <InstallPrompt />
      <AppUpdateChecker />

      {/* Global call UI: incoming ring + active call */}
      {isAuthenticated && <IncomingCallOverlay />}

      {/* App Lock Screen */}
      {appLockEnabled && showAppLock && (
        <AppLock
          onUnlock={() => setShowAppLock(false)}
          onClose={() => {
            setAppLockEnabled(false)
            setShowAppLock(false)
          }}
        />
      )}

      <ScrollToTop />
      <ShortcutSheet />

      <AnimatePresence mode="wait">
        <React.Suspense fallback={<Loader fullScreen />}>
          <RoutedErrorBoundary>
            <Routes>
            {/* Public route - redirect to home if already authenticated */}
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
              {/* Deep link: /chats/:chatId opens that conversation */}
              <Route path="chats/:chatId" element={<ChatPage />} />
              <Route path="stories" element={<StoriesPage />} />
              <Route path="channels" element={<ChannelsPage />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="calls" element={<CallsPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="channels/:channelId" element={<ChannelsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              {/* /settings/notifications, /settings/privacy, … deep links */}
              <Route path="settings/:section" element={<SettingsPage />} />
              {/* Own profile: /profile redirects to /profile/me */}
              <Route path="profile" element={<Navigate to="/profile/me" replace />} />
              <Route path="profile/:userId" element={<ProfilePage />} />
              <Route path="backup" element={<BackupPage />} />
              {/* Legacy /chat?chatId=… links (old notifications, bookmarks) */}
              <Route path="chat" element={<LegacyChatRedirect />} />
              <Route path="chat/:chatId" element={<LegacyChatRedirect />} />
            </Route>

            {/* Public marketing / welcome page */}
            <Route path="/welcome" element={<HomePage />} />

            {/* Public legal pages */}
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </RoutedErrorBoundary>
        </React.Suspense>
      </AnimatePresence>
    </>
  )
}

export default App
