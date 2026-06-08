import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhoneXMarkIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ComputerDesktopIcon,
  SwitchHorizontalIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ChatBubbleBottomCenterTextIcon,
  UserPlusIcon,
  SignalIcon,
} from '@heroicons/react/24/outline'
import { MicrophoneIcon as MicrophoneSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import usePeerConnection from '../../hooks/usePeerConnection'
import useCallStore from '../../store/useCallStore'
import clsx from 'clsx'

const VideoCall = ({ callData, onEnd, onSwitchToAudio }) => {
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

  const { endCall } = useCallStore()
  const [callDuration, setCallDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [layout, setLayout] = useState('grid')
  const [pinnedParticipant, setPinnedParticipant] = useState(null)
  const [showChat, setShowChat] = useState(false)

  const localVideoRef = useRef(null)
  const remoteVideoRefs = useRef({})
  const controlsTimeoutRef = useRef(null)
  const containerRef = useRef(null)

  const participants = callData.participants || []

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      if (remoteVideoRefs.current[peerId]) {
        remoteVideoRefs.current[peerId].srcObject = stream
      }
    })
  }, [remoteStreams])

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(controlsTimeoutRef.current)
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showChat) setShowControls(false)
      }, 3000)
    }
    containerRef.current?.addEventListener('mousemove', handleMouseMove)
    return () => {
      containerRef.current?.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(controlsTimeoutRef.current)
    }
  }, [showChat])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const handleEndCall = () => {
    endCall(callData._id || callData.id)
    onEnd?.()
  }

  const getConnectionIcon = () => {
    const color = connectionQuality === 'excellent' ? 'text-green-500'
      : connectionQuality === 'good' ? 'text-yellow-500'
      : connectionQuality === 'poor' ? 'text-red-500'
      : 'text-gray-500'
    return <SignalIcon className={`w-4 h-4 ${color}`} />
  }

  const VideoGrid = () => {
    const videoParticipants = [
      { id: 'local', stream: localStream, name: 'You', isLocal: true },
      ...participants.map(p => ({
        id: p.id || p._id,
        stream: remoteStreams[p.id || p._id],
        name: p.name || p.fullName,
        isLocal: false,
      })),
    ].filter(v => !v.isLocal || callData.showLocalVideo !== false)

    const visibleVideos = videoParticipants.filter(v => v.stream)
    const cols = visibleVideos.length <= 1 ? 1 : visibleVideos.length <= 4 ? 2 : 3

    return (
      <div
        className={clsx(
          'grid gap-2 h-full p-2',
          cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3',
          layout === 'speaker' && 'grid-cols-1'
        )}
      >
        {visibleVideos.map((video) => {
          const isPinned = pinnedParticipant === video.id
          return (
            <motion.div
              key={video.id}
              layout
              className={clsx(
                'relative rounded-xl overflow-hidden bg-gray-900 group cursor-pointer',
                isPinned && 'row-span-2 col-span-2 lg:row-span-2 lg:col-span-2',
                !video.stream && 'flex items-center justify-center'
              )}
              onClick={() => setPinnedParticipant(isPinned ? null : video.id)}
            >
              {video.stream ? (
                <video
                  ref={(el) => {
                    if (video.id === 'local') localVideoRef.current = el
                    else remoteVideoRefs.current[video.id] = el
                  }}
                  autoPlay
                  playsInline
                  muted={video.isLocal}
                  className={clsx(
                    'w-full h-full',
                    video.isLocal ? 'object-cover scale-x-[-1]' : 'object-cover'
                  )}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-800">
                  <Avatar
                    src={participants.find(p => (p.id || p._id) === video.id)?.avatar}
                    alt={video.name}
                    size="lg"
                  />
                  <p className="text-white text-sm mt-2">{video.name}</p>
                  <p className="text-white/50 text-xs">Connecting...</p>
                </div>
              )}

              {/* Video overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-xs font-medium">
                      {video.name}
                      {video.isLocal && ' (You)'}
                    </span>
                  </div>
                  {!video.isLocal && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setPinnedParticipant(isPinned ? null : video.id) }}
                      className="p-1 rounded bg-white/20 hover:bg-white/30"
                    >
                      <ArrowsPointingOutIcon className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Muted indicator */}
              {!isAudioEnabled && video.isLocal && (
                <div className="absolute top-2 left-2 p-1.5 bg-red-500/80 rounded-full">
                  <MicrophoneSolidIcon className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
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
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEndCall}
                  className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                >
                  <PhoneXMarkIcon className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-white font-medium text-sm">
                    {callData.isGroup ? callData.groupName : (participants[0]?.name || 'Call')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-xs font-mono">{formatTime(callDuration)}</span>
                    {getConnectionIcon()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLayout(layout === 'grid' ? 'speaker' : 'grid')}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                  title="Toggle layout"
                >
                  <SwitchHorizontalIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleFullscreen}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  {isFullscreen ? (
                    <ArrowsPointingInIcon className="w-4 h-4" />
                  ) : (
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main video area */}
      <div className="flex-1 relative overflow-hidden">
        <VideoGrid />
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
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleAudio}
                className={clsx(
                  'p-3.5 rounded-full transition-all',
                  isAudioEnabled
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                )}
                title={isAudioEnabled ? 'Mute' : 'Unmute'}
              >
                {isAudioEnabled ? (
                  <MicrophoneIcon className="w-5 h-5" />
                ) : (
                  <MicrophoneSolidIcon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={toggleVideo}
                className={clsx(
                  'p-3.5 rounded-full transition-all',
                  isVideoEnabled
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                )}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoEnabled ? (
                  <VideoCameraIcon className="w-5 h-5" />
                ) : (
                  <VideoCameraSlashIcon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={isScreenSharing ? stopScreenShare : shareScreen}
                className={clsx(
                  'p-3.5 rounded-full transition-all',
                  isScreenSharing
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                )}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                <ComputerDesktopIcon className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className={clsx(
                  'p-3.5 rounded-full transition-all',
                  showChat
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                )}
                title="Chat"
              >
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
              </button>

              {callData.isGroup && (
                <button
                  className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  title="Add participant"
                >
                  <UserPlusIcon className="w-5 h-5" />
                </button>
              )}

              {onSwitchToAudio && (
                <button
                  onClick={onSwitchToAudio}
                  className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  title="Switch to audio only"
                >
                  <PhoneXMarkIcon className="w-5 h-5 rotate-90" />
                </button>
              )}

              <button
                onClick={handleEndCall}
                className="p-3.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
                title="End call"
              >
                <PhoneXMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 shadow-xl z-20 flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">In-call Messages</h3>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 rounded hover:bg-white/10 text-white/60"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/40 text-sm">No messages during this call</p>
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Send a message..."
                  className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button className="p-2 bg-primary-500 rounded-lg hover:bg-primary-600">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VideoCall
