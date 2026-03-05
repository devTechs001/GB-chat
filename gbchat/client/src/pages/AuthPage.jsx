import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import ForgotPassword from '../components/auth/ForgotPassword'
import clsx from 'clsx'

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login')

  const features = [
    { icon: '🔒', title: 'End-to-End Encryption', desc: 'Your messages are secure' },
    { icon: '🎨', title: 'Custom Avatars', desc: 'Create unique profile pictures' },
    { icon: '⏰', title: 'Schedule Messages', desc: 'Send messages at the perfect time' },
    { icon: '📱', title: 'Cross-Platform', desc: 'Access from any device' },
    { icon: '🌙', title: 'Dark Mode', desc: 'Easy on the eyes' },
    { icon: '✨', title: 'Photo Editor', desc: 'Edit your profile pictures' },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel - Enhanced Branding with Splash-like effects */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8 lg:p-12 relative overflow-hidden">
        {/* Animated mesh background orbs - similar to Splash */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 120 + 30}px`,
                height: `${Math.random() * 120 + 30}px`,
                background: i % 3 === 0
                  ? 'rgba(16,185,129,0.08)'
                  : i % 3 === 1
                    ? 'rgba(139,92,246,0.06)'
                    : 'rgba(6,182,212,0.05)',
                filter: 'blur(40px)',
              }}
              animate={{
                x: [0, Math.random() * 80 - 40],
                y: [0, Math.random() * 80 - 40],
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: Math.random() * 8 + 6,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Spinning ring accents - similar to Splash */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full border border-white/[0.03] -left-20 -top-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full border border-primary-500/10 -left-10 -top-10"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        <div className="flex flex-col justify-between text-white relative z-10">
          <div>
            {/* Logo with glow effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-8"
            >
              <motion.div
                className="w-16 h-16 relative"
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.04, 1] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              >
                {/* Outer glow pulse */}
                <motion.div
                  className="absolute -inset-2 rounded-full bg-primary-500/20 blur-xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Inner logo circle */}
                <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-2xl shadow-primary-500/20 border border-white/10">
                  <motion.svg
                    className="w-10 h-10 text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </motion.svg>
                </div>
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                  GBChat
                </h1>
                <p className="text-sm text-gray-400">Ultimate Messaging Platform</p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl opacity-90 mb-8 text-gray-300"
            >
              Join the future of messaging
            </motion.p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <motion.span
                  className="text-3xl group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                >
                  {feature.icon}
                </motion.span>
                <div>
                  <h3 className="font-semibold text-lg text-white">{feature.title}</h3>
                  <p className="text-sm opacity-70 text-gray-300">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-sm opacity-70">
            <div className="flex flex-wrap gap-3 mb-2">
              <a href="/terms" className="hover:underline text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                Terms
              </a>
              <a href="/privacy" className="hover:underline text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                Privacy
              </a>
            </div>
            <p className="text-gray-500">© 2026 GBChat. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-gray-900 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo - Enhanced */}
          <div className="lg:hidden text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block mb-4"
            >
              <motion.div
                className="w-20 h-20 relative mx-auto"
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.04, 1] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              >
                <motion.div
                  className="absolute -inset-3 rounded-full bg-primary-500/20 blur-xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-2xl shadow-primary-500/20 border border-white/10">
                  <svg
                    className="w-12 h-12 text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </motion.div>
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
              GBChat
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Ultimate Messaging Platform</p>
          </div>

          {/* Tab Switcher - Enhanced */}
          {activeTab !== 'forgot' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {['login', 'register'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300',
                    activeTab === tab
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {tab === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </motion.div>
          )}

          {/* Forms */}
          <AnimatePresence mode="wait">
            {activeTab === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm onForgotPassword={() => setActiveTab('forgot')} />
              </motion.div>
            )}

            {activeTab === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RegisterForm />
              </motion.div>
            )}

            {activeTab === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ForgotPassword onBack={() => setActiveTab('login')} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Features - Enhanced */}
          <div className="lg:hidden mt-12 grid grid-cols-3 gap-4">
            {features.slice(0, 3).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl"
              >
                <span className="text-2xl block mb-1">{feature.icon}</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.title}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage