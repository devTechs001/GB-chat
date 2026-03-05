import { create } from 'zustand'
import api from '../lib/api'
import toast from 'react-hot-toast'

// Sample call history for demo
const sampleCallHistory = [
  {
    _id: 'call1',
    user: { _id: 'u1', name: 'John Doe', avatar: null },
    type: 'video',
    status: 'completed',
    direction: 'outgoing',
    duration: 325,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: 'call2',
    user: { _id: 'u2', name: 'Jane Smith', avatar: null },
    type: 'audio',
    status: 'missed',
    direction: 'incoming',
    duration: 0,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    _id: 'call3',
    user: { _id: 'u3', name: 'Mike Johnson', avatar: null },
    type: 'audio',
    status: 'completed',
    direction: 'incoming',
    duration: 180,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'call4',
    user: { _id: 'u4', name: 'Sarah Wilson', avatar: null },
    type: 'video',
    status: 'completed',
    direction: 'outgoing',
    duration: 542,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    _id: 'call5',
    user: { _id: 'u5', name: 'Alex Chen', avatar: null },
    type: 'audio',
    status: 'rejected',
    direction: 'outgoing',
    duration: 0,
    createdAt: new Date(Date.now() - 259200000).toISOString()
  }
]

const useCallStore = create((set, get) => ({
  callHistory: [],
  activeCall: null,
  incomingCall: null,
  isLoading: false,

  fetchCallHistory: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/calls/history')
      const callsArray = Array.isArray(data) ? data : (data.calls || [])
      set({ callHistory: callsArray.length > 0 ? callsArray : sampleCallHistory, isLoading: false })
    } catch (error) {
      set({ callHistory: sampleCallHistory, isLoading: false })
      console.error('Failed to fetch call history:', error)
    }
  },

  initiateCall: async (callData) => {
    try {
      const { data } = await api.post('/calls/initiate', callData)
      set({ activeCall: data.call })
      return { success: true, call: data.call }
    } catch (error) {
      toast.error('Failed to initiate call')
      return { success: false, error }
    }
  },

  acceptCall: async (callId) => {
    try {
      const { data } = await api.post(`/calls/${callId}/accept`)
      set({ activeCall: data.call, incomingCall: null })
      return { success: true }
    } catch (error) {
      toast.error('Failed to accept call')
      return { success: false }
    }
  },

  rejectCall: async (callId) => {
    try {
      await api.post(`/calls/${callId}/reject`)
      set({ incomingCall: null })
      return { success: true }
    } catch (error) {
      toast.error('Failed to reject call')
      return { success: false }
    }
  },

  endCall: async (callId) => {
    try {
      await api.post(`/calls/${callId}/end`)
      set({ activeCall: null })
      return { success: true }
    } catch (error) {
      toast.error('Failed to end call')
      return { success: false }
    }
  },

  setIncomingCall: (call) => {
    set({ incomingCall: call })
  },

  clearActiveCall: () => {
    set({ activeCall: null })
  },
}))

export default useCallStore