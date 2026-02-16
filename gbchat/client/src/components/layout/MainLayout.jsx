import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import SidePanel from './SidePanel'
import BottomNav from './BottomNav'
import { motion, AnimatePresence } from 'framer-motion'
import useMediaQuery from '../../hooks/useMediaQuery'

const MainLayout = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden">
      {/* Sidebar - Desktop always visible, mobile drawer */}
      {isDesktop ? (
        <div className="hidden lg:block relative h-full">
          <Sidebar isOpen={true} onClose={() => {}} />
        </div>
      ) : (
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-40"
            >
              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative pb-16 lg:pb-0">
        <Outlet context={{
          toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
          toggleSidePanel: () => setIsSidePanelOpen(!isSidePanelOpen),
          isSidebarOpen,
          isSidePanelOpen
        }} />
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {isSidePanelOpen && (
          <motion.div
            initial={{ x: 350 }}
            animate={{ x: 0 }}
            exit={{ x: 350 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 z-40"
          >
            <SidePanel
              isOpen={isSidePanelOpen}
              onClose={() => setIsSidePanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default MainLayout