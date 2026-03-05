import { create } from 'zustand'
import api from '../lib/api'
import toast from 'react-hot-toast'

// Sample stories for demo
const sampleStories = [
  {
    _id: 's1',
    userId: { _id: 'u1', name: 'John Doe', avatar: null },
    media: [
      { url: 'https://picsum.photos/400/800?random=1', type: 'image', duration: 5 },
      { url: 'https://picsum.photos/400/800?random=2', type: 'image', duration: 5 }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 82800000).toISOString(),
    viewedBy: ['currentuser'],
    viewCount: 15,
    reactions: [{ type: '❤️', count: 5 }, { type: '🔥', count: 3 }]
  },
  {
    _id: 's2',
    userId: { _id: 'u2', name: 'Jane Smith', avatar: null },
    media: [
      { url: 'https://picsum.photos/400/800?random=3', type: 'image', duration: 5 }
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() + 79200000).toISOString(),
    viewedBy: [],
    viewCount: 8,
    reactions: [{ type: '😍', count: 4 }]
  },
  {
    _id: 's3',
    userId: { _id: 'u3', name: 'Mike Johnson', avatar: null },
    media: [
      { url: 'https://picsum.photos/400/800?random=4', type: 'image', duration: 5 },
      { url: 'https://picsum.photos/400/800?random=5', type: 'video', duration: 15 }
    ],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    expiresAt: new Date(Date.now() + 72000000).toISOString(),
    viewedBy: ['currentuser'],
    viewCount: 23,
    reactions: [{ type: '👍', count: 8 }, { type: '🎉', count: 2 }]
  },
  {
    _id: 's4',
    userId: { _id: 'u4', name: 'Sarah Wilson', avatar: null },
    media: [
      { url: 'https://picsum.photos/400/800?random=6', type: 'image', duration: 5 }
    ],
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    expiresAt: new Date(Date.now() + 64800000).toISOString(),
    viewedBy: [],
    viewCount: 12,
    reactions: [{ type: '❤️', count: 6 }]
  }
]

const sampleMyStory = {
  _id: 'my1',
  userId: { _id: 'currentuser', name: 'You', avatar: null },
  media: [
    { url: 'https://picsum.photos/400/800?random=10', type: 'image', duration: 5 }
  ],
  createdAt: new Date(Date.now() - 1800000).toISOString(),
  expiresAt: new Date(Date.now() + 84600000).toISOString(),
  viewedBy: ['u1', 'u2'],
  viewCount: 2,
  reactions: []
}

const useStoryStore = create((set, get) => ({
  stories: [],
  myStory: null,
  viewingStory: null,
  isLoading: false,

  fetchStories: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/stories')
      const storiesArray = Array.isArray(data) ? data : (data.stories || [])
      set({ stories: storiesArray.length > 0 ? storiesArray : sampleStories, isLoading: false })
    } catch (error) {
      set({ stories: sampleStories, isLoading: false })
      console.error('Failed to fetch stories:', error)
    }
  },

  fetchMyStory: async () => {
    try {
      const { data } = await api.get('/stories/mine')
      set({ myStory: data.story || data })
    } catch (error) {
      set({ myStory: sampleMyStory })
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