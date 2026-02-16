class SoundManager {
  constructor() {
    this.sounds = {}
    this.enabled = true
    this.volume = 0.5
    this.loadSounds()
  }

  loadSounds() {
    // Define sound paths
    const soundPaths = {
      notification: '/sounds/notification.mp3',
      messageSent: '/sounds/message-sent.mp3',
      messageReceived: '/sounds/message-received.mp3',
      callIncoming: '/sounds/call-incoming.mp3',
      callOutgoing: '/sounds/call-outgoing.mp3',
      callBusy: '/sounds/call-busy.mp3',
      callEnded: '/sounds/call-ended.mp3',
      typing: '/sounds/typing.mp3',
      screenshot: '/sounds/screenshot.mp3',
    }

    // Preload sounds
    Object.entries(soundPaths).forEach(([key, path]) => {
      const audio = new Audio(path)
      audio.volume = this.volume
      audio.preload = 'auto'
      
      // Handle errors silently
      audio.addEventListener('error', () => {
        console.warn(`Failed to load sound: ${path}`)
      })
      
      this.sounds[key] = audio
    })
  }

  play(soundName) {
    if (!this.enabled) return

    const sound = this.sounds[soundName]
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`)
      return
    }

    // Reset and play
    sound.currentTime = 0
    sound.play().catch((error) => {
      console.warn(`Failed to play sound: ${soundName}`, error)
    })
  }

  playNotification() {
    this.play('notification')
  }

  playMessageSent() {
    this.play('messageSent')
  }

  playMessageReceived() {
    this.play('messageReceived')
  }

  playCallIncoming() {
    const sound = this.sounds.callIncoming
    if (sound) {
      sound.loop = true
      sound.play().catch(console.warn)
    }
  }

  stopCallIncoming() {
    const sound = this.sounds.callIncoming
    if (sound) {
      sound.pause()
      sound.currentTime = 0
      sound.loop = false
    }
  }

  playCallOutgoing() {
    const sound = this.sounds.callOutgoing
    if (sound) {
      sound.loop = true
      sound.play().catch(console.warn)
    }
  }

  stopCallOutgoing() {
    const sound = this.sounds.callOutgoing
    if (sound) {
      sound.pause()
      sound.currentTime = 0
      sound.loop = false
    }
  }

  playCallBusy() {
    this.play('callBusy')
  }

  playCallEnded() {
    this.play('callEnded')
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = this.volume
    })
  }

  setEnabled(enabled) {
    this.enabled = enabled
    if (!enabled) {
      this.stopAll()
    }
  }

  stopAll() {
    Object.values(this.sounds).forEach((sound) => {
      sound.pause()
      sound.currentTime = 0
    })
  }

  mute() {
    this.setEnabled(false)
  }

  unmute() {
    this.setEnabled(true)
  }
}

export default new SoundManager()