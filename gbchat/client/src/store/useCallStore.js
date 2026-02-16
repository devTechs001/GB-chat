import { create } from 'zustand'
import api from '../lib/api'
import toast from 'react-hot-toast'

const useCallStore = create((set, get) => ({
  callHistory: [],
  activeCall: null,
  incomingCall: null,
  isLoading: false,

  fetchCallHistory: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/calls/history')
      // Handle both array and object responses
      const callsArray = Array.isArray(data) ? data : (data.calls || [])
      set({ callHistory: callsArray, isLoading: false })
    } catch (error) {
      set({ callHistory: [], isLoading: false })
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