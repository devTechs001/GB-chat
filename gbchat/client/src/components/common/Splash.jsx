import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Splash = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    const texts = [
      'Initializing...',
      'Loading themes...',
      'Securing connection...',
      'Almost ready...',
    ];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress(Math.min(step * 28, 100));
      if (step < texts.length) setLoadingText(texts[step]);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center z-50 overflow-hidden">

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-600/20 via-transparent to-transparent" />

      {/* Animated mesh background orbs */}
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

      {/* Spinning ring accent */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full border border-white/[0.03]"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full border border-primary-500/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center relative z-10 flex flex-col items-center"
      >
        {/* Logo with glow ring */}
        <motion.div
          className="mx-auto w-28 h-28 mb-8 relative"
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        >
          {/* Outer glow pulse */}
          <motion.div
            className="absolute -inset-4 rounded-full bg-primary-500/20 blur-2xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Rotating border ring */}
          <motion.div
            className="absolute -inset-1 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(16,185,129,0.5), transparent, rgba(139,92,246,0.3), transparent)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          {/* Inner logo circle */}
          <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-2xl shadow-primary-500/20 border border-white/10">
            <motion.svg
              className="w-14 h-14 text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2"
        >
          <span className="bg-gradient-to-r from-primary-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
            GBChat
          </span>
        </motion.h1>

        {/* Version badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4"
        >
          <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            Pro v2.0
          </span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-white/50 text-sm md:text-base font-light max-w-xs mx-auto px-4 mb-10"
        >
          Privacy-first messaging with advanced features
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '200px' }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="relative"
        >
          <div className="w-[200px] h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 via-emerald-400 to-cyan-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] text-white/30 mt-3 tracking-wide"
            >
              {loadingText}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Bouncing dots (kept from original) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-6 flex justify-center"
        >
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary-400/60 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 text-center z-10"
      >
        <p className="text-white/20 text-[11px] tracking-wider">
          End-to-end encrypted
        </p>
        <p className="text-white/10 text-[10px] mt-1">
          &copy; 2026 GBChat
        </p>
      </motion.div>
    </div>
  );
};

export default Splash;