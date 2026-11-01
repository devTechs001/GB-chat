import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  PhoneIcon,
  PhoneXMarkIcon,
  VideoCameraIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline'
import { PhoneIcon as PhoneSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import useCallStore from '../../store/useCallStore'
import CallInterface from './CallInterface'

/**
 * Global incoming-call UI.
 * Renders the ringing card and, once accepted, the live CallInterface.
 */
const IncomingCallOverlay = () => {
  const { incomingCall, activeCall, acceptCall, rejectCall, endCall } = useCallStore()
  const ringtoneRef = useRef(null)

  useEffect(() => {
    if (!incomingCall) {
      ringtoneRef.current?.pause?.()
      return undefined
    }
    try {
      const audio = new Audio('/ringtone.mp3')
      audio.loop = true
      audio.volume = 0.35
      audio.play().catch(() => {})
      ringtoneRef.current = audio
    } catch {
      /* ringtone is optional */
    }
    return () => {
      ringtoneRef.current?.pause?.()
      ringtoneRef.current = null
    }
  }, [incomingCall])

  const caller = incomingCall?.caller || incomingCall?.user || {}
  const callerName = caller.fullName || caller.name || 'Unknown caller'
  const isVideo = (incomingCall?.type || 'audio') === 'video'

  return (
    <>
      <AnimatePresence>
        {incomingCall && !activeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Incoming ${isVideo ? 'video' : 'voice'} call from ${callerName}`}
          >
            <motion.div
              initial={{ y: 40, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.96 }}
              className="w-full max-w-sm rounded-3xl bg-gray-900 text-white p-6 shadow-2xl"
            >
              <p className="text-center text-xs uppercase tracking-widest text-white/60">
                Incoming {isVideo ? 'video' : 'voice'} call
              </p>

              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="relative">
                  <motion.span
                    className="absolute inset-0 rounded-full bg-primary-500/30"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.15, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <Avatar src={caller.avatar} alt={callerName} size="xl" className="relative" />
                </div>
                <p className="text-xl font-semibold text-center">{callerName}</p>
                <p className="text-sm text-white/60">GBChat {isVideo ? 'video' : 'voice'} call</p>
              </div>

              <div className="mt-8 flex items-center justify-center gap-10">
                <button
                  onClick={() => rejectCall(incomingCall._id)}
                  className="flex flex-col items-center gap-2"
                  aria-label="Decline call"
                >
                  <span className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                    <PhoneXMarkIcon className="w-6 h-6" />
                  </span>
                  <span className="text-xs text-white/70">Decline</span>
                </button>

                <button
                  onClick={() => acceptCall(incomingCall._id)}
                  className="flex flex-col items-center gap-2"
                  aria-label="Accept call"
                >
                  <motion.span
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
                  >
                    {isVideo ? (
                      <VideoCameraIcon className="w-6 h-6" />
                    ) : (
                      <PhoneSolidIcon className="w-6 h-6" />
                    )}
                  </motion.span>
                  <span className="text-xs text-white/70">Accept</span>
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/40">
                <MicrophoneIcon className="w-3.5 h-3.5" />
                Your microphone stays off until you accept
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeCall && (
        <CallInterface
          callData={activeCall}
          onEnd={() => endCall(activeCall._id)}
        />
      )}
    </>
  )
}

export default IncomingCallOverlay
