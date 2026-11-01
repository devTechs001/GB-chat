import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRightIcon,
  BookOpenIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  MapPinIcon,
  MegaphoneIcon,
  MicrophoneIcon,
  MoonIcon,
  PaperAirplaneIcon,
  PhoneArrowUpRightIcon,
  PhotoIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SunIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'
import useAuthStore from '../../store/useAuthStore'
import useChatStore from '../../store/useChatStore'
import clsx from 'clsx'
import { formatDistanceToNowStrict } from 'date-fns'

/**
 * HomeWelcome — the "home screen" shown in the conversation pane before a chat
 * is opened. Every affordance is an icon tile (no emoji), and each tile leads
 * somewhere real: a modal, a route, or an existing chat.
 */

const Tile = ({ icon: Icon, label, hint, tone, onClick }) => (
  <motion.button
    type="button"
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group flex items-start gap-3 rounded-2xl border border-gray-200/70 bg-white p-3 text-left shadow-sm transition-colors hover:border-primary-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-700"
  >
    <span className={clsx('flex h-10 w-10 flex-none items-center justify-center rounded-xl', tone)}>
      <Icon className="h-5 w-5" />
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-gray-900 dark:text-white">{label}</span>
      <span className="mt-0.5 block text-xs leading-snug text-gray-500 dark:text-gray-400">{hint}</span>
    </span>
  </motion.button>
)

const Stat = ({ icon: Icon, value, label, tone }) => (
  <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
    <Icon className={clsx('h-4 w-4', tone)} />
    <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
  </div>
)

const HomeWelcome = ({ onNewChat, onSelectChat }) => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const chats = useChatStore((state) => state.chats)
  const onlineUsers = useChatStore((state) => state.onlineUsers)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const GreetingIcon = hour < 12 ? SunIcon : hour < 18 ? SparklesIcon : MoonIcon

  const { unread, groups, direct, recent } = useMemo(() => {
    const list = Array.isArray(chats) ? chats.filter((chat) => chat && chat._id) : []
    return {
      unread: list.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0),
      groups: list.filter((chat) => chat.isGroup).length,
      direct: list.filter((chat) => !chat.isGroup).length,
      recent: [...list]
        .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
        .slice(0, 4),
    }
  }, [chats])

  const firstName = (user?.fullName || user?.name || 'there').split(' ')[0]

  const previewOf = (chat) => {
    const raw = chat.lastMessage
    const text =
      (typeof raw?.content === 'string' ? raw.content : raw?.content?.text) || raw?.text || ''
    if (text) return text
    if (raw?.type === 'image') return 'Photo'
    if (raw?.type === 'video') return 'Video'
    if (raw?.type === 'voice' || raw?.type === 'audio') return 'Voice message'
    return chat.isGroup ? 'Group chat' : 'No messages yet'
  }

  return (
    <div className="h-full w-full overflow-y-auto overscroll-contain bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-3xl px-5 py-8">
        {/* Greeting */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} alt={user?.fullName || 'You'} size="lg" status={onlineStatus(user)} />
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <GreetingIcon className="h-3.5 w-3.5" />
                {greeting}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {firstName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {unread > 0
                  ? `You have ${unread} unread message${unread === 1 ? '' : 's'} waiting.`
                  : 'You are all caught up.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Stat icon={ChatBubbleLeftRightIcon} value={direct} label="chats" tone="text-green-500" />
            <Stat icon={UserGroupIcon} value={groups} label="groups" tone="text-blue-500" />
            <Stat
              icon={UsersIcon}
              value={Array.isArray(onlineUsers) ? onlineUsers.length : 0}
              label="online"
              tone="text-emerald-500"
            />
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-7">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Start something
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Tile
              icon={PlusIcon}
              label="New chat"
              hint="Message a contact or start a fresh conversation"
              tone="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
              onClick={onNewChat}
            />
            <Tile
              icon={UserGroupIcon}
              label="New group"
              hint="Bring people together with polls, events and more"
              tone="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              onClick={() => navigate('/groups')}
            />
            <Tile
              icon={PhoneArrowUpRightIcon}
              label="Start a call"
              hint="Voice or video, end-to-end encrypted"
              tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              onClick={() => navigate('/calls')}
            />
            <Tile
              icon={BoltIcon}
              label="Stories"
              hint="See what your contacts shared in the last 24h"
              tone="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              onClick={() => navigate('/stories')}
            />
            <Tile
              icon={BookOpenIcon}
              label="Contacts"
              hint="Manage, import and organise your address book"
              tone="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              onClick={() => navigate('/contacts')}
            />
            <Tile
              icon={MegaphoneIcon}
              label="Channels"
              hint="Broadcast updates to subscribers"
              tone="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
              onClick={() => navigate('/channels')}
            />
          </div>
        </div>

        {/* Recent conversations */}
        {recent.length > 0 && (
          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Jump back in
              </h2>
              <button
                type="button"
                onClick={() => navigate('/chats')}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                All chats
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            <ul className="divide-y divide-gray-200/70 overflow-hidden rounded-2xl border border-gray-200/70 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
              {recent.map((chat) => (
                <li key={chat._id}>
                  <button
                    type="button"
                    onClick={() => onSelectChat?.(chat)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/70"
                  >
                    <Avatar src={chat.avatar} alt={chat.name} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {chat.name}
                        </span>
                        {chat.isGroup && <UserGroupIcon className="h-3.5 w-3.5 flex-none text-gray-400" />}
                      </span>
                      <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                        {previewOf(chat)}
                      </span>
                    </span>
                    <span className="flex flex-none flex-col items-end gap-1">
                      <span className="text-[11px] text-gray-400">
                        {chat.lastMessageAt
                          ? formatDistanceToNowStrict(new Date(chat.lastMessageAt), { addSuffix: false })
                          : ''}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="min-w-[18px] rounded-full bg-primary-500 px-1.5 text-center text-[10px] font-bold text-white">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Capability strip — icons only */}
        <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { icon: ShieldCheckIcon, label: 'Private by design' },
            { icon: MicrophoneIcon, label: 'Voice notes' },
            { icon: PhotoIcon, label: 'Media gallery' },
            { icon: Cog6ToothIcon, label: '12 themes' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-gray-200/70 bg-white/60 px-3 py-2 text-[11px] font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300"
            >
              <Icon className="h-4 w-4 text-primary-500" />
              {label}
            </div>
          ))}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
          <PaperAirplaneIcon className="h-3.5 w-3.5" />
          Your chats are synced across up to 4 linked devices
          <MapPinIcon className="h-3.5 w-3.5" />
          {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
        </p>
      </div>
    </div>
  )
}

const onlineStatus = (user) => {
  const status = user?.status
  if (status === 'busy' || status === 'away' || status === 'online') return status
  return 'offline'
}

export default HomeWelcome
