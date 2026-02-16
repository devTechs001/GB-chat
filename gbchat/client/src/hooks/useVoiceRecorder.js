import { useState, useRef, useCallback, useEffect } from 'react'

const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioURL, setAudioURL] = useState(null)
  const [waveform, setWaveform] = useState([])
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const intervalRef = useRef(null)
  const analyzerRef = useRef(null)
  const streamRef = useRef(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
      
      streamRef.current = stream
      
      // Create analyzer for waveform
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(stream)
      const analyzer = audioContext.createAnalyser()
      analyzer.fftSize = 256
      source.connect(analyzer)
      analyzerRef.current = analyzer
      
      // Create media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        setAudioBlob(audioBlob)
        setAudioURL(URL.createObjectURL(audioBlob))
      }
      
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setDuration(0)
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
        
        // Update waveform
        if (analyzerRef.current) {
          const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
          analyzerRef.current.getByteFrequencyData(dataArray)
          const normalized = Array.from(dataArray).map(val => val / 255)
          setWaveform(normalized.slice(0, 40)) // Show 40 bars
        }
      }, 100)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to access microphone. Please check permissions.')
    }
  }, [])
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Stop all tracks
      streamRef.current?.getTracks().forEach(track => track.stop())
      
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording])
  
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      clearInterval(intervalRef.current)
    }
  }, [isRecording])
  
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 100)
    }
  }, [])
  
  const cancelRecording = useCallback(() => {
    stopRecording()
    setAudioBlob(null)
    setAudioURL(null)
    setDuration(0)
    setWaveform([])
  }, [stopRecording])
  
  const formatDuration = useCallback(() => {
    const minutes = Math.floor(duration / 600)
    const seconds = Math.floor((duration % 600) / 10)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [duration])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [audioURL])
  
  return {
    isRecording,
    duration,
    audioBlob,
    audioURL,
    waveform,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    formatDuration,
  }
}

export default useVoiceRecorder