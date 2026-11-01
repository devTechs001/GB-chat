import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeftIcon,
  PhoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  EllipsisVerticalIcon,
  ShieldCheckIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  BellIcon,
  MusicalNoteIcon,
  FingerPrintIcon,
  UserGroupIcon,
  ArrowUpTrayIcon,
  PencilSquareIcon,
  UserCircleIcon,
  PhotoIcon,
  DocumentTextIcon,
  ShareIcon,
  ClipboardDocumentIcon,
  CheckBadgeIcon,
  ChatBubbleLeftEllipsisIcon,
  GlobeAltIcon,
  AtSymbolIcon,
  NoSymbolIcon,
  FlagIcon,
  SpeakerWaveIcon,
  QrCodeIcon,
  SparklesIcon,
  ClockIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  SignalIcon,
  DocumentIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import Dropdown from '../components/common/Dropdown'
import Modal from '../components/common/Modal'
import api from '../lib/api'
import useAuthStore from '../store/useAuthStore'
import { formatDistanceToNow, format } from 'date-fns'
import clsx from 'clsx'
import toast from 'react-hot-toast'

/* ------------------------------------------------------------------ */
/* Cover gradients + presence + profile completeness                   */
/* ------------------------------------------------------------------ */

const COVER_GRADIENTS = {
  aurora: 'from-primary-500 via-primary-600 to-emerald-500',
  sunset: 'from-orange-400 via-rose-500 to-purple-600',
  ocean: 'from-sky-400 via-blue-600 to-indigo-700',
  forest: 'from-emerald-400 via-green-600 to-teal-700',
  midnight: 'from-slate-700 via-indigo-900 to-black',
  rose: 'from-pink-400 via-rose-500 to-red-600',
  graphite: 'from-gray-500 via-gray-700 to-gray-900',
}

const PRESENCE = {
  online: { label: 'Online', dot: 'bg-green-500', chip: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: SignalIcon },
  busy: { label: 'Busy', dot: 'bg-red-500', chip: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: SignalIcon },
  away: { label: 'Away', dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: SignalIcon },
  offline: { label: 'Offline', dot: 'bg-gray-400', chip: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300', icon: SignalIcon },
}

const coverClass = (profile) =>
  COVER_GRADIENTS[profile?.coverGradient] || COVER_GRADIENTS.aurora

/** Fields that make a profile feel complete — used for the completion meter. */
const COMPLETION_FIELDS = [
  { key: 'avatar', label: 'Profile photo' },
  { key: 'fullName', label: 'Full name' },
  { key: 'username', label: 'Username' },
  { key: 'about', label: 'About / bio' },
  { key: 'phone', label: 'Phone number' },
  { key: 'location', label: 'Location' },
]

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const StatTile = ({ icon: Icon, label, value, tone = 'text-primary-500' }) => (
  <div className="flex flex-col items-center justify-center gap-1 rounded-2xl surface-muted px-3 py-3">
    <Icon className={clsx('w-5 h-5', tone)} />
    <span className="text-lg font-semibold leading-none text-gray-900 dark:text-white">
      {value ?? '—'}
    </span>
    <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </span>
  </div>
)

const QuickAction = ({ icon: Icon, label, onClick, tone = 'gray', disabled }) => {
  const tones = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col items-center gap-2 rounded-2xl tap-target px-2 py-3 transition-colors hover:bg-gray-100/80 dark:hover:bg-gray-800/70 disabled:opacity-50"
    >
      <span className={clsx('flex h-11 w-11 items-center justify-center rounded-2xl', tones[tone])}>
        <Icon className="w-5 h-5" />
      </span>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  )
}

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 py-3">
    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      <Icon className="w-[18px] h-[18px]" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <div className="text-sm font-medium text-gray-900 dark:text-white break-words">{children}</div>
    </div>
  </div>
)

const Field = ({ label, hint, ...props }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </span>
    <input
      {...props}
      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    />
    {hint && <span className="mt-1 block text-[11px] text-gray-400">{hint}</span>}
  </label>
)

const Skeleton = () => (
  <div className="h-full min-h-0 overflow-y-auto bg-gray-50 dark:bg-dark-bg">
    <div className="h-40 w-full animate-pulse bg-gray-200 dark:bg-gray-800" />
    <div className="px-5">
      <div className="-mt-12 h-24 w-24 animate-pulse rounded-full bg-gray-300 ring-4 ring-white dark:bg-gray-700 dark:ring-gray-900" />
      <div className="mt-4 h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-6 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const ProfilePage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)
  const updateAvatar = useAuthStore((state) => state.updateAvatar)

  const fileInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [media, setMedia] = useState([])
  const [activeTab, setActiveTab] = useState('media')
  const [uploading, setUploading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showRingtones, setShowRingtones] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [highlights, setHighlights] = useState([])
  const [lightbox, setLightbox] = useState(null) // index into mediaItems
  const [scrolled, setScrolled] = useState(false)
  const [prefs, setPrefs] = useState({
    customNotifications: false,
    messageTone: 'Note',
    ringtone: 'Reflection',
    disappearing: false,
    lockChat: false,
    hideLastSeen: false,
  })
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    about: '',
    phone: '',
    website: '',
    location: '',
    pronouns: '',
    statusText: '',
    coverGradient: 'aurora',
  })

  const targetId = userId && userId !== 'me' ? userId : currentUser?._id || currentUser?.id
  const isMe =
    !userId ||
    userId === 'me' ||
    String(userId) === String(currentUser?._id) ||
    String(userId) === String(currentUser?.id)

  /* ---------------- data ---------------- */

  const normalizeProfile = useCallback((raw) => {
    if (!raw) return null
    return {
      ...raw,
      name: raw.fullName || raw.name || 'GBChat user',
      isOnline: raw.status === 'online' || raw.isOnline,
      verified: Boolean(raw.isVerified || raw.verified),
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    setLoading(true)

    if (isMe && currentUser) {
      setProfile(normalizeProfile(currentUser))
      setLoading(false)
    } else {
      try {
        const { data } = await api.get(`/users/${targetId}`)
        setProfile(normalizeProfile(data?.user || data))
      } catch (error) {
        let fallback = null
        try {
          const stored = JSON.parse(localStorage.getItem('auth-storage') || 'null')
          const storedUser = stored?.state?.user
          if (storedUser && (String(storedUser._id || storedUser.id) === String(userId) || isMe)) {
            fallback = storedUser
          }
        } catch {
          /* ignore malformed storage */
        }
        setProfile(fallback ? normalizeProfile(fallback) : null)
        if (!fallback && error?.response?.status !== 404) {
          toast.error('Could not load this profile')
        }
      } finally {
        setLoading(false)
      }
    }

    // Stats + shared media are additive: the page renders fine without them.
    if (targetId) {
      api
        .get(`/users/${targetId}/stats`)
        .then(({ data }) => setStats(data?.stats || data))
        .catch(() => setStats(null))

      api
        .get(`/users/${targetId}/media`)
        .then(({ data }) => setMedia(Array.isArray(data?.media) ? data.media : []))
        .catch(() => setMedia([]))

      api
        .get('/stories/highlights', { params: { userId: targetId } })
        .then(({ data }) => setHighlights(Array.isArray(data?.highlights) ? data.highlights : []))
        .catch(() => setHighlights([]))
    }
  }, [currentUser, isMe, normalizeProfile, targetId, userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (!profile) return
    setForm({
      fullName: profile.fullName || profile.name || '',
      username: profile.username || '',
      about: profile.about || profile.bio || '',
      phone: profile.phone || '',
      website: profile.website || '',
      location: profile.location || '',
      pronouns: profile.pronouns || '',
      statusText: profile.statusText || '',
      coverGradient: profile.coverGradient || 'aurora',
    })
  }, [profile])

  /* ---------------- actions ---------------- */

  const handleAvatarPick = () => fileInputRef.current?.click()

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be smaller than 5 MB')

    setUploading(true)
    const result = await updateAvatar(file)
    setUploading(false)

    if (result.success) {
      setProfile(normalizeProfile(useAuthStore.getState().user))
      toast.success('Profile photo updated')
    }
  }

  const handleCoverPick = () => coverInputRef.current?.click()

  const handleCoverChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')

    setUploading(true)
    try {
      // Reuse the avatar endpoint for storage, then store the URL as the banner.
      const body = new FormData()
      body.append('avatar', file)
      const { data } = await api.post('/users/avatar', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = data?.avatar || data?.url || data?.secure_url
      if (url) {
        await api.patch('/users/profile', { coverPhoto: url })
        setProfile((prev) => ({ ...prev, coverPhoto: url }))
        toast.success('Cover photo updated')
      }
    } catch {
      toast.error('Could not upload cover photo')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/users/profile', form)
      const updated = data?.data || data?.user || data
      const merged = normalizeProfile({ ...profile, ...form, ...(updated || {}) })
      setProfile(merged)
      useAuthStore.setState((state) => ({
        user: { ...state.user, ...form, ...(updated && typeof updated === 'object' ? updated : {}) },
      }))
      setEditOpen(false)
      toast.success('Profile updated')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not save your profile')
    } finally {
      setSaving(false)
    }
  }

  const handleMessage = () => {
    if (!targetId) return
    navigate(`/?chat=${targetId}`)
  }

  const handleCall = (isVideo = false) => {
    if (!profile) return
    window.dispatchEvent(
      new CustomEvent('gbchat:start-call', {
        detail: {
          userId: profile._id || targetId,
          name: profile.name,
          avatar: profile.avatar,
          type: isVideo ? 'video' : 'audio',
        },
      })
    )
  }

  const handleBlock = async () => {
    if (!window.confirm('Block this contact? They will no longer be able to message you.')) return
    try {
      await api.post(`/users/${profile._id || targetId}/block`)
      toast.success('Contact blocked')
      navigate('/chats')
    } catch {
      toast.error('Could not block this contact')
    }
  }

  const handleReport = async () => {
    try {
      await api.post(`/chats/${profile._id || targetId}/report`, { reason: 'profile-report' })
      toast.success('Report submitted')
    } catch {
      toast.error('Could not submit report')
    }
  }

  const handleShare = async () => {
    const handle = profile?.username ? `@${profile.username}` : profile?.name
    const text = `${handle} on GBChat`
    try {
      if (navigator.share) {
        await navigator.share({ title: profile.name, text, url: window.location.href })
        return
      }
      await navigator.clipboard.writeText(`${text} — ${window.location.href}`)
      toast.success('Profile link copied')
    } catch {
      toast.error('Sharing is not available in this browser')
    }
  }

  const handleCopyHandle = async () => {
    const value = profile?.username ? `@${profile.username}` : profile?.name
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Copied')
    } catch {
      toast.error('Copy is not available')
    }
  }

  const togglePref = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

  /** Presence switch — optimistic, then persisted server-side. */
  const changeStatus = async (status) => {
    const previous = profile?.status
    setProfile((prev) => (prev ? { ...prev, status, isOnline: status === 'online' } : prev))
    try {
      await api.patch('/users/status', { status })
      const fresh = useAuthStore.getState().user
      if (fresh) useAuthStore.setState({ user: { ...fresh, status } })
      toast.success(`Status set to ${PRESENCE[status]?.label || status}`)
    } catch {
      setProfile((prev) => (prev ? { ...prev, status: previous } : prev))
      toast.error('Could not update your status')
    }
  }

  /** Copy any value, with a consistent toast. */
  const copyValue = async (value, label = 'Copied') => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(label)
    } catch {
      toast.error('Copy is not available in this browser')
    }
  }

  /** Download the contact as a vCard 3.0 file — works offline, no API. */
  const downloadVCard = () => {
    const name = profile.name || 'GBChat contact'
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      `N:${name};;;;`,
    ]
    if (profile.phone) lines.push(`TEL;TYPE=CELL:${profile.phone}`)
    if (profile.email) lines.push(`EMAIL;TYPE=INTERNET:${profile.email}`)
    if (profile.website) lines.push(`URL:${profile.website}`)
    if (profile.about) lines.push(`NOTE:${String(profile.about).replace(/\n/g, ' ')}`)
    lines.push(`UID:${profile._id || targetId || 'gbchat'}`)
    lines.push(`REV:${new Date().toISOString()}`)
    lines.push('END:VCARD')

    try {
      const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${name.replace(/\s+/g, '-').toLowerCase()}.vcf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success('Contact card saved')
    } catch {
      toast.error('Could not create the contact card')
    }
  }

  const openLightbox = (index) => setLightbox(index)
  const closeLightbox = () => setLightbox(null)
  const stepLightbox = (delta) =>
    setLightbox((current) => {
      if (current === null) return current
      const total = mediaItems.length
      if (!total) return null
      return (current + delta + total) % total
    })

  const menuItems = isMe
    ? [
        { label: 'Edit profile', action: 'edit' },
        { label: 'Share profile', action: 'share' },
        { label: 'Settings', action: 'settings' },
      ]
    : [
        { label: 'Share contact', action: 'share' },
        { label: 'Block user', action: 'block', danger: true },
        { label: 'Report user', action: 'report', danger: true },
      ]

  const onMenuSelect = (action) => {
    if (action === 'block') return handleBlock()
    if (action === 'report') return handleReport()
    if (action === 'share') return handleShare()
    if (action === 'edit') return setEditOpen(true)
    if (action === 'settings') return navigate('/settings')
  }

  /* ---------------- derived ---------------- */

  const links = useMemo(
    () => media.filter((item) => !item.url && item.text && /https?:\/\//i.test(item.text)),
    [media]
  )
  const mediaItems = useMemo(
    () => media.filter((item) => item.url && item.kind !== 'document'),
    [media]
  )
  const documents = useMemo(
    () => media.filter((item) => item.url && item.kind === 'document'),
    [media]
  )
  const groups = profile?.commonGroups || []

  const coverStyle = profile?.coverPhoto
    ? { backgroundImage: `url(${profile.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined

  const presence = PRESENCE[profile?.status] || PRESENCE.offline

  /** Completion is only meaningful for your own profile. */
  const completion = useMemo(() => {
    if (!isMe) return null
    const filled = COMPLETION_FIELDS.filter((field) => {
      const value = field.key === 'avatar' ? profile?.avatar : profile?.[field.key]
      return Boolean(value && String(value).trim())
    })
    return {
      percent: Math.round((filled.length / COMPLETION_FIELDS.length) * 100),
      missing: COMPLETION_FIELDS.filter((field) => !filled.includes(field)),
    }
  }, [isMe, profile])

  const activeLightboxItem = lightbox !== null ? mediaItems[lightbox] : null

  if (loading) return <Skeleton />

  if (!profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <UserCircleIcon className="w-14 h-14 text-gray-300 dark:text-gray-600" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Profile unavailable</p>
          <p className="text-sm text-gray-500">This account may have been deleted or you are offline.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/chats')}>
          Back to chats
        </Button>
      </div>
    )
  }

  const tabs = [
    { id: 'media', label: 'Media', icon: PhotoIcon, count: mediaItems.length },
    { id: 'stories', label: 'Stories', icon: SparklesIcon, count: highlights.length },
    { id: 'docs', label: 'Docs', icon: DocumentIcon, count: documents.length },
    { id: 'links', label: 'Links', icon: LinkIcon, count: links.length },
    { id: 'groups', label: 'Groups', icon: UserGroupIcon, count: groups.length },
    { id: 'about', label: 'About', icon: IdentificationIcon },
  ]

  return (
    <div
      onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 96)}
      className="h-full min-h-0 overflow-y-auto overscroll-contain bg-gray-50 pb-10 dark:bg-dark-bg"
    >
      {/* Compact sticky bar (appears once the hero scrolls away) */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -48, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200/70 bg-white/90 px-3 py-2 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90"
          >
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{profile.name}</p>
              <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                {profile.username ? `@${profile.username}` : presence.label}
              </p>
            </div>
            {!isMe && (
              <Button
                size="sm"
                variant="primary"
                icon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}
                onClick={handleMessage}
              >
                <span className="hidden sm:inline">Message</span>
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- Cover + header ---------------- */}
      <div className="relative">
        <div
          style={coverStyle}
          className={clsx(
            'h-44 w-full bg-gradient-to-br',
            !profile.coverPhoto && coverClass(profile)
          )}
        >
          <div className="h-full w-full bg-gradient-to-t from-black/25 via-transparent to-black/10" />
        </div>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="rounded-xl bg-black/25 p-2 text-white backdrop-blur-md transition hover:bg-black/40"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {isMe && (
              <button
                onClick={handleCoverPick}
                aria-label="Change cover photo"
                className="rounded-xl bg-black/25 p-2 text-white backdrop-blur-md transition hover:bg-black/40"
              >
                <PhotoIcon className="w-5 h-5" />
              </button>
            )}
            <Dropdown
              trigger={
                <button
                  aria-label="More options"
                  className="rounded-xl bg-black/25 p-2 text-white backdrop-blur-md transition hover:bg-black/40"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
              }
              items={menuItems}
              onSelect={onMenuSelect}
            />
          </div>
        </div>
      </div>

      {/* ---------------- Identity card ---------------- */}
      <div className="px-4">
        <div className="surface-card -mt-14 rounded-3xl px-5 pb-5 pt-4 shadow-lg">
          <div className="flex items-end justify-between gap-3">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              className="relative -mt-14"
            >
              <Avatar
                src={profile.avatar}
                alt={profile.name}
                size="xl"
                status={profile.isOnline ? 'online' : 'offline'}
                className="ring-4 ring-white shadow-xl dark:ring-gray-900"
              />

              {isMe && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                  <button
                    type="button"
                    onClick={handleAvatarPick}
                    disabled={uploading}
                    aria-label="Change profile photo"
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition hover:bg-primary-700 disabled:opacity-60"
                  >
                    {uploading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <ArrowUpTrayIcon className="w-4 h-4" />
                    )}
                  </button>
                </>
              )}
            </motion.div>

            <div className="flex items-center gap-2 pb-1">
              {isMe ? (
                <Dropdown
                  position="right"
                  trigger={
                    <button
                      type="button"
                      className={clsx(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
                        presence.chip
                      )}
                    >
                      <span className={clsx('h-1.5 w-1.5 rounded-full', presence.dot)} />
                      {presence.label}
                      <ChevronDownIcon className="h-3 w-3 opacity-70" />
                    </button>
                  }
                  items={[
                    { label: 'Online', action: 'online' },
                    { label: 'Busy', action: 'busy' },
                    { label: 'Away', action: 'away' },
                    { label: 'Invisible (offline)', action: 'offline' },
                  ]}
                  onSelect={changeStatus}
                />
              ) : (
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    presence.chip
                  )}
                >
                  <span className={clsx('h-1.5 w-1.5 rounded-full', presence.dot)} />
                  {presence.label}
                </span>
              )}
              {profile.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {profile.name}
              </h1>
              {profile.pronouns && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {profile.pronouns}
                </span>
              )}
            </div>

            {profile.username ? (
              <button
                onClick={handleCopyHandle}
                className="mt-0.5 inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              >
                <AtSymbolIcon className="w-4 h-4" />
                {profile.username}
                <ClipboardDocumentIcon className="w-3.5 h-3.5 opacity-60" />
              </button>
            ) : (
              isMe && (
                <button
                  onClick={() => setEditOpen(true)}
                  className="mt-0.5 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline dark:text-primary-400"
                >
                  <AtSymbolIcon className="w-4 h-4" />
                  Claim your username
                </button>
              )
            )}

            {profile.statusText && (
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <ClockIcon className="h-3.5 w-3.5" />
                {profile.statusText}
              </p>
            )}

            <p className="mt-2 max-w-prose text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {profile.about || profile.bio || (isMe ? 'Add a short bio to introduce yourself.' : '')}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              {profile.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:underline dark:text-primary-400"
                >
                  <GlobeAltIcon className="w-4 h-4" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {profile.createdAt && (
                <span className="inline-flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  Joined {format(new Date(profile.createdAt), 'MMM yyyy')}
                </span>
              )}
            </div>
          </div>

          {/* Primary actions */}
          <div className="mt-5 flex flex-wrap gap-2">
            {isMe ? (
              <>
                <Button
                  variant="primary"
                  icon={<PencilSquareIcon className="w-5 h-5" />}
                  onClick={() => setEditOpen(true)}
                >
                  Edit profile
                </Button>
                <Button variant="secondary" icon={<ShareIcon className="w-5 h-5" />} onClick={handleShare}>
                  Share
                </Button>
                <Button variant="secondary" icon={<QrCodeIcon className="w-5 h-5" />} onClick={() => setShowQr(true)}>
                  QR
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
                  onClick={handleMessage}
                >
                  Message
                </Button>
                <Button variant="secondary" icon={<PhoneIcon className="w-5 h-5" />} onClick={() => handleCall(false)}>
                  Call
                </Button>
                <Button
                  variant="secondary"
                  icon={<VideoCameraIcon className="w-5 h-5" />}
                  onClick={() => handleCall(true)}
                >
                  Video
                </Button>
                <Button variant="secondary" icon={<ShareIcon className="w-5 h-5" />} onClick={handleShare}>
                  Share
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Profile completion (own profile only) ---------------- */}
      {completion && completion.percent < 100 && (
        <div className="mt-3 px-4">
          <div className="surface-card rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                  <SparklesIcon className="h-4 w-4 text-amber-500" />
                  Profile {completion.percent}% complete
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                  Missing: {completion.missing.map((field) => field.label).join(', ')}
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
                Finish
              </Button>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completion.percent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Stats ---------------- */}
      <div className="mt-3 px-4">
        <div className="grid grid-cols-4 gap-2">
          <StatTile icon={ChatBubbleLeftEllipsisIcon} label="Chats" value={stats?.chats} tone="text-green-500" />
          <StatTile icon={UserGroupIcon} label="Groups" value={stats?.groups} tone="text-blue-500" />
          <StatTile icon={PhotoIcon} label="Media" value={stats?.media} tone="text-purple-500" />
          <StatTile icon={SparklesIcon} label="Stories" value={stats?.stories} tone="text-amber-500" />
        </div>
      </div>

      {/* ---------------- Quick actions ---------------- */}
      <div className="mt-3 px-4">
        <div className="surface-card rounded-3xl px-2 py-2">
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-6">
            {isMe ? (
              <>
                <QuickAction icon={PencilSquareIcon} label="Edit" tone="green" onClick={() => setEditOpen(true)} />
                <QuickAction icon={QrCodeIcon} label="My QR" tone="blue" onClick={() => setShowQr(true)} />
                <QuickAction icon={BellIcon} label="Alerts" tone="amber" onClick={() => setShowRingtones(true)} />
                <QuickAction icon={ShieldCheckIcon} label="Privacy" tone="purple" onClick={() => setShowPermissions(true)} />
                <QuickAction icon={ShareIcon} label="Share" tone="gray" onClick={handleShare} />
                <QuickAction icon={ClockIcon} label="Archive" tone="gray" onClick={() => navigate('/settings')} />
              </>
            ) : (
              <>
                <QuickAction icon={ChatBubbleLeftRightIcon} label="Chat" tone="green" onClick={handleMessage} />
                <QuickAction icon={PhoneIcon} label="Call" tone="blue" onClick={() => handleCall(false)} />
                <QuickAction icon={VideoCameraIcon} label="Video" tone="purple" onClick={() => handleCall(true)} />
                <QuickAction icon={SpeakerWaveIcon} label="Mute" tone="amber" onClick={() => toast.success('Notifications muted for this contact')} />
                <QuickAction icon={NoSymbolIcon} label="Block" tone="red" onClick={handleBlock} />
                <QuickAction icon={FlagIcon} label="Report" tone="gray" onClick={handleReport} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Tabs ---------------- */}
      <div className="mt-3 px-4">
        <div className="surface-card overflow-hidden rounded-3xl">
          <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200/70 dark:border-gray-800">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'relative flex min-w-[76px] flex-1 items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors',
                    active
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="rounded-full bg-gray-100 px-1.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {tab.count}
                    </span>
                  )}
                  {active && (
                    <motion.span
                      layoutId="profile-tab-underline"
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary-600 dark:bg-primary-400"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="p-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === 'media' && (
                  mediaItems.length ? (
                    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                      {mediaItems.map((item, index) => (
                        <button
                          type="button"
                          key={item._id}
                          onClick={() => openLightbox(index)}
                          className="group relative aspect-square overflow-hidden rounded-xl bg-gray-200 focus:outline-none focus-visible:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                        >
                          <img
                            src={item.thumbnail || item.url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          {item.kind === 'video' && (
                            <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              <VideoCameraIcon className="h-3 w-3" />
                              Video
                            </span>
                          )}
                          <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={PhotoIcon} title="No media yet" hint="Photos and videos you share will appear here." />
                  )
                )}

                {activeTab === 'stories' && (
                  highlights.length ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {highlights.map((highlight) => (
                        <button
                          type="button"
                          key={highlight._id}
                          onClick={() => navigate('/stories')}
                          className="group flex flex-col items-center gap-1.5"
                        >
                          <span
                            className={clsx(
                              'relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br p-[2px]',
                              highlight.color || COVER_GRADIENTS.aurora
                            )}
                          >
                            <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white dark:bg-gray-900">
                              {highlight.coverImage ? (
                                <img
                                  src={highlight.coverImage}
                                  alt={highlight.title}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <SparklesIcon className="h-6 w-6 text-primary-500" />
                              )}
                            </span>
                          </span>
                          <span className="w-full truncate text-center text-[11px] font-medium text-gray-700 dark:text-gray-300">
                            {highlight.title}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {highlight.storyCount || 0} {highlight.storyCount === 1 ? 'story' : 'stories'}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={SparklesIcon}
                      title="No highlights"
                      hint={isMe ? 'Turn your best stories into highlights from the Stories page.' : 'This person has not saved any highlights yet.'}
                    />
                  )
                )}

                {activeTab === 'docs' && (
                  documents.length ? (
                    <ul className="divide-y divide-gray-200/70 dark:divide-gray-800">
                      {documents.map((doc) => (
                        <li key={doc._id} className="flex items-center gap-3 py-3">
                          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                            <DocumentIcon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {doc.filename || doc.text || 'Document'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doc.createdAt ? formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true }) : ''}
                            </p>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
                          >
                            Open
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState icon={DocumentIcon} title="No documents" hint="Files shared in your chats appear here." />
                  )
                )}

                {activeTab === 'links' && (
                  links.length ? (
                    <ul className="divide-y divide-gray-200/70 dark:divide-gray-800">
                      {links.map((item) => (
                        <li key={item._id} className="flex items-start gap-3 py-3">
                          <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                            <LinkIcon className="w-[18px] h-[18px]" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.text}</p>
                            <p className="text-xs text-gray-500">
                              {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : ''}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState icon={LinkIcon} title="No links yet" hint="Shared links show up in this tab." />
                  )
                )}

                {activeTab === 'groups' && (
                  groups.length ? (
                    <ul className="space-y-2">
                      {groups.map((group) => (
                        <li
                          key={group._id}
                          className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 transition hover:bg-gray-100 dark:bg-gray-800/60 dark:hover:bg-gray-800"
                        >
                          <Avatar src={group.avatar} alt={group.name} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{group.name}</p>
                            <p className="text-xs text-gray-500">{group.memberCount} members</p>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => navigate('/groups')}>
                            Open
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState icon={UserGroupIcon} title="No common groups" hint="Groups you both belong to appear here." />
                  )
                )}

                {activeTab === 'about' && (
                  <div className="divide-y divide-gray-200/70 dark:divide-gray-800">
                    {profile.about && (
                      <div className="pb-3">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">About</p>
                        <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{profile.about}</p>
                      </div>
                    )}
                    {profile.phone && (
                      <InfoRow icon={PhoneIcon} label="Phone">
                        <span className="flex items-center justify-between gap-2">
                          <span>{profile.phone}</span>
                          <span className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => copyValue(profile.phone, 'Phone number copied')}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                              aria-label="Copy phone number"
                            >
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            </button>
                            <a
                              href={`tel:${profile.phone}`}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                              aria-label="Call this number"
                            >
                              <PhoneIcon className="h-4 w-4" />
                            </a>
                          </span>
                        </span>
                      </InfoRow>
                    )}
                    {profile.email && (
                      <InfoRow icon={EnvelopeIcon} label="Email">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate">{profile.email}</span>
                          <button
                            type="button"
                            onClick={() => copyValue(profile.email, 'Email copied')}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                            aria-label="Copy email"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        </span>
                      </InfoRow>
                    )}
                    {profile.pronouns && (
                      <InfoRow icon={BuildingOffice2Icon} label="Pronouns">{profile.pronouns}</InfoRow>
                    )}
                    {profile.website && (
                      <InfoRow icon={LinkIcon} label="Website">
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline dark:text-primary-400"
                        >
                          {profile.website}
                        </a>
                      </InfoRow>
                    )}
                    {profile.location && <InfoRow icon={MapPinIcon} label="Location">{profile.location}</InfoRow>}
                    {profile.createdAt && (
                      <InfoRow icon={CalendarIcon} label="Member since">
                        {format(new Date(profile.createdAt), 'd MMMM yyyy')}
                      </InfoRow>
                    )}
                    {stats && (
                      <InfoRow icon={ChatBubbleLeftEllipsisIcon} label="Messages sent">
                        {stats.messagesSent}
                      </InfoRow>
                    )}
                    <InfoRow icon={ArrowDownTrayIcon} label="Contact card">
                      <button
                        type="button"
                        onClick={downloadVCard}
                        className="inline-flex items-center gap-1 text-primary-600 hover:underline dark:text-primary-400"
                      >
                        Save as .vcf
                        <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                      </button>
                    </InfoRow>
                    <InfoRow icon={FingerPrintIcon} label="Security">
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckBadgeIcon className="w-4 h-4" />
                        Chats are encrypted in transit (TLS) and PIN-lockable
                      </span>
                    </InfoRow>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ---------------- Edit profile modal ---------------- */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit profile" size="md">
        <div className="space-y-3">
          <Field
            label="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Your name"
          />
          <Field
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="yourhandle"
            hint="3–30 characters: letters, numbers, dots or underscores"
          />
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              About
            </span>
            <textarea
              rows={3}
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              placeholder="Tell people a little about yourself"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+254…"
            />
            <Field
              label="Pronouns"
              value={form.pronouns}
              onChange={(e) => setForm({ ...form, pronouns: e.target.value })}
              placeholder="they/them"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Nairobi, KE"
            />
            <Field
              label="Website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://…"
            />
          </div>

          <Field
            label="Status"
            value={form.statusText}
            onChange={(e) => setForm({ ...form, statusText: e.target.value })}
            placeholder="In a meeting"
            hint="Shown under your name, next to your presence"
          />

          <div>
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Cover gradient
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.keys(COVER_GRADIENTS).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, coverGradient: key })}
                  aria-label={`${key} cover`}
                  aria-pressed={form.coverGradient === key}
                  className={clsx(
                    'relative h-9 w-12 overflow-hidden rounded-lg bg-gradient-to-br ring-2 transition',
                    COVER_GRADIENTS[key],
                    form.coverGradient === key
                      ? 'ring-primary-500'
                      : 'ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600'
                  )}
                >
                  {form.coverGradient === key && (
                    <CheckIcon className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              Used when no cover photo is uploaded.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSaveProfile}>
              Save changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---------------- Media lightbox ---------------- */}
      <Modal
        isOpen={Boolean(activeLightboxItem)}
        onClose={closeLightbox}
        title={activeLightboxItem ? `Media ${lightbox + 1} of ${mediaItems.length}` : 'Media'}
        size="lg"
      >
        {activeLightboxItem && (
          <div className="space-y-3">
            <div className="relative flex max-h-[60vh] items-center justify-center overflow-hidden rounded-2xl bg-black">
              {activeLightboxItem.kind === 'video' ? (
                <video
                  src={activeLightboxItem.url}
                  poster={activeLightboxItem.thumbnail}
                  controls
                  className="max-h-[60vh] w-full"
                />
              ) : (
                <img
                  src={activeLightboxItem.url}
                  alt={activeLightboxItem.text || 'Shared media'}
                  className="max-h-[60vh] w-full object-contain"
                />
              )}

              {mediaItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => stepLightbox(-1)}
                    aria-label="Previous media"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepLightbox(1)}
                    aria-label="Next media"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="truncate">
                {activeLightboxItem.createdAt
                  ? formatDistanceToNow(new Date(activeLightboxItem.createdAt), { addSuffix: true })
                  : ''}
              </span>
              <a
                href={activeLightboxItem.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------- QR modal ---------------- */}
      <Modal isOpen={showQr} onClose={() => setShowQr(false)} title="Share your profile" size="sm">
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-emerald-500 text-white">
            <QrCodeIcon className="h-24 w-24" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Scan the QR in GBChat to open <span className="font-semibold">{profile.name}</span>&apos;s profile.
          </p>
          <Button variant="secondary" icon={<ShareIcon className="w-5 h-5" />} onClick={handleShare}>
            Copy profile link
          </Button>
        </div>
      </Modal>

      {/* ---------------- Ringtones modal ---------------- */}
      <Modal isOpen={showRingtones} onClose={() => setShowRingtones(false)} title="Notifications" size="sm">
        <div className="space-y-3">
          {[
            { key: 'customNotifications', label: 'Use custom notifications', icon: BellIcon },
            { key: 'messageTone', label: 'Message tone', value: prefs.messageTone, icon: MusicalNoteIcon },
            { key: 'ringtone', label: 'Ringtone', value: prefs.ringtone, icon: PhoneIcon },
          ].map((row) => {
            const Icon = row.icon
            const isToggle = row.value === undefined
            return (
              <div
                key={row.key}
                className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{row.label}</p>
                    {!isToggle && <p className="text-xs text-gray-500">{row.value}</p>}
                  </div>
                </div>
                {isToggle && (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs[row.key]}
                    onClick={() => togglePref(row.key)}
                    className={clsx(
                      'relative h-6 w-11 rounded-full transition-colors',
                      prefs[row.key] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                    )}
                  >
                    <span
                      className={clsx(
                        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                        prefs[row.key] ? 'translate-x-5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </Modal>

      {/* ---------------- Permissions modal ---------------- */}
      <Modal isOpen={showPermissions} onClose={() => setShowPermissions(false)} title="Privacy & permissions" size="sm">
        <div className="space-y-3">
          {[
            { key: 'disappearing', label: 'Disappearing messages', icon: ClockIcon },
            { key: 'lockChat', label: 'Lock this chat', icon: FingerPrintIcon },
            { key: 'hideLastSeen', label: 'Hide last seen', icon: ShieldCheckIcon },
          ].map((row) => {
            const Icon = row.icon
            return (
              <div
                key={row.key}
                className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{row.label}</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs[row.key]}
                  onClick={() => togglePref(row.key)}
                  className={clsx(
                    'relative h-6 w-11 rounded-full transition-colors',
                    prefs[row.key] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  )}
                >
                  <span
                    className={clsx(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      prefs[row.key] ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>
            )
          })}
          <p className="px-1 text-[11px] leading-relaxed text-gray-400">
            These toggles are stored on this device. Account-level privacy lives in Settings → Privacy.
          </p>
        </div>
      </Modal>
    </div>
  )
}

const EmptyState = ({ icon: Icon, title, hint }) => (
  <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
      <Icon className="w-6 h-6" />
    </span>
    <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
    <p className="text-xs text-gray-500">{hint}</p>
  </div>
)

export default ProfilePage
