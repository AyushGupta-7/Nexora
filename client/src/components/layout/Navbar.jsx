import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getNotifications } from '../../services/notificationService'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/') ? 'nav-link active' : 'nav-link'
  const isExactActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

  // Fetch unread notification count on mount and every 60s
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getNotifications()
      if (response.success) {
        setUnreadCount(response.unreadCount || 0)
      }
    } catch (err) {
      // Non-blocking
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 60000)
      return () => clearInterval(interval)
    }
  }, [user, fetchUnreadCount])

  // Reset unread count when visiting notifications page
  useEffect(() => {
    if (location.pathname === '/notifications') {
      setUnreadCount(0)
    }
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleViewProfile = () => {
    setDropdownOpen(false)
    navigate('/profile')
  }

  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=00dce3&color=041329`

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo & Search */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">Nexora</Link>
          <div className="navbar-search">
            <span className="material-symbols-outlined search-icon">search</span>
            <input type="text" className="search-input" placeholder="Search network..." />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="navbar-center">
          <Link to="/" className={isExactActive('/')}>
            <span className="material-symbols-outlined" style={location.pathname === '/' ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
            Home
          </Link>
          <Link to="/jobs" className={isActive('/jobs')}>
            <span className="material-symbols-outlined" style={location.pathname.startsWith('/jobs') ? { fontVariationSettings: "'FILL' 1" } : {}}>work</span>
            Jobs
          </Link>
          <Link to="/network" className={isExactActive('/network')}>
            <span className="material-symbols-outlined" style={location.pathname === '/network' ? { fontVariationSettings: "'FILL' 1" } : {}}>hub</span>
            Network
          </Link>
          <Link to="/messages" className={isActive('/messages')}>
            <span className="material-symbols-outlined" style={location.pathname.startsWith('/messages') ? { fontVariationSettings: "'FILL' 1" } : {}}>chat</span>
            Messages
          </Link>
          <Link to="/notifications" className={isExactActive('/notifications')} style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={location.pathname === '/notifications' ? { fontVariationSettings: "'FILL' 1" } : {}}>notifications</span>
            Notifications
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </Link>
        </nav>

        {/* User Menu */}
        <div className="navbar-right">
          <button className="mobile-search-btn">
            <span className="material-symbols-outlined">search</span>
          </button>
          <div className="user-menu" ref={dropdownRef}>
            <div className="user-menu-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="user-avatar">
                <img src={userAvatar} alt={user?.fullName || 'User'} />
              </div>
              <span className="material-symbols-outlined dropdown-arrow">arrow_drop_down</span>
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header clickable" onClick={handleViewProfile}>
                  <div className="dropdown-avatar">
                    <img src={userAvatar} alt={user?.fullName || 'User'} />
                  </div>
                  <div className="dropdown-user-info">
                    <div className="dropdown-user-name">
                      {user?.fullName || 'User'}
                      <span className="material-symbols-outlined verified-icon">verified</span>
                    </div>
                    <span className="dropdown-user-title">{user?.title || 'Member'}</span>
                  </div>
                </div>

                <div className="dropdown-profile-btn">
                  <button className="view-profile-btn" onClick={handleViewProfile}>
                    View Profile
                  </button>
                </div>

                <div className="dropdown-divider"></div>
                <Link to="/resumes" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="material-symbols-outlined">description</span>
                  My Resumes
                </Link>
                <Link to="/applications" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="material-symbols-outlined">list_alt</span>
                  Applications
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout-item">
                  <span className="material-symbols-outlined">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar