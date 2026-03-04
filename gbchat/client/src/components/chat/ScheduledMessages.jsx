import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Send, X, Check, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ScheduledMessages = ({ chatId, onClose }) => {
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    fetchScheduledMessages();
  }, []);

  const fetchScheduledMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gb-features/scheduled', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScheduledMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching scheduled messages:', error);
      toast.error('Failed to load scheduled messages');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMessage = async () => {
    if (!messageText.trim() || !scheduledDate || !scheduledTime) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

      await axios.post(
        '/api/gb-features/schedule',
        {
          chatId,
          message: messageText,
          scheduledTime: scheduledDateTime.toISOString()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Message scheduled successfully!');
      setMessageText('');
      setScheduledDate('');
      setScheduledTime('');
      setShowScheduleModal(false);
      fetchScheduledMessages();
    } catch (error) {
      toast.error('Failed to schedule message');
    }
  };

  const handleCancelSchedule = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/gb-features/cancel-schedule',
        { messageId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Scheduled message cancelled');
      fetchScheduledMessages();
    } catch (error) {
      toast.error('Failed to cancel scheduled message');
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Scheduled Messages
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            </div>
          ) : scheduledMessages.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No scheduled messages
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Schedule a message to send it later
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                >
                  <p className="text-gray-900 dark:text-white text-sm mb-2">
                    {msg.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {formatDateTime(msg.scheduledTime)}
                    </div>
                    <button
                      onClick={() => handleCancelSchedule(msg._id)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Schedule New Message
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm mx-4 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Schedule Message
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Message
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-2 border dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleMessage}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledMessages;
