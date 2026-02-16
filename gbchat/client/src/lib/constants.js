export const APP_NAME = 'GBChat'
export const APP_VERSION = '1.0.0'

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  VOICE: 'voice',
  LOCATION: 'location',
  CONTACT: 'contact',
  POLL: 'poll',
}

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
}

export const CALL_TYPES = {
  AUDIO: 'audio',
  VIDEO: 'video',
}

export const CALL_STATUS = {
  RINGING: 'ringing',
  ONGOING: 'ongoing',
  ENDED: 'ended',
  MISSED: 'missed',
  REJECTED: 'rejected',
}

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
}

export const MEDIA_QUALITY = {
  AUTO: 'auto',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  DOCUMENT: 20 * 1024 * 1024, // 20MB
  AUDIO: 10 * 1024 * 1024, // 10MB
}

export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
}

export const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🎉']

export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  CALL: 'call',
  GROUP_INVITE: 'group_invite',
  MENTION: 'mention',
  REACTION: 'reaction',
}

export const PRIVACY_SETTINGS = {
  EVERYONE: 'everyone',
  CONTACTS: 'contacts',
  NOBODY: 'nobody',
}

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Messages
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_UPDATE: 'message:update',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_REACT: 'message:react',
  
  // Typing
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  
  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USERS_ONLINE: 'users:online',
  
  // Calls
  CALL_INITIATE: 'call:initiate',
  CALL_ACCEPT: 'call:accept',
  CALL_REJECT: 'call:reject',
  CALL_END: 'call:end',
  CALL_ICE_CANDIDATE: 'call:ice-candidate',
  
  // Groups
  GROUP_UPDATE: 'group:update',
  GROUP_MEMBER_ADD: 'group:member-add',
  GROUP_MEMBER_REMOVE: 'group:member-remove',
}

export default {
  APP_NAME,
  APP_VERSION,
  MESSAGE_TYPES,
  MESSAGE_STATUS,
  CALL_TYPES,
  CALL_STATUS,
  USER_STATUS,
  MEDIA_QUALITY,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  EMOJI_REACTIONS,
  NOTIFICATION_TYPES,
  PRIVACY_SETTINGS,
  SOCKET_EVENTS,
}