import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './LeftSidebar.css'

const LeftSidebar = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`

  const groups = [
    { name: 'Advanced React Patterns', icon: 'terminal' },
    { name: 'Cloud Architecture Forum', icon: 'cloud' },
    { name: 'AI & Machine Learning', icon: 'memory' },
  ]

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <aside className="left-sidebar">
      {/* Profile Card - Clickable */}
      <div className="profile-card" onClick={handleProfileClick}>
        <div className="profile-cover">
          <div className="profile-cover-image"></div>
          <div className="profile-cover-overlay"></div>
        </div>
        <div className="profile-info">
          <div className="profile-avatar-large">
            <img src={userAvatar} alt={user?.fullName || 'User'} />
          </div>
          <h3 className="profile-name">
            {user?.fullName || 'User'}
            <span className="material-symbols-outlined profile-verified">verified</span>
          </h3>
          <p className="profile-title">{user?.title || 'Member'}</p>
        </div>
      </div>

      {/* Groups Widget */}
      <div className="groups-widget">
        <h4 className="widget-title">My Groups</h4>
        <div className="groups-list">
          {groups.map((group, index) => (
            <a key={index} href="#" className="group-item">
              <div className="group-icon">
                <span className="material-symbols-outlined">{group.icon}</span>
              </div>
              <span className="group-name">{group.name}</span>
            </a>
          ))}
        </div>
        <button className="view-all-btn">View All Groups</button>
      </div>
    </aside>
  )
}

export default LeftSidebar