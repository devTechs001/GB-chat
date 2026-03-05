import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  PhotoIcon,
  MicrophoneIcon,
  BellIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  SparklesIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: SparklesIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      articles: [
        { title: 'Creating your account', readTime: '3 min' },
        { title: 'Setting up your profile', readTime: '2 min' },
        { title: 'Adding contacts', readTime: '2 min' },
        { title: 'Sending your first message', readTime: '1 min' },
      ],
    },
    {
      id: 'messaging',
      name: 'Messaging',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      articles: [
        { title: 'Text messaging basics', readTime: '2 min' },
        { title: 'Sending photos and videos', readTime: '3 min' },
        { title: 'Voice messages', readTime: '2 min' },
        { title: 'Document sharing', readTime: '2 min' },
        { title: 'Message reactions', readTime: '1 min' },
      ],
    },
    {
      id: 'groups',
      name: 'Groups & Channels',
      icon: UserGroupIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      articles: [
        { title: 'Creating a group', readTime: '3 min' },
        { title: 'Group settings and management', readTime: '4 min' },
        { title: 'Creating channels', readTime: '3 min' },
        { title: 'Channel monetization', readTime: '5 min' },
      ],
    },
    {
      id: 'privacy',
      name: 'Privacy & Security',
      icon: ShieldCheckIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      articles: [
        { title: 'End-to-end encryption', readTime: '4 min' },
        { title: 'Two-factor authentication', readTime: '3 min' },
        { title: 'Privacy settings', readTime: '3 min' },
        { title: 'Blocking contacts', readTime: '2 min' },
        { title: 'Chat locking', readTime: '2 min' },
      ],
    },
    {
      id: 'calls',
      name: 'Calls & Video',
      icon: VideoCameraIcon,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
      articles: [
        { title: 'Making voice calls', readTime: '2 min' },
        { title: 'Video calling', readTime: '3 min' },
        { title: 'Group calls', readTime: '3 min' },
        { title: 'Call quality tips', readTime: '2 min' },
      ],
    },
    {
      id: 'media',
      name: 'Media & Files',
      icon: PhotoIcon,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      articles: [
        { title: 'Managing storage', readTime: '3 min' },
        { title: 'Gallery view', readTime: '2 min' },
        { title: 'File sharing limits', readTime: '1 min' },
        { title: 'Media auto-download', readTime: '2 min' },
      ],
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      articles: [
        { title: 'Notification settings', readTime: '2 min' },
        { title: 'Custom notifications', readTime: '2 min' },
        { title: 'Do Not Disturb mode', readTime: '2 min' },
        { title: 'Message reminders', readTime: '1 min' },
      ],
    },
    {
      id: 'devices',
      name: 'Linked Devices',
      icon: DevicePhoneMobileIcon,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      articles: [
        { title: 'Linking a device', readTime: '3 min' },
        { title: 'Managing linked devices', readTime: '2 min' },
        { title: 'Security best practices', readTime: '3 min' },
        { title: 'Troubleshooting sync issues', readTime: '4 min' },
      ],
    },
    {
      id: 'payments',
      name: 'Payments',
      icon: BanknotesIcon,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      articles: [
        { title: 'Setting up payments', readTime: '4 min' },
        { title: 'Sending money', readTime: '2 min' },
        { title: 'Payment security', readTime: '3 min' },
        { title: 'Transaction history', readTime: '2 min' },
      ],
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Cog6ToothIcon,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      articles: [
        { title: 'Account settings', readTime: '3 min' },
        { title: 'Appearance and themes', readTime: '2 min' },
        { title: 'Language settings', readTime: '1 min' },
        { title: 'Data and storage', readTime: '3 min' },
      ],
    },
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to Settings > Account > Change Password. If you\'ve forgotten your password, click "Forgot Password" on the login page and follow the instructions sent to your registered email address.',
    },
    {
      question: 'Can I use GBChat on multiple devices?',
      answer: 'Yes! GBChat supports linking up to 4 devices simultaneously. Go to Settings > Linked Devices to add new devices. Your messages will sync across all linked devices in real-time.',
    },
    {
      question: 'Are my messages encrypted?',
      answer: 'Absolutely! All messages in GBChat are protected with end-to-end encryption. This means only you and the person you\'re communicating with can read the messages. Not even GBChat can access your conversations.',
    },
    {
      question: 'How do I backup my chats?',
      answer: 'Go to Settings > Chats > Chat Backup to enable automatic backups. You can choose to backup daily, weekly, or monthly. Backups are stored securely and can be restored when you reinstall the app.',
    },
    {
      question: 'What is the file size limit for sharing?',
      answer: 'GBChat allows you to share files up to 2GB in size. This includes documents, videos, photos, and audio files. Large files are compressed intelligently to ensure fast sharing.',
    },
    {
      question: 'How do I create a channel?',
      answer: 'Channels are available for verified accounts. Go to the Channels tab, tap the "+" button, and select "Create Channel". You\'ll need to verify your identity before creating a channel.',
    },
    {
      question: 'Can I recover deleted messages?',
      answer: 'Deleted messages cannot be recovered. However, if you have a recent backup, you can restore your chat history which may include messages that were deleted after the backup was created.',
    },
    {
      question: 'How do I report a problem?',
      answer: 'Go to Settings > Help > Contact Us to report issues. You can also shake your device while in the app to quickly submit a bug report with diagnostic information.',
    },
  ];

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.articles.some(article => article.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
          <QuestionMarkCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          How can we help you?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Search for answers or browse our help categories
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl mx-auto">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for help articles, guides, FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow"
        />
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Browse Categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredCategories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              className={`p-4 rounded-xl border transition-all ${
                selectedCategory === category.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-700'
              }`}
            >
              <div className={`w-12 h-12 ${category.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                <category.icon className={`w-6 h-6 ${category.color}`} />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">{category.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {category.articles.length} articles
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Category Articles */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {(() => {
              const category = categories.find(c => c.id === selectedCategory);
              return (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center`}>
                        <category.icon className={`w-5 h-5 ${category.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {category.articles.map((article, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{article.title}</span>
                        </div>
                        <span className="text-xs text-gray-400">{article.readTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-blue-500" />
          Quick Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              1
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Use <kbd className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-xs">Ctrl + K</kbd> to quickly search messages
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              2
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Swipe left on a chat to quickly mute or archive conversations
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              3
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Long-press on messages to access reactions, reply, and forward options
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              4
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Enable chat lock in Settings &gt; Privacy to protect sensitive conversations
            </p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                    expandedFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-8 text-white text-center">
        <EnvelopeIcon className="w-12 h-12 mx-auto mb-4 opacity-80" />
        <h3 className="text-xl font-bold mb-2">Still need help?</h3>
        <p className="text-white/90 mb-6 max-w-md mx-auto">
          Our support team is here to assist you with any questions or issues you may have.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:support@gbchat.com"
            className="px-6 py-3 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            Email Support
          </a>
          <button className="px-6 py-3 bg-green-700/50 text-white rounded-lg font-medium hover:bg-green-700 transition-colors backdrop-blur-sm">
            Live Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
