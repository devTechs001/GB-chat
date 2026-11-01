import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * useGlobalShortcuts — a small, predictable key map for the app shell.
 *
 *   ⌘K / Ctrl+K   focus the conversation search (on /chats)
 *   Shift+?       open the shortcut sheet (dispatched as `gbchat:shortcuts`)
 *   Alt+1…5       go to Chats · Stories · Channels · Groups · Settings
 *   Alt+Backspace back
 *
 * Deliberately conservative: nothing fires while focus is in a text field, and
 * single-letter keys are never bound (they collide with typing).
 */
const ROUTES = {
  1: '/chats',
  2: '/stories',
  3: '/channels',
  4: '/groups',
  5: '/settings',
}

const isTyping = () => {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

const useGlobalShortcuts = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (event) => {
      const meta = event.metaKey || event.ctrlKey

      // ⌘K / Ctrl+K — search, from anywhere.
      if (meta && event.key.toLowerCase() === 'k') {
        const input = document.querySelector('[data-search-input="chats"]')
        if (input) {
          event.preventDefault()
          input.focus()
          input.select?.()
          return
        }
      }

      if (isTyping()) return

      // Alt + number — jump between the five primary destinations.
      if (event.altKey && !event.ctrlKey && !event.metaKey && ROUTES[event.key]) {
        event.preventDefault()
        navigate(ROUTES[event.key])
        return
      }

      if (event.altKey && event.key === 'Backspace') {
        event.preventDefault()
        navigate(-1)
        return
      }

      if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent('gbchat:shortcuts'))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])
}

export default useGlobalShortcuts
