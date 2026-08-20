import React, { createContext, useState, useContext, useEffect } from 'react'
import { getCurrentUser, logout as logoutService } from '../services/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await getCurrentUser()
          if (response.success) {
            setUser(response.user)
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem('token')
            setIsAuthenticated(false)
            setUser(null)
          }
        } catch (error) {
          console.error('Auth error:', error)
          localStorage.removeItem('token')
          setIsAuthenticated(false)
          setUser(null)
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  const logout = () => {
    logoutService()
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}