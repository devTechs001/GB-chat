import { create } from 'zustand'
import api, { isDemoMode } from '../lib/api'
import useAuthStore from './useAuthStore'
import toast from 'react-hot-toast'

const DEMO_CALL_HISTORY = [
  {
    _id: 'demo-call-1',
    type: 'video',
    status: 'ended',
    direction: 'outgoing',
    duration: 325,
    createdAt: new Date(Date.now() - 3.6e6).toISOString(),
    user: { _id: 'user2', name: 'John Doe', avatar: null },
  },
  {
    _id: 'demo-call-2',
    type: 'audio',
    status: 'missed',
    direction: 'incoming',
    duration: 0,
    createdAt: new Date(Date.now() - 7.2e6).toISOString(),
    user: { _id: 'user3', name: 'Jane Smith', avatar: null },
  },
  {
    _id: 'demo-call-3',
    type: 'audio',
    status: 'ended',
    direction: 'incoming',
    duration: 180,
    createdAt: new Date(Date.now() - 8.64e7).toISOString(),
    user: { _id: 'user4', name: 'Mike Johnson', avatar: null },
  },
]

const otherParty = (call, myId) => {
  if (!call) return null
  const callerId = call.caller?._id || call.caller
  if (String(callerId) !== String(myId)) return call.caller || { _id: callerId }
  const participant = (call.participants || []).find(
    (p) => String(p?.user?._id || p?.user) !== String(myId)
  )
  return participant?.user || null
}

/** Convert a server Call document into the shape the call UI renders */
export const normalizeCall = (call) => {
  const me = useAuthStore.getState().user
  const myId = me?._id || me?.id
  const callerId = call?.caller?._id || call?.caller
  const isOutgoing = String(callerId) === String(myId)
  const peer = otherParty(call, myId)

  return {
    ...call,
    _id: call?._id || call?.callId,
    callId: call?._id || call?.callId,
    type: call?.type || 'audio',
    isCaller: isOutgoing,
    direction: isOutgoing ? 'outgoing' : 'incoming',
    peerId: peer?._id || peer?.id || null,
    user: {
      _id: peer?._id || peer?.id || 'unknown',
      name: peer?.fullName || peer?.name || 'Unknown contact',
      avatar: peer?.avatar || null,
    },
    participants: call?.participants || [],
    startedAt: call?.startedAt,
    status: call?.status || 'initiated',
  }
}

const useCallStore = create((set, get) => ({
  callHistory: [],
  activeCall: null,
  incomingCall: null,
  isLoading: false,
  historyError: null,
  isMockHistory: false,

  fetchCallHistory: async () => {
    set({ isLoading: true, historyError: null })

    if (isDemoMode()) {
      set({ callHistory: DEMO_CALL_HISTORY, isLoading: false, historyError: null })
      return DEMO_CALL_HISTORY
    }

    try {
      const { data } = await api.get('/calls/history')
      const calls = Array.isArray(data?.data) ? data.data : data?.calls || []
      set({
        callHistory: calls.map(normalizeCall),
        isLoading: false,
        isMockHistory: false,
      })
    } catch (error) {
      set({
        callHistory: [],
        isLoading: false,
        isMockHistory: false,
        historyError:
          error?.response?.status === 401
            ? 'Sign in to see your call history'
            : 'Could not load call history',
      })
    }
  },

  /** Start an outgoing call (REST creates the record + rings the peer) */
  initiateCall: async ({ participantId, userId, chatId, type = 'audio', peer }) => {
    const target = participantId || userId
    if (!target) {
      toast.error('Choose someone to call')
      return { success: false }
    }

    try {
      const { data } = await api.post('/calls/initiate', {
        participantId: target,
        chatId,
        type,
      })
      const call = data?.data || data?.call
      const normalized = normalizeCall(call)
      // The REST response is not populated, so prefer the peer we already know
      const knownPeer = peer || {}
      set({
        activeCall: {
          ...normalized,
          isCaller: true,
          status: 'ringing',
          peerId: normalized.peerId || target,
          user: {
            _id: knownPeer._id || normalized.peerId || target,
            name: knownPeer.name || normalized.user?.name || 'Contact',
            avatar: knownPeer.avatar ?? normalized.user?.avatar ?? null,
          },
          participants: [
            {
              user: {
                _id: knownPeer._id || target,
                fullName: knownPeer.name || normalized.user?.name || 'Contact',
                avatar: knownPeer.avatar ?? null,
              },
              status: 'ringing',
            },
          ],
        },
      })
      return { success: true, call: normalized }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not start the call')
      return { success: false, error }
    }
  },

  acceptCall: async (callId) => {
    const incoming = get().incomingCall
    try {
      const { data } = await api.post(`/calls/${callId}/accept`)
      const call = data?.data || data?.call
      set({
        activeCall: {
          ...normalizeCall(call || incoming),
          isCaller: false,
          status: 'ongoing',
        },
        incomingCall: null,
      })
      return { success: true }
    } catch (error) {
      toast.error('Could not accept the call')
      return { success: false, error }
    }
  },

  rejectCall: async (callId, reason = 'declined') => {
    try {
      await api.post(`/calls/${callId}/reject`, { reason })
    } catch {
      /* the record may already be gone */
    }
    set({ incomingCall: null })
    return { success: true }
  },

  endCall: async (callId) => {
    const id = callId || get().activeCall?._id
    set({ activeCall: null, incomingCall: null })
    if (!id) return { success: true }
    try {
      await api.post(`/calls/${id}/end`)
    } catch {
      /* ignore */
    }
    get().fetchCallHistory()
    return { success: true }
  },

  /** Mark the active outgoing call as answered (socket `callAccepted`) */
  markAccepted: (callId) => {
    const active = get().activeCall
    if (!active || (callId && String(active._id) !== String(callId))) return
    set({ activeCall: { ...active, status: 'ongoing', startedAt: new Date().toISOString() } })
  },

  setIncomingCall: (call) => {
    const normalized = call?.user ? call : normalizeCall(call)
    set({ incomingCall: { ...normalized, isCaller: false } })
  },

  clearActiveCall: () => set({ activeCall: null }),

  clearIncomingCall: () => set({ incomingCall: null }),
}))

export default useCallStore
