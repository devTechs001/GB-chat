import { create } from 'zustand'
import api from '../lib/api'
import toast from 'react-hot-toast'

const useStoryStore = create((set, get) => ({
  stories: [],
  myStory: null,
  viewingStory: null,
  isLoading: false,

  fetchStories: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/stories')
      set({ stories: data.stories, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to fetch stories:', error)
    }
  },

  fetchMyStory: async () => {
    try {
      const { data } = await api.get('/stories/my-story')
      set({ myStory: data.story })
    } catch (error) {
      console.error('Failed to fetch my story:', error)
    }
  },

  createStory: async (formData) => {
    try {
      const { data } = await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      set({ myStory: data.story })
      toast.success('Story created successfully')
      return { success: true, story: data.story }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create story')
      return { success: false, error }
    }
  },

  deleteStory: async (storyId) => {
    try {
      await api.delete(`/stories/${storyId}`)
      set((state) => ({
        stories: state.stories.filter((s) => s._id !== storyId),
        myStory: state.myStory?._id === storyId ? null : state.myStory,
      }))
      toast.success('Story deleted')
    } catch (error) {
      toast.error('Failed to delete story')
    }
  },

  viewStory: async (storyId) => {
    try {
      await api.post(`/stories/${storyId}/view`)
      set((state) => ({
        stories: state.stories.map((s) =>
          s._id === storyId ? { ...s, viewed: true } : s
        ),
      }))
    } catch (error) {
      console.error('Failed to mark story as viewed:', error)
    }
  },

  setViewingStory: (story) => {
    set({ viewingStory: story })
  },
}))

export default useStoryStore