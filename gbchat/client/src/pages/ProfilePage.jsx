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
  const mediaItems = useMemo(() => media.filter((item) => item.url), [media])
  const groups = profile?.commonGroups || []

  const coverStyle = profile?.coverPhoto
    ? { backgroundImage: `url(${profile.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined

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
    { id: 'media', label: 'Media', icon: PhotoIcon },
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'groups', label: 'Groups', icon: UserGroupIcon },
    { id: 'about', label: 'About', icon: DocumentTextIcon },
  ]

  return (
    <div className="h-full min-h-0 overflow-y-auto overscroll-contain bg-gray-50 pb-10 dark:bg-dark-bg">
      {/* ---------------- Cover + header ---------------- */}
      <div className="relative">
        <div
          style={coverStyle}
          className="h-44 w-full bg-gradient-to-br from-primary-500 via-primary-600 to-emerald-500 dark:from-primary-700 dark:via-primary-800 dark:to-emerald-800"
        >
          <div className="h-full w-full bg-black/5 dark:bg-black/10" />
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
              {profile.isOnline && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Online
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
          <div className="flex border-b border-gray-200/70 dark:border-gray-800">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'relative flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-sm font-medium transition-colors',
                    active
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
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
                      {mediaItems.map((item) => (
                        <div
                          key={item._id}
                          className="group relative aspect-square overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700"
                        >
                          <img
                            src={item.thumbnail || item.url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={PhotoIcon} title="No media yet" hint="Photos and videos you share will appear here." />
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
                    {profile.phone && <InfoRow icon={PhoneIcon} label="Phone">{profile.phone}</InfoRow>}
                    {profile.email && <InfoRow icon={AtSymbolIcon} label="Email">{profile.email}</InfoRow>}
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
                    <InfoRow icon={FingerPrintIcon} label="Security">
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckBadgeIcon className="w-4 h-4" />
                        End-to-end encrypted chats
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
