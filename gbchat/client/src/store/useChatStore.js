import { create } from 'zustand'
import api from '../lib/api'
import toast from 'react-hot-toast'

// Sample data for development/demo
const sampleChats = [
  {
    _id: '1',
    name: 'John Doe',
    avatar: null,
    isGroup: false,
    isPinned: true,
    unreadCount: 2,
    lastMessage: {
      content: { text: 'Hey! How are you doing?' },
      type: 'text',
      createdAt: new Date().toISOString(),
      sender: { _id: 'user2', name: 'John Doe' }
    },
    lastMessageAt: new Date().toISOString(),
    participants: [{ user: { _id: 'user2', name: 'John Doe' } }]
  },
  {
    _id: '2',
    name: 'Jane Smith',
    avatar: null,
    isGroup: false,
    isPinned: false,
    unreadCount: 0,
    lastMessage: {
      content: { text: 'The project looks great! 🎉' },
      type: 'text',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      sender: { _id: 'user3', name: 'Jane Smith' }
    },
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    participants: [{ user: { _id: 'user3', name: 'Jane Smith' } }]
  },
  {
    _id: '3',
    name: 'Development Team',
    avatar: null,
    isGroup: true,
    isPinned: true,
    unreadCount: 5,
    lastMessage: {
      content: { text: 'Meeting at 3 PM today' },
      type: 'text',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      sender: { _id: 'user4', name: 'Mike Johnson' }
    },
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    participants: [
      { user: { _id: 'user4', name: 'Mike Johnson' } },
      { user: { _id: 'user5', name: 'Sarah Wilson' } }
    ],
    groupMembers: 8
  },
  {
    _id: '4',
    name: 'Family',
    avatar: null,
    isGroup: true,
    isPinned: false,
    unreadCount: 0,
    lastMessage: {
      content: { text: 'Don\'t forget dinner tonight!' },
      type: 'text',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      sender: { _id: 'user6', name: 'Mom' }
    },
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    participants: [{ user: { _id: 'user6', name: 'Mom' } }],
    groupMembers: 5
  },
  {
    _id: '5',
    name: 'Alex Chen',
    avatar: null,
    isGroup: false,
    isPinned: false,
    unreadCount: 0,
    lastMessage: {
      content: { text: 'Check out this photo!' },
      type: 'image',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      sender: { _id: 'user7', name: 'Alex Chen' }
    },
    lastMessageAt: new Date(Date.now() - 172800000).toISOString(),
    participants: [{ user: { _id: 'user7', name: 'Alex Chen' } }]
  }
]

const sampleMessages = [
  {
    _id: 'm1',
    chat: '1',
    content: { text: 'Hey! How are you doing?' },
    type: 'text',
    sender: { _id: 'user2', name: 'John Doe' },
    status: 'read',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'm2',
    chat: '1',
    content: { text: 'I\'m doing great, thanks for asking!' },
    type: 'text',
    sender: { _id: 'user1', name: 'You' },
    status: 'read',
    createdAt: new Date(Date.now() - 60000).toISOString()
  },
  {
    _id: 'm3',
    chat: '2',
    content: { text: 'The project looks great! 🎉' },
    type: 'text',
    sender: { _id: 'user3', name: 'Jane Smith' },
    status: 'read',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: 'm4',
    chat: '2',
    content: { text: 'Thanks Jane! Working on the final touches.' },
    type: 'text',
    sender: { _id: 'user1', name: 'You' },
    status: 'read',
    createdAt: new Date(Date.now() - 3500000).toISOString()
  },
  {
    _id: 'm5',
    chat: '3',
    content: { text: 'Meeting at 3 PM today' },
    type: 'text',
    sender: { _id: 'user4', name: 'Mike Johnson' },
    status: 'read',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    _id: 'm6',
    chat: '3',
    content: { text: 'I\'ll prepare the slides for the demo' },
    type: 'text',
    sender: { _id: 'user5', name: 'Sarah Wilson' },
    status: 'read',
    createdAt: new Date(Date.now() - 7100000).toISOString()
  },
  {
    _id: 'm7',
    chat: '3',
    content: { text: 'Sounds good, see you all there!' },
    type: 'text',
    sender: { _id: 'user1', name: 'You' },
    status: 'read',
    createdAt: new Date(Date.now() - 7000000).toISOString()
  },
  {
    _id: 'm8',
    chat: '4',
    content: { text: 'Don\'t forget dinner tonight!' },
    type: 'text',
    sender: { _id: 'user6', name: 'Mom' },
    status: 'read',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'm9',
    chat: '4',
    content: { text: 'What time should I be there?' },
    type: 'text',
    sender: { _id: 'user1', name: 'You' },
    status: 'read',
    createdAt: new Date(Date.now() - 86000000).toISOString()
  },
  {
    _id: 'm10',
    chat: '5',
    content: { text: 'Check out this photo!' },
    type: 'image',
    sender: { _id: 'user7', name: 'Alex Chen' },
    status: 'read',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    _id: 'm11',
    chat: '5',
    content: { text: 'Nice shot! Where was this taken?' },
    type: 'text',
    sender: { _id: 'user1', name: 'You' },
    status: 'read',
    createdAt: new Date(Date.now() - 172700000).toISOString()
  },
]

const sampleGroups = [
  {
    _id: 'g1',
    name: 'Development Team',
    description: 'Main development team for project collaboration, code reviews, and tech discussions',
    avatar: 'https://picsum.photos/seed/devteam/200/200.jpg',
    type: 'group',
    privacy: 'private',
    members: [
      { _id: 'user1', name: 'You', role: 'admin', avatar: 'https://picsum.photos/seed/you/100/100.jpg', online: true },
      { _id: 'user4', name: 'Mike Johnson', role: 'admin', avatar: 'https://picsum.photos/seed/mike/100/100.jpg', online: true },
      { _id: 'user5', name: 'Sarah Wilson', role: 'member', avatar: 'https://picsum.photos/seed/sarah/100/100.jpg', online: false },
      { _id: 'user6', name: 'Emily Brown', role: 'member', avatar: 'https://picsum.photos/seed/emily/100/100.jpg', online: true },
      { _id: 'user7', name: 'Alex Chen', role: 'member', avatar: 'https://picsum.photos/seed/alex/100/100.jpg', online: false },
      { _id: 'user9', name: 'David Kim', role: 'member', avatar: 'https://picsum.photos/seed/david/100/100.jpg', online: true },
      { _id: 'user10', name: 'Lisa Garcia', role: 'member', avatar: 'https://picsum.photos/seed/lisa/100/100.jpg', online: false },
      { _id: 'user11', name: 'Tom Wilson', role: 'member', avatar: 'https://picsum.photos/seed/tom/100/100.jpg', online: true }
    ],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    createdBy: { _id: 'user4', name: 'Mike Johnson' },
    isAdmin: true,
    isStarred: true,
    isMuted: false,
    isArchived: false,
    unreadCount: 5,
    messageCount: 1247,
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    lastMessage: {
      content: { text: 'Meeting at 3 PM today to discuss the new features rollout 🚀' },
      type: 'text',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      sender: { _id: 'user4', name: 'Mike Johnson' }
    },
    settings: {
      allowMemberAdd: true,
      allowMemberRemove: false,
      allowEditInfo: true,
      approveMembers: false,
      muteAll: false,
      allowReactions: true,
      allowPolls: true,
      allowEvents: true,
      allowFileSharing: true,
      allowVoiceMessages: true,
      allowVideoCalls: true,
      allowScreenShare: true,
      messageRetention: 'forever',
      maxMembers: 50,
      slowMode: 0,
      welcomeMessage: 'Welcome to the Development Team! 🎉 Please introduce yourself and check the pinned messages for important info.',
      groupRules: ['Be respectful and professional', 'Stay on topic - tech discussions only', 'No spam or self-promotion', 'Help others when you can'],
      tags: ['development', 'programming', 'team', 'tech'],
      location: 'San Francisco, CA',
      website: 'https://devteam.example.com'
    }
  },
  {
    _id: 'g2',
    name: 'Family',
    description: 'Our lovely family group for sharing memories, plans, and staying connected',
    avatar: 'https://picsum.photos/seed/family/200/200.jpg',
    type: 'group',
    privacy: 'private',
    members: [
      { _id: 'user1', name: 'You', role: 'member', avatar: 'https://picsum.photos/seed/you/100/100.jpg', online: true },
      { _id: 'user6', name: 'Mom', role: 'admin', avatar: 'https://picsum.photos/seed/mom/100/100.jpg', online: false },
      { _id: 'user7', name: 'Dad', role: 'admin', avatar: 'https://picsum.photos/seed/dad/100/100.jpg', online: true },
      { _id: 'user8', name: 'Sister', role: 'member', avatar: 'https://picsum.photos/seed/sister/100/100.jpg', online: false },
      { _id: 'user12', name: 'Brother', role: 'member', avatar: 'https://picsum.photos/seed/brother/100/100.jpg', online: true },
      { _id: 'user13', name: 'Grandma', role: 'member', avatar: 'https://picsum.photos/seed/grandma/100/100.jpg', online: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    createdBy: { _id: 'user6', name: 'Mom' },
    isAdmin: false,
    isStarred: true,
    isMuted: false,
    isArchived: false,
    unreadCount: 0,
    messageCount: 892,
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    lastMessage: {
      content: { text: "Don't forget dinner tonight! 🍕" },
      type: 'text',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      sender: { _id: 'user6', name: 'Mom' }
    },
    settings: {
      allowMemberAdd: true,
      allowMemberRemove: false,
      allowEditInfo: false,
      approveMembers: false,
      muteAll: false,
      allowReactions: true,
      allowPolls: false,
      allowEvents: true,
      allowFileSharing: true,
      allowVoiceMessages: true,
      allowVideoCalls: false,
      allowScreenShare: false,
      messageRetention: '1year',
      maxMembers: 20,
      slowMode: 0,
      welcomeMessage: 'Welcome to the family group! ❤️',
      groupRules: ['Be kind to each other', 'Share family updates', 'No arguing about politics'],
      tags: ['family', 'personal'],
      location: 'New York, NY'
    }
  },
  {
    _id: 'g3',
    name: 'Tech Enthusiasts',
    description: 'Public group for tech news, discussions, and networking',
    avatar: 'https://picsum.photos/seed/tech/200/200.jpg',
    type: 'channel',
    privacy: 'public',
    members: [
      { _id: 'user1', name: 'You', role: 'member', avatar: 'https://picsum.photos/seed/you/100/100.jpg', online: true },
      { _id: 'user14', name: 'Tech Guru', role: 'admin', avatar: 'https://picsum.photos/seed/guru/100/100.jpg', online: true },
      { _id: 'user15', name: 'DevOps Expert', role: 'moderator', avatar: 'https://picsum.photos/seed/devops/100/100.jpg', online: false },
      { _id: 'user16', name: 'AI Researcher', role: 'member', avatar: 'https://picsum.photos/seed/ai/100/100.jpg', online: true },
      { _id: 'user17', name: 'Cloud Architect', role: 'member', avatar: 'https://picsum.photos/seed/cloud/100/100.jpg', online: false },
      { _id: 'user18', name: 'Security Specialist', role: 'member', avatar: 'https://picsum.photos/seed/security/100/100.jpg', online: true },
      { _id: 'user19', name: 'Data Scientist', role: 'member', avatar: 'https://picsum.photos/seed/data/100/100.jpg', online: false },
      { _id: 'user20', name: 'Frontend Dev', role: 'member', avatar: 'https://picsum.photos/seed/frontend/100/100.jpg', online: true },
      { _id: 'user21', name: 'Backend Dev', role: 'member', avatar: 'https://picsum.photos/seed/backend/100/100.jpg', online: false },
      { _id: 'user22', name: 'Mobile Dev', role: 'member', avatar: 'https://picsum.photos/seed/mobile/100/100.jpg', online: true },
      { _id: 'user23', name: 'Game Developer', role: 'member', avatar: 'https://picsum.photos/seed/game/100/100.jpg', online: false },
      { _id: 'user24', name: 'Blockchain Dev', role: 'member', avatar: 'https://picsum.photos/seed/blockchain/100/100.jpg', online: true }
    ],
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    createdBy: { _id: 'user14', name: 'Tech Guru' },
    isAdmin: false,
    isStarred: false,
    isMuted: true,
    isArchived: false,
    unreadCount: 0,
    messageCount: 3456,
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    lastMessage: {
      content: { text: 'New AI breakthrough announced! Check out the latest research paper 📄' },
      type: 'text',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      sender: { _id: 'user16', name: 'AI Researcher' }
    },
    settings: {
      allowMemberAdd: true,
      allowMemberRemove: false,
      allowEditInfo: false,
      approveMembers: true,
      muteAll: false,
      allowReactions: true,
      allowPolls: true,
      allowEvents: true,
      allowFileSharing: true,
      allowVoiceMessages: false,
      allowVideoCalls: false,
      allowScreenShare: false,
      messageRetention: '30days',
      maxMembers: 1000,
      slowMode: 30,
      welcomeMessage: 'Welcome to Tech Enthusiasts! 🚀 Share your tech knowledge and learn from others.',
      groupRules: ['No spam', 'Stay on tech topics', 'Be respectful', 'Share credible sources'],
      tags: ['technology', 'programming', 'ai', 'innovation'],
      website: 'https://techenthusiasts.example.com'
    }
  },
  {
    _id: 'g4',
    name: 'Project Alpha Updates',
    description: 'Critical project updates and announcements (read-only for members)',
    avatar: 'https://picsum.photos/seed/alpha/200/200.jpg',
    type: 'broadcast',
    privacy: 'private',
    members: [
      { _id: 'user1', name: 'You', role: 'member', avatar: 'https://picsum.photos/seed/you/100/100.jpg', online: true },
      { _id: 'user25', name: 'Project Manager', role: 'admin', avatar: 'https://picsum.photos/seed/pm/100/100.jpg', online: true },
      { _id: 'user26', name: 'Team Lead', role: 'admin', avatar: 'https://picsum.photos/seed/lead/100/100.jpg', online: false },
      { _id: 'user27', name: 'Stakeholder 1', role: 'member', avatar: 'https://picsum.photos/seed/stake1/100/100.jpg', online: false },
      { _id: 'user28', name: 'Stakeholder 2', role: 'member', avatar: 'https://picsum.photos/seed/stake2/100/100.jpg', online: true },
      { _id: 'user29', name: 'Client Rep', role: 'member', avatar: 'https://picsum.photos/seed/client/100/100.jpg', online: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    createdBy: { _id: 'user25', name: 'Project Manager' },
    isAdmin: false,
    isStarred: false,
    isMuted: false,
    isArchived: false,
    unreadCount: 2,
    messageCount: 156,
    lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    lastMessage: {
      content: { text: '🚀 Project Alpha Phase 2 completed successfully! Deployment scheduled for next week.' },
      type: 'text',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      sender: { _id: 'user25', name: 'Project Manager' }
    },
    settings: {
      allowMemberAdd: false,
      allowMemberRemove: false,
      allowEditInfo: false,
      approveMembers: true,
      muteAll: true,
      allowReactions: false,
      allowPolls: false,
      allowEvents: false,
      allowFileSharing: false,
      allowVoiceMessages: false,
      allowVideoCalls: false,
      allowScreenShare: false,
      messageRetention: 'forever',
      maxMembers: 100,
      slowMode: 0,
      welcomeMessage: 'Welcome to Project Alpha Updates - Important announcements only',
      groupRules: ['This is a broadcast channel', 'Only admins can post', 'No replies allowed'],
      tags: ['project', 'alpha', 'updates', 'critical'],
      location: 'Remote'
    }
  },
  {
    _id: 'g5',
    name: 'Gaming Community',
    description: 'Gamers unite! Share tips, tricks, and organize gaming sessions',
    avatar: 'https://picsum.photos/seed/gaming/200/200.jpg',
    type: 'group',
    privacy: 'public',
    members: [
      { _id: 'user1', name: 'You', role: 'admin', avatar: 'https://picsum.photos/seed/you/100/100.jpg', online: true },
      { _id: 'user30', name: 'Pro Gamer', role: 'moderator', avatar: 'https://picsum.photos/seed/pro/100/100.jpg', online: true },
      { _id: 'user31', name: 'Casual Player', role: 'member', avatar: 'https://picsum.photos/seed/casual/100/100.jpg', online: false },
      { _id: 'user32', name: 'RPG Fan', role: 'member', avatar: 'https://picsum.photos/seed/rpg/100/100.jpg', online: true },
      { _id: 'user33', name: 'FPS Master', role: 'member', avatar: 'https://picsum.photos/seed/fps/100/100.jpg', online: false },
      { _id: 'user34', name: 'Strategy Expert', role: 'member', avatar: 'https://picsum.photos/seed/strategy/100/100.jpg', online: true },
      { _id: 'user35', name: 'Indie Lover', role: 'member', avatar: 'https://picsum.photos/seed/indie/100/100.jpg', online: false },
      { _id: 'user36', name: 'Retro Gamer', role: 'member', avatar: 'https://picsum.photos/seed/retro/100/100.jpg', online: true }
    ],
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    createdBy: { _id: 'user1', name: 'You' },
    isAdmin: true,
    isStarred: false,
    isMuted: false,
    isArchived: false,
    unreadCount: 12,
    messageCount: 2341,
    lastMessageAt: new Date(Date.now() - 900000).toISOString(),
    lastMessage: {
      content: { text: 'Who\'s up for a raid tonight at 8 PM? 🎮' },
      type: 'text',
      createdAt: new Date(Date.now() - 900000).toISOString(),
      sender: { _id: 'user30', name: 'Pro Gamer' }
    },
    settings: {
      allowMemberAdd: true,
      allowMemberRemove: false,
      allowEditInfo: true,
      approveMembers: false,
      muteAll: false,
      allowReactions: true,
      allowPolls: true,
      allowEvents: true,
      allowFileSharing: true,
      allowVoiceMessages: true,
      allowVideoCalls: true,
      allowScreenShare: true,
      messageRetention: '30days',
      maxMembers: 500,
      slowMode: 0,
      welcomeMessage: 'Welcome to Gaming Community! 🎮 Level up your gaming experience!',
      groupRules: ['Be respectful to all players', 'No cheating discussions', 'Share gaming tips', 'Have fun!'],
      tags: ['gaming', 'community', 'fun', 'multiplayer'],
      website: 'https://gaming.example.com'
    }
  },
  {
    _id: 'g6',
    name: 'Book Club',
    description: 'Monthly book discussions and recommendations',
    avatar: 'https://picsum.photos/seed/books/200/200.jpg',
    type: 'group',
    privacy: 'public',
    members: [
      { _id: 'user1', name: 'You', role: 'member', avatar: 'https://picsum.photos/seed/you/100/100.jpg', online: true },
      { _id: 'user37', name: 'Book Worm', role: 'admin', avatar: 'https://picsum.photos/seed/worm/100/100.jpg', online: false },
      { _id: 'user38', name: 'Literature Lover', role: 'member', avatar: 'https://picsum.photos/seed/literature/100/100.jpg', online: true },
      { _id: 'user39', name: 'Poetry Fan', role: 'member', avatar: 'https://picsum.photos/seed/poetry/100/100.jpg', online: false },
      { _id: 'user40', name: 'SciFi Reader', role: 'member', avatar: 'https://picsum.photos/seed/scifi/100/100.jpg', online: true }
    ],
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    createdBy: { _id: 'user37', name: 'Book Worm' },
    isAdmin: false,
    isStarred: true,
    isMuted: false,
    isArchived: false,
    unreadCount: 0,
    messageCount: 567,
    lastMessageAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastMessage: {
      content: { text: 'This month\'s book selection is "The Midnight Library" 📚' },
      type: 'text',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      sender: { _id: 'user37', name: 'Book Worm' }
    },
    settings: {
      allowMemberAdd: true,
      allowMemberRemove: false,
      allowEditInfo: false,
      approveMembers: false,
      muteAll: false,
      allowReactions: true,
      allowPolls: true,
      allowEvents: true,
      allowFileSharing: false,
      allowVoiceMessages: false,
      allowVideoCalls: false,
      allowScreenShare: false,
      messageRetention: '1year',
      maxMembers: 100,
      slowMode: 0,
      welcomeMessage: 'Welcome to Book Club! 📚 Happy reading!',
      groupRules: ['No spoilers without warning', 'Be respectful of opinions', 'Share book recommendations'],
      tags: ['books', 'reading', 'literature', 'discussion'],
      location: 'Online'
    }
  },
  {
    _id: 'g7',
    name: 'Fitness Motivation',
    description: 'Workout tips, progress sharing, and motivation',
    avatar: 'https://picsum.photos/seed/fitness/200/200.jpg',
    type: 'group',
    privacy: 'public',
    members: [
      { _id: 'user1', name: 'You', role: 'member', avatar: 'https://picsum.photos/seed/you/100/100.jpg', online: true },
      { _id: 'user41', name: 'Fitness Coach', role: 'admin', avatar: 'https://picsum.photos/seed/coach/100/100.jpg', online: false },
      { _id: 'user42', name: 'Yoga Instructor', role: 'moderator', avatar: 'https://picsum.photos/seed/yoga/100/100.jpg', online: true },
      { _id: 'user43', name: 'Runner', role: 'member', avatar: 'https://picsum.photos/seed/runner/100/100.jpg', online: false },
      { _id: 'user44', name: 'Weightlifter', role: 'member', avatar: 'https://picsum.photos/seed/weights/100/100.jpg', online: true }
    ],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    createdBy: { _id: 'user41', name: 'Fitness Coach' },
    isAdmin: false,
    isStarred: false,
    isMuted: true,
    isArchived: false,
    unreadCount: 0,
    messageCount: 423,
    lastMessageAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastMessage: {
      content: { text: 'Morning workout complete! 💪 Who else exercised today?' },
      type: 'text',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      sender: { _id: 'user42', name: 'Yoga Instructor' }
    },
    settings: {
      allowMemberAdd: true,
      allowMemberRemove: false,
      allowEditInfo: false,
      approveMembers: false,
      muteAll: false,
      allowReactions: true,
      allowPolls: true,
      allowEvents: true,
      allowFileSharing: true,
      allowVoiceMessages: false,
      allowVideoCalls: false,
      allowScreenShare: false,
      messageRetention: '30days',
      maxMembers: 200,
      slowMode: 0,
      welcomeMessage: 'Welcome to Fitness Motivation! 💪 Let\'s get fit together!',
      groupRules: ['Be encouraging', 'Share fitness tips', 'No body shaming', 'Celebrate progress'],
      tags: ['fitness', 'health', 'workout', 'motivation'],
      location: 'Gym'
    }
  },
  {
    _id: 'g8',
    name: 'Archived Work Group',
    description: 'Old project team - archived for reference',
    avatar: 'https://picsum.photos/seed/archived/200/200.jpg',
    type: 'group',
    privacy: 'private',
    members: [
      { _id: 'user1', name: 'You', role: 'member', avatar: 'https://picsum.photos/seed/you/100/100.jpg', online: true },
      { _id: 'user45', name: 'Former Manager', role: 'admin', avatar: 'https://picsum.photos/seed/former/100/100.jpg', online: false },
      { _id: 'user46', name: 'Former Colleague', role: 'member', avatar: 'https://picsum.photos/seed/colleague/100/100.jpg', online: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 365).toISOString(),
    createdBy: { _id: 'user45', name: 'Former Manager' },
    isAdmin: false,
    isStarred: false,
    isMuted: true,
    isArchived: true,
    unreadCount: 0,
    messageCount: 89,
    lastMessageAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    lastMessage: {
      content: { text: 'Project completed successfully! 🎉' },
      type: 'text',
      createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
      sender: { _id: 'user45', name: 'Former Manager' }
    },
    settings: {
      allowMemberAdd: false,
      allowMemberRemove: false,
      allowEditInfo: false,
      approveMembers: false,
      muteAll: true,
      allowReactions: false,
      allowPolls: false,
      allowEvents: false,
      allowFileSharing: false,
      allowVoiceMessages: false,
      allowVideoCalls: false,
      allowScreenShare: false,
      messageRetention: '1year',
      maxMembers: 10,
      slowMode: 0,
      welcomeMessage: 'This group is archived',
      groupRules: ['Read-only access'],
      tags: ['archived', 'completed', 'reference'],
      location: 'Archive'
    }
  }
]

const sampleAnnouncements = [
  {
    _id: 'a1',
    groupId: 'g1',
    title: '🚀 New Feature Release',
    content: 'We are excited to announce the release of our new real-time collaboration features! This includes live code sharing, improved video calls, and enhanced file sharing capabilities.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    createdBy: { _id: 'user4', name: 'Mike Johnson' },
    likes: 12,
    comments: 5
  }
]

const samplePolls = [
  {
    _id: 'p1',
    groupId: 'g1',
    question: 'What should be our next sprint focus?',
    options: [
      { _id: 'o1', text: 'Performance Optimization', votes: 8 },
      { _id: 'o2', text: 'New Features Development', votes: 12 },
      { _id: 'o3', text: 'Bug Fixes', votes: 6 }
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    createdBy: { _id: 'user4', name: 'Mike Johnson' }
  }
]

const sampleEvents = [
  {
    _id: 'e1',
    groupId: 'g1',
    title: 'Sprint Planning Meeting',
    description: 'Quarterly sprint planning session to discuss goals.',
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    startTime: '14:00',
    endTime: '16:00',
    location: 'Conference Room A'
  }
]

const useChatStore = create((set, get) => ({
  // State
  chats: sampleChats,
  messages: sampleMessages,
  groups: sampleGroups,
  announcements: sampleAnnouncements,
  polls: samplePolls,
  events: sampleEvents,
  currentChat: null,
  activeChat: null,
  activeTab: 'chats',
  loading: false,
  error: null,
  unreadCounts: {},
  onlineUsers: {},
  typingUsers: {},
  
  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setActiveChat: (chat) => set({ activeChat: chat, currentChat: chat }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Fetch functions
  fetchChats: async () => {
    set({ loading: true, error: null })
    try {
      // In a real app, this would be an API call
      // For now, we'll use the sample data
      set({ chats: sampleChats, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  fetchMessages: async (chatId) => {
    try {
      const { data } = await api.get(`/messages/${chatId}`)
      const msgs = Array.isArray(data) ? data : (data.messages || [])
      if (msgs.length > 0) {
        set(state => {
          const otherMessages = state.messages.filter(m => {
            const mChatId = m.chat?._id || m.chat?.id || m.chat
            return String(mChatId) !== String(chatId)
          })
          return { messages: [...otherMessages, ...msgs] }
        })
        return msgs
      }
    } catch (error) {
      console.log('[ChatStore] API fetchMessages failed, using sample messages')
    }
    const chatMessages = (sampleMessages || []).filter(msg => {
      const mChatId = msg.chat?._id || msg.chat?.id || msg.chat
      return String(mChatId) === String(chatId)
    })
    if (chatMessages.length > 0) {
      set(state => {
        const otherMessages = state.messages.filter(m => {
          const mChatId = m.chat?._id || m.chat?.id || m.chat
          return String(mChatId) !== String(chatId)
        })
        return { messages: [...otherMessages, ...chatMessages] }
      })
    }
    return chatMessages
  },
  
  createChat: async (userId) => {
    try {
      const { data } = await api.post('/chats', { participantId: userId })
      const chat = {
        _id: data._id || data.id,
        name: data.name || data.participants?.find(p => String(p.user?._id || p.user) !== String(get().user?._id))?.user?.fullName || 'New Chat',
        avatar: data.avatar || null,
        isGroup: data.type === 'group',
        isPinned: false,
        unreadCount: 0,
        lastMessage: null,
        lastMessageAt: data.createdAt || new Date().toISOString(),
        participants: data.participants || [],
      }
      set(state => {
        if (state.chats.find(c => c._id === chat._id)) return state
        return { chats: [chat, ...state.chats] }
      })
      set({ activeChat: chat, currentChat: chat })
      return chat
    } catch (error) {
      console.log('[ChatStore] API createChat failed, creating locally')
      const chat = {
        _id: `chat_${Date.now()}`,
        name: 'New Chat',
        avatar: null,
        isGroup: false,
        isPinned: false,
        unreadCount: 0,
        lastMessage: null,
        lastMessageAt: new Date().toISOString(),
        participants: [{ user: { _id: userId, fullName: 'User' } }],
      }
      set(state => ({ chats: [chat, ...state.chats], activeChat: chat, currentChat: chat }))
      return chat
    }
  },

  sendMessage: async (chatId, content, attachments = [], replyTo = null) => {
    try {
      let messageType = 'text'
      let messageContent = { text: content }

      if (attachments.length > 0) {
        const firstFile = attachments[0]
        if (firstFile.type?.startsWith('image/')) {
          messageType = 'image'
          messageContent = { text: content, image: firstFile.url || firstFile.dataURL }
        } else if (firstFile.type?.startsWith('video/')) {
          messageType = 'video'
          messageContent = { text: content, video: firstFile.url || firstFile.dataURL }
        } else if (firstFile.type?.startsWith('audio/') || firstFile.isVoice) {
          messageType = 'voice'
          messageContent = { text: content, audio: firstFile.url || firstFile.dataURL, duration: firstFile.duration }
        } else {
          messageType = 'document'
          messageContent = { text: content, file: firstFile.url || firstFile.dataURL, fileName: firstFile.name }
        }
      }

      const newMessage = {
        _id: `m${Date.now()}`,
        chat: chatId,
        content: messageContent,
        type: messageType,
        sender: { _id: 'user1', name: 'You' },
        status: 'sent',
        createdAt: new Date().toISOString(),
        replyTo: replyTo ? {
          _id: replyTo._id,
          content: replyTo.content,
          sender: replyTo.sender,
        } : null,
      }
      
      set(state => ({
        messages: [...state.messages, newMessage]
      }))
      
      try {
        await api.post(`/messages/${chatId}`, { content: messageContent, type: messageType, replyTo: replyTo?._id })
      } catch (apiError) {
        console.log('[ChatStore] API send failed, message saved locally')
      }
      
      return newMessage
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
  
  createGroup: async (groupData) => {
    try {
      const newGroup = {
        _id: `g${Date.now()}`,
        ...groupData,
        createdAt: new Date().toISOString(),
        members: [{ _id: 'user1', name: 'You', role: 'admin', avatar: 'https://picsum.photos/seed/you/100/100.jpg' }]
      }
      
      set(state => ({
        groups: [...state.groups, newGroup]
      }))
      
      return newGroup
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
  
  updateGroup: async (groupId, updates) => {
    try {
      set(state => ({
        groups: state.groups.map(group =>
          group._id === groupId ? { ...group, ...updates } : group
        )
      }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
  
  deleteGroup: async (groupId) => {
    try {
      set(state => ({
        groups: state.groups.filter(group => group._id !== groupId)
      }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
  
  // Poll actions
  createPoll: async (pollData) => {
    try {
      const newPoll = {
        _id: `p${Date.now()}`,
        ...pollData,
        createdAt: new Date().toISOString(),
        voted: false,
        voters: []
      }
      
      set(state => ({
        polls: [...state.polls, newPoll]
      }))
      
      return newPoll
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
  
  votePoll: async (pollId, optionId) => {
    try {
      set(state => ({
        polls: state.polls.map(poll => {
          if (poll._id === pollId) {
            return {
              ...poll,
              voted: true,
              options: poll.options.map(option =>
                option._id === optionId 
                  ? { ...option, votes: option.votes + 1, voted: true }
                  : option
              )
            }
          }
          return poll
        })
      }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
  
  // Event actions
  createEvent: async (eventData) => {
    try {
      const newEvent = {
        _id: `e${Date.now()}`,
        ...eventData,
        createdAt: new Date().toISOString(),
        attendees: [{ _id: 'user1', name: 'You', status: 'going' }],
        isCreator: true,
        rsvp: 'going'
      }
      
      set(state => ({
        events: [...state.events, newEvent]
      }))
      
      return newEvent
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
  
  rsvpEvent: async (eventId, status) => {
    try {
      set(state => ({
        events: state.events.map(event => {
          if (event._id === eventId) {
            return {
              ...event,
              rsvp: status,
              attendees: event.attendees.map(attendee =>
                attendee._id === 'user1' 
                  ? { ...attendee, status }
                  : attendee
              )
            }
          }
          return event
        })
      }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
  
  // Announcement actions
  createAnnouncement: async (announcementData) => {
    try {
      const newAnnouncement = {
        _id: `a${Date.now()}`,
        ...announcementData,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0
      }
      
      set(state => ({
        announcements: [...state.announcements, newAnnouncement]
      }))
      
      return newAnnouncement
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  }
}))

export default useChatStore
