import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect(token, userId) {
    if (this.socket?.connected) {
      console.log('Socket already connected')
      return this.socket
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      query: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.setupDefaultListeners()
    return this.socket
  }

  setupDefaultListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
    })
  }

  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not connected')
      return
    }

    this.socket.on(event, callback)
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (!this.socket) return

    if (callback) {
      this.socket.off(event, callback)
      
      // Remove from listeners map
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    } else {
      this.socket.off(event)
      this.listeners.delete(event)
    }
  }

  emit(event, data, callback) {
    if (!this.socket?.connected) {
      console.error('Socket not connected')
      return
    }

    if (callback) {
      this.socket.emit(event, data, callback)
    } else {
      this.socket.emit(event, data)
    }
  }

  disconnect() {
    if (this.socket) {
      // Remove all listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          this.socket.off(event, callback)
        })
      })
      this.listeners.clear()

      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected() {
    return this.socket?.connected || false
  }

  getSocket() {
    return this.socket
  }
}

export default new SocketService()