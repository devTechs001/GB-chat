import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  VideoCameraIcon,
  XMarkIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Modal from '../common/Modal';
import useCallStore from '../../store/useCallStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const NewCallModal = ({ isOpen, onClose }) => {
  const { initiateCall } = useCallStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [callType, setCallType] = useState('audio'); // audio or video

  // Sample contacts for demo
  const sampleContacts = [
    { _id: 'u1', name: 'John Doe', avatar: null, phone: '+1234567890', online: true },
    { _id: 'u2', name: 'Jane Smith', avatar: null, phone: '+0987654321', online: true },
    { _id: 'u3', name: 'Mike Johnson', avatar: null, phone: '+1122334455', online: false },
    { _id: 'u4', name: 'Sarah Wilson', avatar: null, phone: '+5566778899', online: true },
    { _id: 'u5', name: 'Alex Chen', avatar: null, phone: '+9988776655', online: false },
    { _id: 'u6', name: 'Emily Brown', avatar: null, phone: '+4433221100', online: true },
  ];

  const [contacts, setContacts] = useState(sampleContacts);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const handleStartCall = (user) => {
    initiateCall({ userId: user._id, type: callType });
    toast.success(`Starting ${callType} call with ${user.name}...`);
    onClose();
    setSearchQuery('');
  };

  const handleGroupCall = () => {
    toast.info('Group call feature coming soon');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="New Call">
      <div className="p-6">
        {/* Call Type Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCallType('audio')}
            className={clsx(
              'flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
              callType === 'audio'
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <PhoneIcon className="w-5 h-5" />
            Audio Call
          </button>
          <button
            onClick={() => setCallType('video')}
            className={clsx(
              'flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
              callType === 'video'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <VideoCameraIcon className="w-5 h-5" />
            Video Call
          </button>
        </div>

        {/* Group Call Button */}
        <button
          onClick={handleGroupCall}
          className="w-full mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-colors flex items-center justify-center gap-3"
        >
          <UserGroupIcon className="w-6 h-6 text-purple-500" />
          <span className="font-medium text-purple-700 dark:text-purple-300">Start Group Call</span>
        </button>

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

        {/* Contacts List */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <PhoneIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No contacts found</p>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-semibold text-lg">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartCall(contact)}
                    className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    title="Audio Call"
                  >
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleStartCall(contact, true)}
                    className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    title="Video Call"
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NewCallModal;
