import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline'

const ImageViewer = ({ src, alt, isOpen, onClose }) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const imgRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(prev => Math.max(0.5, Math.min(5, prev + delta)))
  }, [])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  const zoomIn = () => setScale(prev => Math.min(5, prev + 0.3))
  const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.3))
  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = alt || 'image'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(src, '_blank')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center select-none"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="Zoom out"
              >
                <MagnifyingGlassMinusIcon className="w-5 h-5" />
              </button>
              <span className="text-white/80 text-sm font-mono w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="Zoom in"
              >
                <MagnifyingGlassPlusIcon className="w-5 h-5" />
              </button>
              <button
                onClick={resetZoom}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="Reset zoom"
              >
                <ArrowsPointingOutIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="Download"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <motion.div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {src ? (
              <img
                ref={imgRef}
                src={src}
                alt={alt || 'Image'}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="w-48 h-48 bg-gray-800 rounded-xl flex items-center justify-center text-white/50">
                No image
              </div>
            )}
          </motion.div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
            {alt}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ImageViewer
