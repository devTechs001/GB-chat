# Sound Assets

Place your sound files in this directory.

## Required Sound Files

1. **notification.mp3** - Default notification sound
2. **message-sent.mp3** - Sound when message is sent
3. **message-received.mp3** - Sound when message is received
4. **call-incoming.mp3** - Incoming call ringtone
5. **call-outgoing.mp3** - Outgoing call ringtone
6. **call-busy.mp3** - Call busy tone
7. **call-ended.mp3** - Call ended tone
8. **typing.mp3** - Typing indicator sound (optional)
9. **screenshot.mp3** - Screenshot captured sound

## Sound Format
- Format: MP3 or OGG
- Bitrate: 128kbps recommended
- Duration: 1-3 seconds for notification sounds, longer for ringtones

## Usage
Import sounds in your components:
```javascript
import notificationSound from '@/assets/sounds/notification.mp3'

const audio = new Audio(notificationSound)
audio.play()

Free Sound Resources
https://freesound.org/
https://mixkit.co/free-sound-effects/
https://soundbible.com/