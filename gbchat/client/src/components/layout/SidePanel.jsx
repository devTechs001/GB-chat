import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SidePanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-800 shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Panel</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-gray-600 dark:text-gray-300">
          Side panel content goes here.
        </p>
      </div>
    </div>
  );
};

export default SidePanel;