import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  PaperAirplaneIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline'
import useVoiceRecorder from '../../hooks/useVoiceRecorder'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const VoiceRecorder = ({ onStop, onCancel }) => {
  const {
    isRecording,
    duration,
    audioBlob,
    audioURL,
    waveform,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    formatDuration,
  } = useVoiceRecorder()

  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    startRecording()
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  useEffect(() => {
    if (audioURL && audioRef.current) {
      audioRef.current.src = audioURL
      audioRef.current.load()
    }
  }, [audioURL])

  const handlePauseResume = () => {
    if (isPaused) {
      resumeRecording()
      toast.success('Recording resumed')
    } else {
      pauseRecording()
      toast.success('Recording paused')
    }
    setIsPaused(!isPaused)
  }

  const handleStop = () => {
    stopRecording()
    if (audioBlob) {
      onStop(audioBlob)
      toast.success('Voice message ready to send')
    }
  }

  const handleCancel = () => {
    cancelRecording()
    onCancel()
    toast.success('Voice message cancelled')
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
      toast.success(isMuted ? 'Unmuted' : 'Muted')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-white via-white/95 to-white/90 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900/90 border-t border-gray-200 dark:border-gray-700 p-4 pb-8 shadow-2xl"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header with timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={clsx(
              'w-3 h-3 rounded-full',
              isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
            )} />
            <span className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
              {formatDuration()}
            </span>
          </div>
          <span className={clsx(
            'text-sm font-medium px-3 py-1 rounded-full',
            isPaused
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          )}>
            {isPaused ? 'Paused' : 'Recording'}
          </span>
        </div>

        {/* Waveform visualization */}
        <div className="relative h-24 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden mb-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-0.5 h-full px-4">
            {waveform.map((value, index) => (
              <motion.div
                key={index}
                className="flex-1 bg-gradient-to-t from-primary-600 to-primary-400 rounded-full"
                style={{
                  height: `${Math.max(value * 80, 8)}%`,
                  minHeight: '8px',
                }}
                animate={{
                  height: isPaused
                    ? `${Math.max(value * 40, 8)}%`
                    : `${Math.max(value * 80 + Math.random() * 20, 8)}%`,
                }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>
          {audioURL && <audio ref={audioRef} className="hidden" />}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Cancel */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCancel}
            className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            title="Cancel recording"
          >
            <TrashIcon className="w-6 h-6" />
          </motion.button>

          {/* Mute (during playback) */}
          {audioURL && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMute}
              className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-6 h-6" />
              ) : (
                <SpeakerWaveIcon className="w-6 h-6" />
              )}
            </motion.button>
          )}

          {/* Pause/Resume or Play */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={audioURL ? handlePlayPause : handlePauseResume}
            className={clsx(
              'p-5 rounded-full transition-colors shadow-lg',
              audioURL
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : isPaused
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            )}
            title={audioURL ? (isPlaying ? 'Pause' : 'Play') : (isPaused ? 'Resume' : 'Pause')}
          >
            {audioURL ? (
              isPlaying ? (
                <PauseIcon className="w-7 h-7" />
              ) : (
                <PlayIcon className="w-7 h-7" />
              )
            ) : isPaused ? (
              <PlayIcon className="w-7 h-7" />
            ) : (
              <PauseIcon className="w-7 h-7" />
            )}
          </motion.button>

          {/* Send */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleStop}
            className="p-5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-full transition-colors shadow-lg shadow-primary-500/30"
            title="Send voice message"
          >
            <PaperAirplaneIcon className="w-7 h-7" />
          </motion.button>
        </div>

        {/* Helper text */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          {audioURL
            ? 'Preview your voice message before sending'
            : isPaused
            ? 'Tap resume to continue recording'
            : 'Tap pause to temporarily stop recording'}
        </p>
      </div>
    </motion.div>
  )
}

export default VoiceRecorder