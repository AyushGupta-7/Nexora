import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

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

  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`

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
          <Link to="/" className="nav-link active">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            Home
          </Link>
          <Link to="/jobs" className="nav-link">
            <span className="material-symbols-outlined">work</span>
            Jobs
          </Link>
          <Link to="/network" className="nav-link">
            <span className="material-symbols-outlined">hub</span>
            Network
          </Link>
          <Link to="/messages" className="nav-link">
            <span className="material-symbols-outlined">chat</span>
            Messages
          </Link>
          <Link to="/notifications" className="nav-link">
            <span className="material-symbols-outlined">notifications</span>
            Notifications
            <span className="notification-dot"></span>
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
                <div className="dropdown-header">
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
                  <button className="view-profile-btn">View Profile</button>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/settings" className="dropdown-item">Settings & Privacy</Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout-item">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar