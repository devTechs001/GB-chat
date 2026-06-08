import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhoneXMarkIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  VideoCameraIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { MicrophoneIcon as MicrophoneSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import usePeerConnection from '../../hooks/usePeerConnection'
import useCallStore from '../../store/useCallStore'
import clsx from 'clsx'

const AudioCall = ({ callData, onEnd }) => {
  const {
    localStream,
    isAudioEnabled,
    toggleAudio,
    connectionQuality,
  } = usePeerConnection(callData)

  const { endCall } = useCallStore()
  const [callDuration, setCallDuration] = useState(0)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const timerRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (localStream) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(localStream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 64
      source.connect(analyserRef.current)
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)
    }
    return () => {
      audioContextRef.current?.close()
    }
  }, [localStream])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    endCall(callData._id || callData.id)
    onEnd?.()
  }

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-3 bg-gray-900/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/10 cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <div className="relative">
          <Avatar
            src={callData.participants?.[0]?.avatar}
            alt={callData.participants?.[0]?.name || 'Call'}
            size="sm"
          />
          <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${getQualityColor()} ring-2 ring-gray-900`} />
        </div>
        <div className="text-white text-xs">
          <p className="font-medium">{callData.participants?.[0]?.name || 'Call'}</p>
          <p className="text-white/60">{formatTime(callDuration)}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleEndCall() }}
          className="p-2 bg-red-500 rounded-full hover:bg-red-600"
        >
          <PhoneXMarkIcon className="w-4 h-4 text-white" />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      <div className="relative w-full max-w-md mx-4">
        {/* Minimize button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
        >
          <ChevronDownIcon className="w-5 h-5" />
        </button>

        {/* Caller info */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <Avatar
              src={callData.participants?.[0]?.avatar}
              alt={callData.participants?.[0]?.name || 'Unknown'}
              size="xl"
              className="ring-4 ring-white/20 shadow-2xl"
            />
            <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ${getQualityColor()} ring-2 ring-gray-900`} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {callData.participants?.[0]?.name || 'Unknown'}
          </h2>
          <p className="text-xl text-white/60 tabular-nums font-mono">
            {formatTime(callDuration)}
          </p>
          {callData.isGroup && (
            <p className="text-sm text-white/40 mt-1">
              Group call · {callData.participants?.length || 0} participants
            </p>
          )}
        </div>

        {/* Audio visualizer */}
        <div className="flex items-center justify-center gap-1.5 mb-16 h-16">
          {Array.from({ length: 32 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-gradient-to-t from-primary-500 to-primary-300 rounded-full"
              animate={{
                height: [8, 32 + Math.sin(i * 0.5) * 20, 8],
              }}
              transition={{
                duration: 0.8 + Math.random() * 0.4,
                repeat: Infinity,
                delay: i * 0.05,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Call controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={toggleAudio}
            className={clsx(
              'p-5 rounded-full transition-all shadow-lg',
              isAudioEnabled
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white scale-110'
            )}
          >
            {isAudioEnabled ? (
              <MicrophoneIcon className="w-7 h-7" />
            ) : (
              <MicrophoneSolidIcon className="w-7 h-7" />
            )}
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={clsx(
              'p-5 rounded-full transition-all shadow-lg',
              isSpeakerOn
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            )}
          >
            {isSpeakerOn ? (
              <SpeakerWaveIcon className="w-7 h-7" />
            ) : (
              <SpeakerXMarkIcon className="w-7 h-7" />
            )}
          </button>

          {callData.switchToVideo && (
            <button
              onClick={callData.switchToVideo}
              className="p-5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shadow-lg"
            >
              <VideoCameraIcon className="w-7 h-7" />
            </button>
          )}

          <button
            onClick={handleEndCall}
            className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
          >
            <PhoneXMarkIcon className="w-7 h-7" />
          </button>
        </div>

        {/* Connection quality indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className={`w-2 h-2 rounded-full ${getQualityColor()}`} />
          <span className="text-xs text-white/40 capitalize">
            {connectionQuality}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default AudioCall
