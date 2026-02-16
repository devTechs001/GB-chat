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
    { icon: '🎨', title: 'Custom Themes', desc: 'Personalize your chat experience' },
    { icon: '⏰', title: 'Schedule Messages', desc: 'Send messages at the perfect time' },
    { icon: '📱', title: 'Cross-Platform', desc: 'Access from any device' },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 to-primary-800 p-8 lg:p-12">
        <div className="flex flex-col justify-between text-white">
          <div>
            <h1 className="text-4xl font-bold mb-2">GBChat</h1>
            <p className="text-xl opacity-90">Ultimate Messaging Platform</p>
          </div>
          
          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm opacity-80">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-sm opacity-70">
            <div className="flex flex-wrap gap-3 mb-2">
              <a href="/terms" className="hover:underline" target="_blank" rel="noopener noreferrer">
                Terms
              </a>
              <a href="/privacy" className="hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy
              </a>
            </div>
            © 2024 GBChat. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-dark-bg">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">GBChat</h1>
            <p className="text-gray-600 dark:text-gray-400">Ultimate Messaging Platform</p>
          </div>

          {/* Tab Switcher */}
          {activeTab !== 'forgot' && (
            <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {['login', 'register'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'flex-1 py-2 px-4 rounded-md font-medium transition-all',
                    activeTab === tab
                      ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  )}
                >
                  {tab === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>
          )}

          {/* Forms */}
          <AnimatePresence mode="wait">
            {activeTab === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
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
              >
                <ForgotPassword onBack={() => setActiveTab('login')} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Features - Shown at bottom */}
          <div className="lg:hidden mt-12 grid grid-cols-2 gap-4">
            {features.slice(0, 2).map((feature, index) => (
              <div key={index} className="text-center">
                <span className="text-2xl">{feature.icon}</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {feature.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage