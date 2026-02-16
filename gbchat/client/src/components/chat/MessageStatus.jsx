import React from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'

const MessageStatus = ({ status }) => {
  switch (status) {
    case 'sending':
      return (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )
    case 'sent':
      return <CheckIcon className="w-4 h-4" />
    case 'delivered':
      return (
        <div className="flex -space-x-1">
          <CheckIcon className="w-4 h-4" />
          <CheckIcon className="w-4 h-4" />
        </div>
      )
    case 'read':
      return <CheckCircleIcon className="w-4 h-4 text-blue-400" />
    case 'failed':
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    default:
      return null
  }
}

export default MessageStatus