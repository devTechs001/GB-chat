import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import ChatList from '../components/chat/ChatList'
import HomeWelcome from '../components/chat/HomeWelcome'
import ChatArea from '../components/chat/ChatArea'
import StoryBar from '../components/stories/StoryBar'
import ErrorBoundary from '../components/common/ErrorBoundary'
import FeatureFAB from '../components/enhanced/FeatureFAB'
import ContactPermissions from '../components/enhanced/ContactPermissions'
import StarredMessages from '../components/chat/StarredMessages'
import PinnedMessages from '../components/chat/PinnedMessages'
import ChatProfileDrawer from '../components/chat/ChatProfileDrawer'
import NewChatModal from '../components/chat/NewChatModal'
import AppPermissions from '../components/enhanced/AppPermissions'
import useChatStore from '../store/useChatStore'
import useGBFeaturesStore from '../store/useGBFeaturesStore'
import clsx from 'clsx'

/**
 * ChatPage — two-pane messaging layout.
 *
 *   lg+  : list pane (380px) + conversation pane side by side
 *   < lg : one pane at a time (list ⇄ conversation) with an explicit back action
 *
 * The active conversation is mirrored in the URL (`?chat=<id>`) so it survives
 * refreshes and can be opened from a profile page.
 */
const ChatPage = () => {
  const { closeSidebar } = useOutletContext() || {}
  const [searchParams, setSearchParams] = useSearchParams()

  const { activeChat, setActiveChat, fetchChats, chats, createChat } = useChatStore()
  const { initGBFeatures } = useGBFeaturesStore()

  const [showPermissions, setShowPermissions] = useState(false)
  const [contacts, setContacts] = useState([])
  const [showStarred, setShowStarred] = useState(false)
  const [showPinned, setShowPinned] = useState(false)
  const [showProfileDrawer, setShowProfileDrawer] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showAppPermissions, setShowAppPermissions] = useState(false)

  const chatIdFromUrl = searchParams.get('chat')
  // Ids we already tried to resolve from the URL, so a local fallback chat can
  // never trigger an endless create loop.
  const resolvedDeepLinks = useRef(new Set())

  useEffect(() => {
    fetchChats()
    initGBFeatures()
    // Placeholder directory used by the permissions modal
    setContacts([
      { _id: '1', name: 'John Doe', phoneNumber: '+1234567890', isBlocked: false, isFavorite: true },
      { _id: '2', name: 'Jane Smith', phoneNumber: '+1234567891', isBlocked: true, isFavorite: false },
    ])
  }, [fetchChats, initGBFeatures])

  // Deep link: /?chat=<id> or /?chat=<userId> (from a profile page)
  useEffect(() => {
    if (!chatIdFromUrl) return
    if (String(activeChat?._id) === String(chatIdFromUrl)) return
    if (resolvedDeepLinks.current.has(chatIdFromUrl)) return

    const existing = (chats || []).find(
      (chat) =>
        String(chat?._id) === String(chatIdFromUrl) ||
        chat?.participants?.some(
          (participant) =>
            String(participant?.user?._id || participant?.user || participant) === String(chatIdFromUrl)
        )
    )

    if (existing) {
      resolvedDeepLinks.current.add(chatIdFromUrl)
      setActiveChat(existing)
      return
    }

    let cancelled = false
    resolvedDeepLinks.current.add(chatIdFromUrl)
    createChat?.(chatIdFromUrl).then((chat) => {
      if (!cancelled && chat) setActiveChat(chat)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatIdFromUrl, chats.length])

  const selectChat = useCallback(
    (chat) => {
      closeSidebar?.()
      setActiveChat(chat)
      setSearchParams(chat?._id ? { chat: chat._id } : {}, { replace: true })
    },
    [closeSidebar, setActiveChat, setSearchParams]
  )

  const clearActiveChat = useCallback(() => {
    setActiveChat(null)
    setSearchParams({}, { replace: true })
  }, [setActiveChat, setSearchParams])

  const handleFABAction = (actionId) => {
    switch (actionId) {
      case 'new-chat':
        setShowNewChatModal(true)
        break
      case 'add-contact':
        setShowPermissions(true)
        break
      case 'app-permissions':
        setShowAppPermissions(true)
        break
      case 'starred-messages':
        setShowStarred(true)
        break
      case 'pinned-messages':
        setShowPinned(true)
        break
      default:
        break
    }
  }

  const showConversationOnMobile = Boolean(activeChat)

  return (
    <div className="flex h-full min-h-0 w-full bg-gray-100 dark:bg-gray-950">
      {/* ---------------- List pane ---------------- */}
      <section
        className={clsx(
          'flex-col h-full min-h-0 bg-white dark:bg-gray-900',
          'w-full lg:w-[380px] xl:w-[400px] lg:flex-shrink-0',
          'lg:border-r lg:border-gray-200/80 dark:lg:border-gray-800',
          showConversationOnMobile ? 'hidden lg:flex' : 'flex'
        )}
        aria-label="Conversations"
      >
        <ErrorBoundary>
          <StoryBar compact />
        </ErrorBoundary>
        <div className="flex-1 min-h-0">
          <ChatList onChatSelect={selectChat} />
        </div>
      </section>

      {/* ---------------- Conversation pane ---------------- */}
      <section
        className={clsx(
          'flex-1 min-w-0 min-h-0 flex-col h-full',
          showConversationOnMobile ? 'flex' : 'hidden lg:flex'
        )}
        aria-label="Conversation"
      >
        {activeChat ? (
          <ErrorBoundary>
            <ChatArea
              onBack={clearActiveChat}
              onInfoClick={() => setShowProfileDrawer(true)}
            />
          </ErrorBoundary>
        ) : (
          <HomeWelcome
            onNewChat={() => setShowNewChatModal(true)}
            onSelectChat={selectChat}
          />
        )}
      </section>

      {/* Floating quick actions (list view only) */}
      {!activeChat && <FeatureFAB onAction={handleFABAction} />}

      {/* Modals */}
      <ContactPermissions
        isOpen={showPermissions}
        onClose={() => setShowPermissions(false)}
        contacts={contacts}
      />
      {showStarred && <StarredMessages onClose={() => setShowStarred(false)} />}
      {showPinned && <PinnedMessages onClose={() => setShowPinned(false)} />}
      <NewChatModal isOpen={showNewChatModal} onClose={() => setShowNewChatModal(false)} />
      <AppPermissions isOpen={showAppPermissions} onClose={() => setShowAppPermissions(false)} />
      <ChatProfileDrawer
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        chat={activeChat}
      />
    </div>
  )
}

export default ChatPage
