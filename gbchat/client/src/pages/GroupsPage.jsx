import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, MessageCircle, Phone, VideoCamera, EllipsisHorizontal } from 'lucide-react';
import Button from '../components/common/Button';
import CreateGroup from '../components/groups/CreateGroup';
import GroupInfo from '../components/groups/GroupInfo';
import useChatStore from '../store/useChatStore';

const GroupsPage = () => {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  const { chats, fetchChats } = useChatStore();

  // Filter to get only group chats
  const groups = chats.filter(chat => chat.isGroup);

  useEffect(() => {
    fetchChats();
  }, []);

  const handleCreateGroupSuccess = (newGroup) => {
    // Refresh the chats to include the new group
    fetchChats();
    setIsCreateGroupOpen(false);
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setIsGroupInfoOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Groups</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateGroupOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          New Group
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div
                key={group._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                onClick={() => handleGroupClick(group)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 relative">
                    <img
                      src={group.avatar}
                      alt={group.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {group.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {group.lastMessageAt ? new Date(group.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {group.members?.length || 0} members • {group.lastMessage?.content || 'No messages yet'}
                      </p>
                      {group.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-500 rounded-full">
                          {group.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 p-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No groups yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                Create a group to start chatting with multiple people
              </p>
              <Button
                variant="primary"
                onClick={() => setIsCreateGroupOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Group
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <button
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsCreateGroupOpen(true)}
          >
            <Users className="w-6 h-6 text-primary-500 mb-1" />
            <span className="text-xs text-gray-700 dark:text-gray-300">New Group</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <MessageCircle className="w-6 h-6 text-primary-500 mb-1" />
            <span className="text-xs text-gray-700 dark:text-gray-300">Broadcast</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <EllipsisHorizontal className="w-6 h-6 text-primary-500 mb-1" />
            <span className="text-xs text-gray-700 dark:text-gray-300">Explore</span>
          </button>
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroup
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onSuccess={handleCreateGroupSuccess}
      />

      {/* Group Info Modal */}
      {selectedGroup && (
        <GroupInfo
          group={selectedGroup}
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          onUpdate={() => fetchChats()} // Refresh chats when group info is updated
        />
      )}
    </div>
  );
};

export default GroupsPage;