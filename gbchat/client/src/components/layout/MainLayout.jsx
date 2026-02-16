import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import SidePanel from './SidePanel'
import { motion } from 'framer-motion'

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed lg:relative h-full z-20 lg:z-auto"
      >
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        <Outlet context={{ 
          toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
          toggleSidePanel: () => setIsSidePanelOpen(!isSidePanelOpen)
        }} />
      </div>

      {/* Side Panel */}
      <motion.div
        initial={{ x: 350 }}
        animate={{ x: isSidePanelOpen ? 0 : 350 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed right-0 h-full z-20"
      >
        <SidePanel 
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
        />
      </motion.div>

      {/* Mobile Overlay */}
      {(isSidebarOpen || isSidePanelOpen) && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => {
            setIsSidebarOpen(false)
            setIsSidePanelOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default MainLayout