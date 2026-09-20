import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
      
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      })

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id)
        newSocket.emit('user:online', user._id || user.id)
      })

      newSocket.on('users:online', (users) => {
        setOnlineUsers(users)
      })

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected')
      })

      socketRef.current = newSocket
      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
        socketRef.current = null
      }
    }
  }, [isAuthenticated, user])

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId?.toString())
  }

  const value = {
    socket,
    onlineUsers,
    isUserOnline,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
