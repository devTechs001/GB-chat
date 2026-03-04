import React, { useState, useEffect } from 'react';
import { Pin, MessageSquare, Calendar, Trash2, ExternalLink, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PinnedMessages = ({ onClose }) => {
  const navigate = useNavigate();
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatMap, setChatMap] = useState({});

  useEffect(() => {
    fetchPinnedMessages();
  }, []);

  const fetchPinnedMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gb-features/pinned', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPinnedMessages(response.data.data);
      
      // Fetch chat details for each pinned message
      const chatIds = [...new Set(response.data.data.map(msg => msg.chatId))];
      const chatDetails = {};
      
      for (const chatId of chatIds) {
        try {
          const chatResponse = await axios.get(`/api/chats/${chatId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          chatDetails[chatId] = chatResponse.data.data;
        } catch (error) {
          chatDetails[chatId] = { name: 'Unknown Chat' };
        }
      }
      
      setChatMap(chatDetails);
    } catch (error) {
      console.error('Error fetching pinned messages:', error);
      toast.error('Failed to load pinned messages');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpinMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/gb-features/unpin',
        { messageId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Message unpinned');
      fetchPinnedMessages();
    } catch (error) {
      toast.error('Failed to unpin message');
    }
  };

  const handleNavigateToChat = (chatId, messageId) => {
    navigate(`/chat?chatId=${chatId}&messageId=${messageId}`);
    onClose?.();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Pin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pinned Messages
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pinnedMessages.length} messages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            </div>
          ) : pinnedMessages.length === 0 ? (
            <div className="text-center py-12">
              <Pin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No pinned messages
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Pin important messages to keep them at the top
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pinnedMessages.map((item) => {
                const chat = chatMap[item.chatId] || { name: 'Unknown Chat' };
                
                return (
                  <div
                    key={item._id}
                    className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {chat.name}
                          </span>
                        </div>
                        <p className="text-gray-900 dark:text-white text-sm mb-2 break-words">
                          {item.messageId?.text || 'Media message'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.pinnedAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleNavigateToChat(item.chatId, item.messageId?._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          title="Open in chat"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUnpinMessage(item.messageId?._id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          title="Unpin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinnedMessages;
