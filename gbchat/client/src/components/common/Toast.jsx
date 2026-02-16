import React from 'react'
import { Toaster as HotToaster } from 'react-hot-toast'

const Toast = () => {
  return (
    <HotToaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            background: '#10b981',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: '#ef4444',
          },
        },
        loading: {
          iconTheme: {
            primary: '#0ea5e9',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}

export default Toast