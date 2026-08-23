import React, { useState } from 'react'
import './ProfileHeader.css'

const ProfileHeader = ({ profile, user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || user?.fullName || '',
    title: profile?.title || user?.title || '',
    location: profile?.location || '',
    about: profile?.about || '',
    avatar: profile?.avatar || user?.avatar || '',
    coverImage: profile?.coverImage || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await onUpdate(formData)
    if (result.success) {
      setIsEditing(false)
    }
  }

  const userAvatar = profile?.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`
  const userFullName = profile?.fullName || user?.fullName || 'User'
  const userTitle = profile?.title || user?.title || 'Member'
  const userLocation = profile?.location || ''

  return (
    <section className="profile-header-card">
      {/* Cover Image - Changed className from profile-cover to profile-header-cover */}
      <div className="profile-header-cover">
        <div 
          className="profile-header-cover-image"
          style={{ 
            backgroundImage: `url(${profile?.coverImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200'})` 
          }}
        ></div>
        <button className="profile-cover-edit-btn">
          <span className="material-symbols-outlined">edit</span>
        </button>
      </div>

      {/* Profile Details */}
      <div className="profile-details">
        <div className="profile-avatar-wrapper">
          <img 
            src={userAvatar} 
            alt={userFullName} 
            className="profile-avatar-large"
          />
        </div>

        <div className="profile-info">
          <h1 className="profile-name">
            {userFullName}
            <span className="material-symbols-outlined profile-verified-badge">check_circle</span>
          </h1>
          <p className="profile-title-text">{userTitle}</p>
          {userLocation && (
            <div className="profile-location">
              <span className="material-symbols-outlined">location_on</span>
              {userLocation}
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button className="profile-open-to-btn">
            Open to
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>
          <button className="profile-add-section-btn">
            Add profile section
          </button>
          <button className="profile-more-btn">More</button>
        </div>
      </div>
    </section>
  )
}

export default ProfileHeader