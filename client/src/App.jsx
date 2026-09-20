import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import ViewProfile from './pages/ViewProfile'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import Network from './pages/Network'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Resumes from './pages/Resumes'
import Applications from './pages/Applications'
import { useAuth } from './context/AuthContext'
import './App.css'

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public Route wrapper (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return !isAuthenticated ? children : <Navigate to="/" replace />
}

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="app">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/jobs/:jobId" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/resumes" element={<ProtectedRoute><Resumes /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App