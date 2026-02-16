import { useState, useEffect, useRef, useCallback } from 'react'
import useSocket from './useSocket'

const usePeerConnection = (callData) => {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({})
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(callData.type === 'video')
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState('good')

  const peerConnections = useRef({})
  const screenStream = useRef(null)
  const { socket, emit } = useSocket()

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  }

  useEffect(() => {
    initializeMedia()
    return () => cleanup()
  }, [])

  const initializeMedia = async () => {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: callData.type === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setLocalStream(stream)

      // Setup peer connections for each participant
      callData.participants.forEach((participant) => {
        createPeerConnection(participant.id, stream)
      })
    } catch (error) {
      console.error('Failed to get media:', error)
    }
  }

  const createPeerConnection = (peerId, stream) => {
    const pc = new RTCPeerConnection(configuration)
    peerConnections.current[peerId] = pc

    // Add local stream tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream)
    })

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [peerId]: event.streams[0],
      }))
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emit('ice-candidate', {
          peerId,
          candidate: event.candidate,
        })
      }
    }

    // Monitor connection quality
    pc.oniceconnectionstatechange = () => {
      updateConnectionQuality(pc.iceConnectionState)
    }

    return pc
  }

  const updateConnectionQuality = (state) => {
    switch (state) {
      case 'connected':
      case 'completed':
        setConnectionQuality('excellent')
        break
      case 'checking':
        setConnectionQuality('good')
        break
      case 'disconnected':
        setConnectionQuality('poor')
        break
      case 'failed':
        setConnectionQuality('failed')
        break
    }
  }

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }, [localStream])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }, [localStream])

  const shareScreen = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      })

      screenStream.current = stream
      setIsScreenSharing(true)

      // Replace video track in all peer connections
      const screenTrack = stream.getVideoTracks()[0]
      Object.values(peerConnections.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender) {
          sender.replaceTrack(screenTrack)
        }
      })

      // Handle screen share end
      screenTrack.onended = () => {
        stopScreenShare()
      }
    } catch (error) {
      console.error('Failed to share screen:', error)
    }
  }, [])

  const stopScreenShare = useCallback(() => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((track) => track.stop())
      screenStream.current = null
    }

    // Replace with camera track
    if (localStream) {
      const cameraTrack = localStream.getVideoTracks()[0]
      Object.values(peerConnections.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender) {
          sender.replaceTrack(cameraTrack)
        }
      })
    }

    setIsScreenSharing(false)
  }, [localStream])

  const cleanup = () => {
    // Stop all tracks
    localStream?.getTracks().forEach((track) => track.stop())
    screenStream.current?.getTracks().forEach((track) => track.stop())

    // Close all peer connections
    Object.values(peerConnections.current).forEach((pc) => pc.close())
    peerConnections.current = {}
  }

  return {
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    connectionQuality,
    toggleAudio,
    toggleVideo,
    shareScreen,
    stopScreenShare,
  }
}

export default usePeerConnection