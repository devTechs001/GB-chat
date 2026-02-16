import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  PaperAirplaneIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'
import useVoiceRecorder from '../../hooks/useVoiceRecorder'
import clsx from 'clsx'

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

  const [isPaused, setIsPaused] = React.useState(false)

  useEffect(() => {
    startRecording()
  }, [])

  const handlePauseResume = () => {
    if (isPaused) {
      resumeRecording()
    } else {
      pauseRecording()
    }
    setIsPaused(!isPaused)
  }

  const handleStop = () => {
    stopRecording()
    if (audioBlob) {
      onStop(audioBlob)
    }
  }

  const handleCancel = () => {
    cancelRecording()
    onCancel()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
          >
            <TrashIcon className="w-6 h-6" />
          </button>

          {/* Waveform */}
          <div className="flex-1 flex items-center gap-1 h-12">
            {waveform.map((value, index) => (
              <motion.div
                key={index}
                className="flex-1 bg-primary-500 rounded-full"
                style={{
                  height: `${Math.max(value * 100, 4)}%`,
                }}
                animate={{
                  height: `${Math.max(value * 100, 4)}%`,
                }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>

          {/* Duration */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-mono text-gray-900 dark:text-white">
              {formatDuration()}
            </span>

            {/* Pause/Resume */}
            <button
              onClick={handlePauseResume}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              {isPaused ? (
                <PlayIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <PauseIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Send Button */}
            <button
              onClick={handleStop}
              className={clsx(
                'p-3 rounded-full transition-colors',
                'bg-primary-600 hover:bg-primary-700 text-white'
              )}
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Recording Indicator */}
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <motion.div
            className="w-2 h-2 bg-red-500 rounded-full"
            animate={{ opacity: isPaused ? 0.3 : [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span>{isPaused ? 'Paused' : 'Recording...'}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default VoiceRecorder