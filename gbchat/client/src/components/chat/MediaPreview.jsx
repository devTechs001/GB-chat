import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ShareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const MediaPreview = ({ media, currentIndex = 0, onClose, onDelete }) => {
  const [index, setIndex] = useState(currentIndex)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const currentMedia = media[index]
  const isVideo = currentMedia?.type === 'video'
  const isImage = currentMedia?.type === 'image'

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case 'Escape':
          onClose()
          break
        case '+':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [index])

  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1)
      resetZoom()
    }
  }

  const handleNext = () => {
    if (index < media.length - 1) {
      setIndex(index + 1)
      resetZoom()
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 5))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5))
  }

  const resetZoom = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(currentMedia.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = currentMedia.name || `download.${currentMedia.type}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentMedia.name,
          url: currentMedia.url,
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    }
  }

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div>
              <h3 className="font-medium">{currentMedia?.name || 'Media'}</h3>
              <p className="text-sm text-white/70">
                {index + 1} of {media.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
              title="Download"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
            
            {navigator.share && (
              <button
                onClick={handleShare}
                className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                title="Share"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(currentMedia)}
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                title="Delete"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="h-full flex items-center justify-center p-16"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="max-w-full max-h-full"
          >
            {isImage ? (
              <img
                src={currentMedia.url}
                alt={currentMedia.name}
                className="max-w-full max-h-full object-contain select-none"
                style={{
                  transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                  cursor: zoom > 1 ? 'move' : 'default',
                  transition: isDragging ? 'none' : 'transform 0.2s',
                }}
                draggable={false}
              />
            ) : isVideo ? (
              <video
                src={currentMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-full"
                style={{
                  transform: `scale(${zoom})`,
                }}
              />
            ) : (
              <div className="text-white text-center">
                <p>Unsupported media type</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {media.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={index === 0}
            className={clsx(
              'absolute left-4 top-1/2 -translate-y-1/2',
              'p-3 rounded-full bg-black/50 text-white',
              'hover:bg-black/70 transition-colors',
              'disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            disabled={index === media.length - 1}
            className={clsx(
              'absolute right-4 top-1/2 -translate-y-1/2',
              'p-3 rounded-full bg-black/50 text-white',
              'hover:bg-black/70 transition-colors',
              'disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Controls */}
      {isImage && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur rounded-full px-4 py-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-2 hover:bg-white/10 rounded-lg text-white disabled:opacity-30"
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5" />
          </button>
          
          <span className="text-white text-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 5}
            className="p-2 hover:bg-white/10 rounded-lg text-white disabled:opacity-30"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-white/20 mx-2" />
          
          <button
            onClick={resetZoom}
            className="p-2 hover:bg-white/10 rounded-lg text-white"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto scrollbar-hide">
          {media.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setIndex(i)
                resetZoom()
              }}
              className={clsx(
                'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden',
                'border-2 transition-all',
                i === index
                  ? 'border-white scale-110'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <img
                src={item.thumbnail || item.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MediaPreview