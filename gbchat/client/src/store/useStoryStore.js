import { create } from 'zustand'
import api, { isDemoMode } from '../lib/api'
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
    viewers: [],
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
    viewers: [],
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
    viewers: [],
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
    viewers: [],
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
  viewers: []
}

const normalizeStory = (story) => {
  if (!story) return story
  const viewers = Array.isArray(story.viewers) ? story.viewers : []
  const viewedBy = Array.isArray(story.viewedBy) ? story.viewedBy : []
  return {
    ...story,
    // owner can arrive as `user` (API) or `userId` (older payloads)
    user: story.user || story.userId || null,
    viewers,
    viewedBy,
    viewCount:
      typeof story.viewCount === 'number'
        ? story.viewCount
        : story.analytics?.uniqueViews ?? (viewers.length || viewedBy.length || 0),
  }
}

const useStoryStore = create((set, get) => ({
  stories: [],
  myStory: null,
  viewingStory: null,
  isLoading: false,
  isMockData: false,

  fetchStories: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/stories')
      const raw = Array.isArray(data) ? data : data.stories || []
      // The API groups stories per author: [{ user, stories: [...] }]
      const list = raw.flatMap((entry) =>
        Array.isArray(entry?.stories)
          ? entry.stories.map((story) => ({ ...story, user: story.user || entry.user }))
          : [entry]
      )
      if (list.length > 0) {
        set({ stories: list.map(normalizeStory), isLoading: false, isMockData: false })
      } else {
        set({ stories: sampleStories.map(normalizeStory), isLoading: false, isMockData: true })
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error)
      set({ stories: sampleStories.map(normalizeStory), isLoading: false, isMockData: true })
    }
  },

  fetchMyStory: async () => {
    try {
      const { data } = await api.get('/stories/mine')
      const story = data?.story || data
      set({ myStory: story?._id ? normalizeStory(story) : null })
    } catch {
      set({ myStory: normalizeStory(sampleMyStory) })
    }
  },

  createStory: async (formData) => {
    try {
      const { data } = await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const story = normalizeStory(data?.story || data)
      set((state) => ({
        myStory: story,
        stories: story?._id ? [story, ...state.stories.filter((s) => s._id !== story._id)] : state.stories,
      }))
      toast.success('Story published')
      return { success: true, story }
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
      return { success: true }
    } catch (error) {
      toast.error('Failed to delete story')
      return { success: false, error }
    }
  },

  /** Register a view — scoped to the single story id */
  viewStory: async (storyId, userId) => {
    if (!storyId) return

    const target = get().stories.find((story) => story._id === storyId)
    const alreadyViewed = Boolean(
      userId &&
        ((target?.viewedBy || []).some((id) => String(id) === String(userId)) ||
          (target?.viewers || []).some((v) => String(v?.user?._id || v?.user) === String(userId)))
    )

    // Optimistic: this story only
    set((state) => ({
      stories: state.stories.map((story) =>
        story._id === storyId
          ? {
              ...story,
              viewed: true,
              viewedBy:
                userId && !(story.viewedBy || []).some((id) => String(id) === String(userId))
                  ? [...(story.viewedBy || []), userId]
                  : story.viewedBy || [],
            }
          : story
      ),
    }))

    if (alreadyViewed || isDemoMode()) return

    try {
      await api.post(`/stories/${storyId}/view`)
    } catch {
      /* offline/demo — local state already reflects the view */
    }
  },

  /** React (or clear a reaction) on ONE story; never touches the others */
  reactToStory: async (storyId, reaction, userId) => {
    const snapshot = get().stories

    set((state) => ({
      stories: state.stories.map((story) => {
        if (story._id !== storyId) return story

        const viewers = [...(story.viewers || [])]
        const index = viewers.findIndex(
          (v) => String(v?.user?._id || v?.user) === String(userId)
        )

        if (index > -1) {
          viewers[index] = { ...viewers[index], reaction }
        } else if (userId) {
          viewers.push({ user: { _id: userId }, reaction, viewedAt: new Date().toISOString() })
        }

        return { ...story, viewers, myReaction: reaction }
      }),
    }))

    if (isDemoMode()) return { success: true, local: true }

    try {
      await api.post(`/stories/${storyId}/react`, { reaction })
      return { success: true }
    } catch (error) {
      set({ stories: snapshot })
      throw error
    }
  },

  /** Viewer list for a story the current user owns */
  fetchStoryViewers: async (storyId) => {
    try {
      const { data } = await api.get(`/stories/${storyId}/viewers`)
      return Array.isArray(data) ? data : data.viewers || []
    } catch {
      return []
    }
  },

  setViewingStory: (story) => {
    set({ viewingStory: story ? normalizeStory(story) : null })
  },
}))

export default useStoryStore
