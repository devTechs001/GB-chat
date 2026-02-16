import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

const useAuth = (requireAuth = true) => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate('/auth')
    }
  }, [isLoading, isAuthenticated, requireAuth, navigate])

  return {
    user,
    isAuthenticated,
    isLoading,
  }
}

export default useAuth