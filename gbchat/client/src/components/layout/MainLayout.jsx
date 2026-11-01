import React, { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import SidePanel from './SidePanel'
import BottomNav from './BottomNav'
import useMediaQuery from '../../hooks/useMediaQuery'

/**
 * MainLayout — the single responsive app shell.
 *
 *  lg+  : static sidebar column + content
 *  < lg : slide-over drawer + content + in-flow bottom navigation
 *
 * Child routes get:
 *   openSidebar / closeSidebar / toggleSidebar, isSidebarOpen,
 *   openSidePanel / closeSidePanel / toggleSidePanel, isSidePanelOpen
 */
const MainLayout = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const location = useLocation()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true'
    } catch {
      return false
    }
  })

  const openSidebar = useCallback(() => setIsSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setIsSidebarOpen((v) => !v), [])
  const openSidePanel = useCallback(() => setIsSidePanelOpen(true), [])
  const closeSidePanel = useCallback(() => setIsSidePanelOpen(false), [])
  const toggleSidePanel = useCallback(() => setIsSidePanelOpen((v) => !v), [])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((value) => {
      const next = !value
      try {
        localStorage.setItem('sidebar-collapsed', String(next))
      } catch {
        /* ignore quota errors */
      }
      return next
    })
  }, [])

  // Close transient overlays on navigation
  useEffect(() => {
    setIsSidebarOpen(false)
    setIsSidePanelOpen(false)
  }, [location.pathname])

  // Escape closes the drawer / side panel
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setIsSidebarOpen(false)
      setIsSidePanelOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Never leave the drawer "open" after switching to desktop
  useEffect(() => {
    if (isDesktop) setIsSidebarOpen(false)
  }, [isDesktop])

  const outletContext = {
    openSidebar,
    closeSidebar,
    toggleSidebar,
    isSidebarOpen,
    openSidePanel,
    closeSidePanel,
    toggleSidePanel,
    isSidePanelOpen,
  }

  return (
    <div className="h-full w-full flex bg-gray-100 dark:bg-gray-950 overflow-hidden">
      {/* ---------- Desktop sidebar ---------- */}
      <div className="hidden lg:flex flex-shrink-0 h-full">
        <Sidebar
          variant="desktop"
          collapsed={isCollapsed}
          onToggleCollapse={toggleCollapsed}
        />
      </div>

      {/* ---------- Mobile drawer ---------- */}
      <AnimatePresence>
        {!isDesktop && isSidebarOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
              onClick={closeSidebar}
              aria-hidden="true"
            />
            <motion.div
              key="sidebar-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-0 z-[70] lg:hidden shadow-2xl"
              role="dialog"
              aria-label="Navigation"
            >
              <Sidebar variant="drawer" onClose={closeSidebar} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---------- Content ---------- */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Outlet context={outletContext} />
        </main>

        {/* Bottom navigation lives in the flow, so pages need no padding hacks */}
        <BottomNav />
      </div>

      {/* ---------- Right side panel ---------- */}
      <AnimatePresence>
        {isSidePanelOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed right-0 top-0 bottom-0 z-[70] shadow-2xl"
          >
            <SidePanel isOpen={isSidePanelOpen} onClose={closeSidePanel} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainLayout
