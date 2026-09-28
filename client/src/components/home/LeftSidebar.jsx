import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getConnections } from '../../services/networkService'
import './LeftSidebar.css'

const LeftSidebar = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [topConnects, setTopConnects] = useState([])
  const [connectsLoading, setConnectsLoading] = useState(true)

  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=00dce3&color=041329`

  useEffect(() => {
    loadTopConnects()
  }, [])

  const loadTopConnects = async () => {
    setConnectsLoading(true)
    try {
      const res = await getConnections()
      if (res.success && Array.isArray(res.connections)) {
        // Sort by most recently connected, take top 2
        const sorted = [...res.connections].sort(
          (a, b) => new Date(b.connectedAt) - new Date(a.connectedAt)
        )
        setTopConnects(sorted.slice(0, 2))
      }
    } catch (err) {
      // Silent fail — empty state will show
    } finally {
      setConnectsLoading(false)
    }
  }

  const avatarUrl = (name, src) =>
    src || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=00dce3&color=041329`

  return (
    <aside className="left-sidebar">
      {/* Profile Card - Clickable */}
      <div className="profile-card" onClick={() => navigate('/profile')}>
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

      {/* Top Connects Widget */}
      <div className="groups-widget">
        <h4 className="widget-title">Top Connects</h4>

        {connectsLoading ? (
          <div className="top-connects-loading">
            <div className="top-connect-skeleton" />
            <div className="top-connect-skeleton" />
          </div>
        ) : topConnects.length === 0 ? (
          <p className="top-connects-empty">
            Connect with developers and professionals to grow your network.
          </p>
        ) : (
          <div className="top-connects-list">
            {topConnects.map(({ user: connect }) => (
              <div
                key={connect._id}
                className="top-connect-card"
                onClick={() => navigate(`/profile/${connect._id}`)}
                title={`View ${connect.fullName}'s profile`}
              >
                <div className="top-connect-avatar">
                  <img src={avatarUrl(connect.fullName, connect.avatar)} alt={connect.fullName} />
                </div>
                <div className="top-connect-info">
                  <span className="top-connect-name">{connect.fullName}</span>
                  <span className="top-connect-title">{connect.title || 'Member'}</span>
                </div>
                <span className="material-symbols-outlined top-connect-arrow">chevron_right</span>
              </div>
            ))}
          </div>
        )}

        <button className="view-all-btn" onClick={() => navigate('/network')}>
          View All Connections
        </button>
      </div>
    </aside>
  )
}

export default LeftSidebar