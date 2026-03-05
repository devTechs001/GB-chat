import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  UserGroupIcon,
  XMarkIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Modal from '../common/Modal';
import useChatStore from '../../store/useChatStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const NewChatModal = ({ isOpen, onClose }) => {
  const { chats, createChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sample contacts for demo
  const sampleContacts = [
    { _id: 'u1', name: 'John Doe', avatar: null, phone: '+1234567890' },
    { _id: 'u2', name: 'Jane Smith', avatar: null, phone: '+0987654321' },
    { _id: 'u3', name: 'Mike Johnson', avatar: null, phone: '+1122334455' },
    { _id: 'u4', name: 'Sarah Wilson', avatar: null, phone: '+5566778899' },
    { _id: 'u5', name: 'Alex Chen', avatar: null, phone: '+9988776655' },
    { _id: 'u6', name: 'Emily Brown', avatar: null, phone: '+4433221100' },
  ];

  const [contacts, setContacts] = useState(sampleContacts);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const handleSelectUser = (user) => {
    if (selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setLoading(true);
    try {
      // For single user, create direct chat
      if (selectedUsers.length === 1) {
        await createChat(selectedUsers[0]._id);
        toast.success('Chat created successfully');
      } else {
        // For multiple users, would create group (handled separately)
        toast.success('Creating group chat...');
      }
      onClose();
      setSelectedUsers([]);
      setSearchQuery('');
    } catch (error) {
      toast.error('Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => {
    toast.info('Group creation feature coming soon');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="New Chat">
      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            className={clsx(
              'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
              'bg-green-500 text-white'
            )}
          >
            New Chat
          </button>
          <button
            onClick={handleCreateGroup}
            className={clsx(
              'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
              'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            New Group
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedUsers.map(user => (
              <span
                key={user._id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm"
              >
                {user.name}
                <button
                  onClick={() => handleSelectUser(user)}
                  className="hover:bg-green-200 dark:hover:bg-green-900/50 rounded-full p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Contacts List */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <UserPlusIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No contacts found</p>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleSelectUser(contact)}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors',
                  selectedUsers.find(u => u._id === contact._id)
                    ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phone}</p>
                </div>
                {selectedUsers.find(u => u._id === contact._id) && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleCreateChat}
            loading={loading}
            disabled={selectedUsers.length === 0}
          >
            Start Chat
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewChatModal;
