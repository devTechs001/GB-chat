import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhoneXMarkIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  UserPlusIcon,
  ComputerDesktopIcon,
  ChatBubbleBottomCenterTextIcon,
  EllipsisHorizontalIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SignalIcon,
} from '@heroicons/react/24/outline'
import { MicrophoneIcon as MicrophoneSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import useCallStore from '../../store/useCallStore'
import usePeerConnection from '../../hooks/usePeerConnection'
import clsx from 'clsx'
import { formatDuration } from '../../lib/formatters'

const CallInterface = ({ callData, onEnd }) => {
  const {
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    shareScreen,
    stopScreenShare,
    isScreenSharing,
    connectionQuality,
  } = usePeerConnection(callData)

  const [callDuration, setCallDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState(null)
  const [showControls, setShowControls] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [pinnedVideo, setPinnedVideo] = useState(null)
  const [layout, setLayout] = useState('grid') // grid, speaker, sidebar

  const localVideoRef = useRef(null)
  const remoteVideoRefs = useRef({})
  const controlsTimeoutRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    // Setup local video
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }

    // Start call duration timer
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [localStream])

  useEffect(() => {
    // Setup remote videos
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      if (remoteVideoRefs.current[peerId]) {
        remoteVideoRefs.current[peerId].srcObject = stream
      }
    })
  }, [remoteStreams])

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(controlsTimeoutRef.current)
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showChat) {
          setShowControls(false)
        }
      }, 3000)
    }

    if (callData.type === 'video') {
      containerRef.current?.addEventListener('mousemove', handleMouseMove)
      return () => {
        containerRef.current?.removeEventListener('mousemove', handleMouseMove)
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [callData.type, showChat])

  const handleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const handlePinVideo = (videoId) => {
    setPinnedVideo(pinnedVideo === videoId ? null : videoId)
  }

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <SignalIcon className="w-5 h-5 text-green-500" />
      case 'good':
        return <SignalIcon className="w-5 h-5 text-yellow-500" />
      case 'poor':
        return <SignalIcon className="w-5 h-5 text-red-500" />
      default:
        return <SignalIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const VideoGrid = () => {
    const videos = [
      { id: 'local', stream: localStream, user: callData.currentUser },
      ...Object.entries(remoteStreams).map(([id, stream]) => ({
        id,
        stream,
        user: callData.participants.find(p => p.id === id),
      })),
    ]

    const gridCols = videos.length <= 2 ? 1 : videos.length <= 4 ? 2 : 3

    return (
      <div
        className={clsx(
          'grid gap-2 h-full p-4',
          `grid-cols-${Math.min(gridCols, 3)}`,
          layout === 'sidebar' && 'lg:grid-cols-1'
        )}
      >
        {videos.map((video) => (
          <motion.div
            key={video.id}
            layoutId={video.id}
            className={clsx(
              'relative rounded-lg overflow-hidden bg-gray-900',
              pinnedVideo === video.id && 'col-span-full row-span-2',
              'group'
            )}
            onClick={() => handlePinVideo(video.id)}
          >
            <video
              ref={(el) => {
                if (video.id === 'local') {
                  localVideoRef.current = el
                } else {
                  remoteVideoRefs.current[video.id] = el
                }
              }}
              autoPlay
              playsInline
              muted={video.id === 'local'}
              className="w-full h-full object-cover"
            />
            
            {/* Video overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">
                    {video.user?.name || 'Unknown'}
                    {video.id === 'local' && ' (You)'}
                  </span>
                  {video.user?.isMuted && (
                    <MicrophoneIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePinVideo(video.id)
                  }}
                  className="p-1 rounded bg-white/20 hover:bg-white/30"
                >
                  <ArrowsPointingOutIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  const AudioCallView = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center">
        <Avatar
          src={callData.participants[0]?.avatar}
          alt={callData.participants[0]?.name}
          size="xl"
          className="mx-auto mb-6 ring-4 ring-white/20"
        />
        <h2 className="text-2xl font-semibold text-white mb-2">
          {callData.participants[0]?.name}
        </h2>
        <p className="text-gray-300">
          {formatDuration(callDuration)}
        </p>
        
        {/* Audio visualizer */}
        <div className="flex items-center justify-center gap-1 mt-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-white/60 rounded-full"
              animate={{
                height: [20, 40, 20],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Header */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-white font-medium">
                  {callData.isGroup ? callData.groupName : callData.participants[0]?.name}
                </h3>
                <span className="text-white/70 text-sm">
                  {formatDuration(callDuration)}
                </span>
                {getConnectionIcon()}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLayout(layout === 'grid' ? 'speaker' : 'grid')}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  <ComputerDesktopIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleFullscreen}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  {isFullscreen ? (
                    <ArrowsPointingInIcon className="w-5 h-5" />
                  ) : (
                    <ArrowsPointingOutIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 relative">
        {callData.type === 'video' ? <VideoGrid /> : <AudioCallView />}
      </div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4"
          >
            <div className="flex items-center justify-center gap-3">
              {/* Microphone */}
              <button
                onClick={toggleAudio}
                className={clsx(
                  'p-4 rounded-full transition-all',
                  isAudioEnabled
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                )}
              >
                {isAudioEnabled ? (
                  <MicrophoneIcon className="w-6 h-6" />
                ) : (
                  <MicrophoneSolidIcon className="w-6 h-6" />
                )}
              </button>

              {/* Video */}
              {callData.type === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={clsx(
                    'p-4 rounded-full transition-all',
                    isVideoEnabled
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  )}
                >
                  {isVideoEnabled ? (
                    <VideoCameraIcon className="w-6 h-6" />
                  ) : (
                    <VideoCameraSlashIcon className="w-6 h-6" />
                  )}
                </button>
              )}

              {/* Screen share */}
              <button
                onClick={isScreenSharing ? stopScreenShare : shareScreen}
                className={clsx(
                  'p-4 rounded-full transition-all',
                  isScreenSharing
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                )}
              >
                <ComputerDesktopIcon className="w-6 h-6" />
              </button>

              {/* Chat */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={clsx(
                  'p-4 rounded-full transition-all',
                  showChat
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                )}
              >
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6" />
              </button>

              {/* Add participant */}
              {callData.isGroup && (
                <button
                  onClick={() => {/* Handle add participant */}}
                  className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <UserPlusIcon className="w-6 h-6" />
                </button>
              )}

              {/* More options */}
              <button
                onClick={() => {/* Handle more options */}}
                className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <EllipsisHorizontalIcon className="w-6 h-6" />
              </button>

              {/* End call */}
              <button
                onClick={onEnd}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white ml-4"
              >
                <PhoneXMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: 350, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 350, opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-xl z-20"
          >
            {/* Chat content would go here */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold">In-call Messages</h3>
            </div>
            <div className="flex-1 p-4">
              <p className="text-gray-500 text-center">No messages yet</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CallInterface