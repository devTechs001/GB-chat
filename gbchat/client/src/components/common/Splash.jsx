import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

/**
 * Loading screen.
 * Minimal, brand-first: logo mark, wordmark, determinate progress and a
 * status line. Respects the active theme via CSS variables.
 */
const STEPS = ['Preparing your workspace', 'Loading conversations', 'Securing your session', 'Almost ready']

const Splash = ({ message, progress: controlledProgress }) => {
  const [progress, setProgress] = useState(8)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (controlledProgress !== undefined) return undefined

    const tick = setInterval(() => {
      setProgress((value) => {
        const next = value + Math.random() * 12
        return next >= 96 ? 96 : next
      })
    }, 220)

    return () => clearInterval(tick)
  }, [controlledProgress])

  useEffect(() => {
    const nextStep = Math.min(Math.floor((progress / 100) * STEPS.length), STEPS.length - 1)
    setStep(nextStep)
  }, [progress])

  const value = controlledProgress !== undefined ? controlledProgress : progress

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-gray-950 text-white"
      role="status"
      aria-live="polite"
      aria-label="GBChat is loading"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-emerald-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative flex flex-col items-center px-8 w-full max-w-sm">
        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative mb-7"
        >
          <motion.span
            className="absolute inset-0 rounded-[28px] bg-primary-500/30 blur-xl"
            animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.75, 0.45] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-900/40">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.7}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
              />
            </svg>
          </div>
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-3xl font-bold tracking-tight"
        >
          GB<span className="text-primary-400">Chat</span>
        </motion.h1>
        <p className="mt-1.5 text-sm text-gray-400">Private messaging, done right</p>

        {/* Progress */}
        <div className="mt-10 w-full">
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-400 to-emerald-400"
              animate={{ width: `${value}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span>{message || STEPS[step]}</span>
            <span className="tabular-nums">{Math.round(value)}%</span>
          </div>
        </div>

        {/* Skeleton preview so the wait feels structural */}
        <div className="mt-10 w-full space-y-3" aria-hidden="true">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className={clsx('flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3', row === 2 && 'opacity-60')}
            >
              <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-1/3 rounded-full bg-white/10 animate-pulse" />
                <div className="h-2.5 w-2/3 rounded-full bg-white/[0.07] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Splash
