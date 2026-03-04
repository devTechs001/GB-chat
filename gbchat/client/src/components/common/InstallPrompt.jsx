import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowDownTrayIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { useInstallPWA } from '../../hooks/useInstallPWA';
import clsx from 'clsx';

const InstallPrompt = () => {
  const { isInstallable, isInstalled, install, dismiss } = useInstallPWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Don't show if already installed
    if (isInstalled) return;

    // Show prompt after delay if installable
    if (isInstallable && !isIOS) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }

    // For iOS, show custom instructions
    if (isIOS && !isInstalled) {
      const hasSeenIOSPrompt = localStorage.getItem('ios-install-prompt-seen');
      if (!hasSeenIOSPrompt) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
          localStorage.setItem('ios-install-prompt-seen', 'true');
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isInstallable, isInstalled, isIOS]);

  const handleInstall = async () => {
    const result = await install();
    if (result.success) {
      setShowPrompt(false);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    dismiss();
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <div className={clsx(
          'rounded-2xl shadow-2xl overflow-hidden',
          'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
          'border border-gray-200 dark:border-gray-700'
        )}>
          {/* Header with gradient */}
          <div className="relative h-2 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" />
          
          <div className="p-4">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon className="w-4 h-4 text-gray-500" />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-3 shadow-lg shadow-primary-500/30">
              <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Install GBChat
            </h3>

            {/* Description */}
            {isIOS ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  To install GBChat on your iPhone:
                </p>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">1</span>
                    Tap the <strong>Share</strong> button
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                    </svg>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">2</span>
                    Select <strong>"Add to Home Screen"</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">3</span>
                    Tap <strong>"Add"</strong>
                  </li>
                </ol>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Install GBChat for a better experience with offline support and push notifications.
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Install Now
                </button>
              )}
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors"
              >
                {isIOS ? 'Got it' : 'Later'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
