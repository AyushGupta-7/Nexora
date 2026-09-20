import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import { getProfileById } from '../services/profileService'
import { sendRequest, acceptRequest, rejectRequest, removeConnection } from '../services/networkService'
import { getOrCreateConversation } from '../services/messageService'
import api from '../services/api'
import PostCard from '../components/home/PostCard'
import './ViewProfile.css'

const ViewProfile = () => {
  const { userId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('none')
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('about')

  const currentUserId = user?._id || user?.id

  // Redirect to own profile if viewing own userId
  useEffect(() => {
    if (userId === currentUserId) {
      navigate('/profile', { replace: true })
    }
  }, [userId, currentUserId, navigate])

  useEffect(() => {
    if (userId && userId !== currentUserId) {
      loadProfile()
      loadUserPosts()
    }
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await getProfileById(userId)
      if (response.success) {
        setProfile(response.profile)
        setConnectionStatus(response.connectionStatus || 'none')
      } else {
        setError('Failed to load profile')
      }
    } catch (err) {
      setError('User not found')
    } finally {
      setLoading(false)
    }
  }

  const loadUserPosts = async () => {
    try {
      setPostsLoading(true)
      const response = await api.get('/posts', { params: { author: userId } })
      if (response.data.success) {
        setPosts(response.data.posts || [])
      }
    } catch (err) {
      console.error('Failed to load posts:', err)
    } finally {
      setPostsLoading(false)
    }
  }

  const handleConnect = async () => {
    setActionLoading(true)
    try {
      await sendRequest(userId)
      setConnectionStatus('pending_sent')
    } catch (err) {
      console.error('Connect error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAccept = async () => {
    setActionLoading(true)
    try {
      await acceptRequest(userId)
      setConnectionStatus('connected')
    } catch (err) {
      console.error('Accept error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!window.confirm('Remove this connection?')) return
    setActionLoading(true)
    try {
      await removeConnection(userId)
      setConnectionStatus('none')
    } catch (err) {
      console.error('Remove error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleMessage = async () => {
    try {
      const response = await getOrCreateConversation(userId)
      if (response.success) {
        navigate(`/messages/${response.conversation._id}`)
      }
    } catch (err) {
      console.error('Message error:', err)
    }
  }

  const getConnectionButton = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <div className="vp-action-group">
            <button className="vp-btn vp-btn-secondary" onClick={handleMessage}>
              <span className="material-symbols-outlined">chat</span>
              Message
            </button>
            <button className="vp-btn vp-btn-ghost" onClick={handleRemove} disabled={actionLoading}>
              <span className="material-symbols-outlined">person_remove</span>
              Connected
            </button>
          </div>
        )
      case 'pending_sent':
        return (
          <div className="vp-action-group">
            <button className="vp-btn vp-btn-secondary" disabled>
              <span className="material-symbols-outlined">schedule</span>
              Pending
            </button>
            <button className="vp-btn vp-btn-ghost" onClick={handleRemove} disabled={actionLoading}>
              Withdraw
            </button>
          </div>
        )
      case 'pending_received':
        return (
          <div className="vp-action-group">
            <button className="vp-btn vp-btn-primary" onClick={handleAccept} disabled={actionLoading}>
              <span className="material-symbols-outlined">person_add</span>
              Accept
            </button>
            <button className="vp-btn vp-btn-ghost" onClick={handleRemove} disabled={actionLoading}>
              Decline
            </button>
          </div>
        )
      default:
        return (
          <div className="vp-action-group">
            <button className="vp-btn vp-btn-primary" onClick={handleConnect} disabled={actionLoading}>
              <span className="material-symbols-outlined">person_add</span>
              Connect
            </button>
            <button className="vp-btn vp-btn-secondary" onClick={handleMessage}>
              <span className="material-symbols-outlined">chat</span>
              Message
            </button>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="vp-page">
        <Navbar />
        <div className="vp-loading">
          <div className="loader"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="vp-page">
        <Navbar />
        <div className="vp-error">
          <span className="material-symbols-outlined">person_off</span>
          <h2>{error}</h2>
          <button className="vp-btn vp-btn-primary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    )
  }

  const userAvatar = profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'User')}&size=200&background=00dce3&color=041329`

  return (
    <div className="vp-page">
      <Navbar />
      <main className="vp-main">
        {/* Profile Header */}
        <section className="vp-header-card">
          <div
            className="vp-cover"
            style={{ backgroundImage: `url(${profile?.coverImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200'})` }}
          />
          <div className="vp-header-content">
            <div className="vp-avatar-wrapper">
              <img src={userAvatar} alt={profile?.fullName} className="vp-avatar" />
            </div>
            <div className="vp-header-info">
              <div className="vp-name-row">
                <h1 className="vp-name">{profile?.fullName}</h1>
              </div>
              <p className="vp-title">{profile?.title || 'Member'}</p>
              {profile?.location && (
                <div className="vp-location">
                  <span className="material-symbols-outlined">location_on</span>
                  {profile.location}
                </div>
              )}
              <div className="vp-skills-preview">
                {profile?.skills?.slice(0, 4).map((skill, idx) => (
                  <span key={idx} className="vp-skill-chip">{skill.name}</span>
                ))}
              </div>
            </div>
            <div className="vp-header-actions">
              {getConnectionButton()}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="vp-tabs">
          <button className={`vp-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
            About
          </button>
          <button className={`vp-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
            Activity ({posts.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="vp-content">
          {activeTab === 'about' && (
            <div className="vp-about-grid">
              {/* About */}
              {profile?.about && (
                <div className="vp-section-card">
                  <h3 className="vp-section-title">About</h3>
                  <p className="vp-about-text">{profile.about}</p>
                </div>
              )}

              {/* Skills */}
              {profile?.skills?.length > 0 && (
                <div className="vp-section-card">
                  <h3 className="vp-section-title">Skills</h3>
                  <div className="vp-skills-grid">
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className="vp-skill-tag">{skill.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {profile?.experiences?.length > 0 && (
                <div className="vp-section-card">
                  <h3 className="vp-section-title">Experience</h3>
                  <div className="vp-timeline">
                    {profile.experiences.map((exp, idx) => (
                      <div key={idx} className="vp-timeline-item">
                        <div className="vp-timeline-dot" />
                        <div className="vp-timeline-content">
                          <h4>{exp.position}</h4>
                          <p className="vp-company">{exp.company}</p>
                          {exp.location && <p className="vp-meta">{exp.location}</p>}
                          <p className="vp-meta">
                            {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                          </p>
                          {exp.description && <p className="vp-desc">{exp.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profile?.educations?.length > 0 && (
                <div className="vp-section-card">
                  <h3 className="vp-section-title">Education</h3>
                  <div className="vp-timeline">
                    {profile.educations.map((edu, idx) => (
                      <div key={idx} className="vp-timeline-item">
                        <div className="vp-timeline-dot" />
                        <div className="vp-timeline-content">
                          <h4>{edu.school}</h4>
                          <p className="vp-company">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                          <p className="vp-meta">
                            {edu.startDate} – {edu.endDate || 'Present'}
                          </p>
                          {edu.description && <p className="vp-desc">{edu.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!profile?.about && !profile?.skills?.length && !profile?.experiences?.length && !profile?.educations?.length && (
                <div className="vp-empty">
                  <span className="material-symbols-outlined">person</span>
                  <p>This user hasn't filled out their profile yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="vp-posts">
              {postsLoading ? (
                <div className="vp-loading-small"><div className="loader"></div></div>
              ) : posts.length === 0 ? (
                <div className="vp-empty">
                  <span className="material-symbols-outlined">post_add</span>
                  <p>No posts yet.</p>
                </div>
              ) : (
                posts.map(post => (
                  <PostCard key={post._id} post={post} onPostUpdated={loadUserPosts} />
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ViewProfile
