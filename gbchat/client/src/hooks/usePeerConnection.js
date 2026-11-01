import { useState, useEffect, useRef, useCallback } from 'react'
import useSocket from './useSocket'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

/**
 * WebRTC for 1:1 audio/video calls.
 *
 * Signaling contract (server/socket/handlers/callHandler.js):
 *   emit  "webrtc:offer"          { to, offer }
 *   on    "webrtc:offer"          { from, offer }
 *   emit  "webrtc:answer"         { to, answer }
 *   on    "webrtc:answer"         { from, answer }
 *   emit  "webrtc:ice-candidate"  { to, candidate }
 *   on    "webrtc:ice-candidate"  { from, candidate }
 *
 * `callData` accepted shapes:
 *   { _id | callId, type: 'audio'|'video', isCaller?, peerId?, participants: [{_id|id|user}] }
 */
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
]

const TURN_URL = import.meta.env.VITE_TURN_URL
const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME
const TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL

if (TURN_URL) {
  ICE_SERVERS.push({
    urls: TURN_URL,
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  })
}

const RTC_CONFIG = { iceServers: ICE_SERVERS, iceCandidatePoolSize: 2 }

const participantId = (participant) =>
  participant?.user?._id || participant?.user || participant?._id || participant?.id

const usePeerConnection = (callData) => {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({})
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(callData?.type === 'video')
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState('connecting')
  const [mediaError, setMediaError] = useState(null)

  const peerConnections = useRef({})
  const pendingCandidates = useRef({})
  const screenStream = useRef(null)
  const localStreamRef = useRef(null)
  const { socket, emit } = useSocket()
  const currentUser = useAuthStore((state) => state.user)

  const myId = currentUser?._id || currentUser?.id

  /** Every other party in the call */
  const remotePeers = (() => {
    const participants = callData?.participants || []
    const ids = participants
      .map(participantId)
      .filter((id) => id && String(id) !== String(myId))
      .map(String)

    if (ids.length) return [...new Set(ids)]
    if (callData?.peerId) return [String(callData.peerId)]
    if (callData?.peerUserId) return [String(callData.peerUserId)]
    return []
  })()

  const isCaller =
    callData?.isCaller ??
    (callData?.caller
      ? String(callData.caller._id || callData.caller) === String(myId)
      : true)

  const updateConnectionQuality = useCallback((state) => {
    switch (state) {
      case 'connected':
      case 'completed':
        setConnectionQuality('excellent')
        break
      case 'checking':
      case 'new':
        setConnectionQuality('connecting')
        break
      case 'disconnected':
        setConnectionQuality('poor')
        break
      case 'failed':
        setConnectionQuality('failed')
        break
      default:
        break
    }
  }, [])

  const flushCandidates = async (peerId, pc) => {
    const queued = pendingCandidates.current[peerId] || []
    pendingCandidates.current[peerId] = []
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(candidate)
      } catch (error) {
        console.warn('[WebRTC] failed to add queued candidate', error.message)
      }
    }
  }

  const createPeerConnection = useCallback(
    (peerId, stream) => {
      if (peerConnections.current[peerId]) return peerConnections.current[peerId]

      const pc = new RTCPeerConnection(RTC_CONFIG)
      peerConnections.current[peerId] = pc

      stream?.getTracks().forEach((track) => pc.addTrack(track, stream))

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams
        setRemoteStreams((previous) => ({ ...previous, [peerId]: remoteStream }))
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          emit('webrtc:ice-candidate', { to: peerId, candidate: event.candidate })
        }
      }

      pc.oniceconnectionstatechange = () => {
        updateConnectionQuality(pc.iceConnectionState)
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') {
          toast.error('Call connection failed')
        }
      }

      return pc
    },
    [emit, updateConnectionQuality]
  )

  const negotiate = useCallback(
    async (peerId, stream) => {
      const pc = createPeerConnection(peerId, stream)
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: callData?.type === 'video',
        })
        await pc.setLocalDescription(offer)
        emit('webrtc:offer', { to: peerId, offer })
      } catch (error) {
        console.error('[WebRTC] failed to create offer', error)
      }
    },
    [callData?.type, createPeerConnection, emit]
  )

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video:
          callData?.type === 'video'
            ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
            : false,
      })

      localStreamRef.current = stream
      setLocalStream(stream)
      setMediaError(null)

      if (callData?.type === 'video') setIsVideoEnabled(stream.getVideoTracks().length > 0)

      // Only the caller sends the initial offers
      if (isCaller) {
        remotePeers.forEach((peerId) => negotiate(peerId, stream))
      }
    } catch (error) {
      console.error('[WebRTC] media error', error)
      setMediaError(
        error.name === 'NotAllowedError'
          ? 'Camera/microphone permission denied'
          : 'Could not access your camera or microphone'
      )
      toast.error('Could not access your camera or microphone')
    }
  }, [callData?.type, isCaller, negotiate, remotePeers])

  useEffect(() => {
    initializeMedia()
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
      screenStream.current?.getTracks().forEach((track) => track.stop())
      Object.values(peerConnections.current).forEach((pc) => pc.close())
      peerConnections.current = {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callData?._id || callData?.callId])

  /* ---------------- Signaling listeners ---------------- */
  useEffect(() => {
    if (!socket) return undefined

    const onOffer = async ({ from, offer }) => {
      const pc = createPeerConnection(from, localStreamRef.current)
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        await flushCandidates(from, pc)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        emit('webrtc:answer', { to: from, answer })
      } catch (error) {
        console.error('[WebRTC] failed to handle offer', error)
      }
    }

    const onAnswer = async ({ from, answer }) => {
      const pc = peerConnections.current[from]
      if (!pc) return
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
        await flushCandidates(from, pc)
      } catch (error) {
        console.error('[WebRTC] failed to handle answer', error)
      }
    }

    const onCandidate = async ({ from, candidate }) => {
      const pc = peerConnections.current[from]
      const ice = candidate ? new RTCIceCandidate(candidate) : null
      if (!pc || !pc.remoteDescription?.type) {
        pendingCandidates.current[from] = [...(pendingCandidates.current[from] || []), ice].filter(Boolean)
        return
      }
      try {
        await pc.addIceCandidate(ice)
      } catch (error) {
        console.warn('[WebRTC] candidate error', error.message)
      }
    }

    socket.on('webrtc:offer', onOffer)
    socket.on('webrtc:answer', onAnswer)
    socket.on('webrtc:ice-candidate', onCandidate)

    return () => {
      socket.off('webrtc:offer', onOffer)
      socket.off('webrtc:answer', onAnswer)
      socket.off('webrtc:ice-candidate', onCandidate)
    }
  }, [socket, createPeerConnection, emit])

  /* ---------------- Controls ---------------- */
  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current
    const track = stream?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setIsAudioEnabled(track.enabled)
  }, [])

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current
    const track = stream?.getVideoTracks()[0]
    if (!track) {
      toast('Your camera is not available')
      return
    }
    track.enabled = !track.enabled
    setIsVideoEnabled(track.enabled)
  }, [])

  const shareScreen = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      screenStream.current = stream
      setIsScreenSharing(true)

      const screenTrack = stream.getVideoTracks()[0]
      Object.values(peerConnections.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender) sender.replaceTrack(screenTrack)
      })

      screenTrack.onended = () => {
        stream.getTracks().forEach((track) => track.stop())
        screenStream.current = null
        setIsScreenSharing(false)
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0]
        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
          if (sender && cameraTrack) sender.replaceTrack(cameraTrack)
        })
      }
    } catch (error) {
      if (error.name !== 'NotAllowedError') toast.error('Screen share failed')
    }
  }, [])

  const stopScreenShare = useCallback(() => {
    screenStream.current?.getTracks().forEach((track) => track.stop())
    screenStream.current = null
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0]
    Object.values(peerConnections.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
      if (sender && cameraTrack) sender.replaceTrack(cameraTrack)
    })
    setIsScreenSharing(false)
  }, [])

  return {
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    connectionQuality,
    mediaError,
    remotePeers,
    toggleAudio,
    toggleVideo,
    shareScreen,
    stopScreenShare,
  }
}

export default usePeerConnection
