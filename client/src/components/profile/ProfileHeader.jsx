import React, { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { uploadAvatar, uploadCover } from '../../services/profileService'
import './ProfileHeader.css'

const ProfileHeader = ({ profile, user, onUpdate }) => {
  const { setUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || user?.fullName || '',
    title: profile?.title || user?.title || '',
    location: profile?.location || '',
    about: profile?.about || '',
  })
  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)

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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    setLoading(true)
    try {
      const response = await uploadAvatar(formData)
      if (response.success) {
        // Update user context
        setUser(prev => ({ ...prev, avatar: response.avatar }))
        // Update local profile
        if (onUpdate) {
          onUpdate({ avatar: response.avatar })
        }
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      alert('Failed to upload avatar')
    } finally {
      setLoading(false)
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('cover', file)

    setLoading(true)
    try {
      const response = await uploadCover(formData)
      if (response.success) {
        if (onUpdate) {
          onUpdate({ coverImage: response.coverImage })
        }
      }
    } catch (error) {
      console.error('Cover upload error:', error)
      alert('Failed to upload cover image')
    } finally {
      setLoading(false)
    }
  }

  const userAvatar = profile?.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`
  const userFullName = profile?.fullName || user?.fullName || 'User'
  const userTitle = profile?.title || user?.title || 'Member'
  const userLocation = profile?.location || ''

  return (
    <section className="profile-header-card">
      {/* Cover Image */}
      <div className="profile-header-cover">
        <div 
          className="profile-header-cover-image"
          style={{ 
            backgroundImage: `url(${profile?.coverImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200'})` 
          }}
        ></div>
        <button 
          className="profile-cover-edit-btn"
          onClick={() => coverInputRef.current?.click()}
          disabled={loading}
        >
          <span className="material-symbols-outlined">edit</span>
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Profile Details */}
      <div className="profile-details">
        <div className="profile-avatar-wrapper">
          <img 
            src={userAvatar} 
            alt={userFullName} 
            className="profile-avatar-large"
          />
          <button 
            className="profile-avatar-edit-btn"
            onClick={() => avatarInputRef.current?.click()}
            disabled={loading}
          >
            <span className="material-symbols-outlined">camera_alt</span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className="profile-header-info">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <input
                type="text"
                name="fullName"
                className="profile-edit-input"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
              />
              <input
                type="text"
                name="title"
                className="profile-edit-input"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
              />
              <input
                type="text"
                name="location"
                className="profile-edit-input"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
              />
              <div className="profile-edit-actions">
                <button type="button" className="profile-edit-cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="profile-edit-save">
                  Save
                </button>
              </div>
            </form>
          ) : (
            <>
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
              <button className="profile-edit-info-btn" onClick={() => setIsEditing(true)}>
                <span className="material-symbols-outlined">edit</span>
                Edit Profile
              </button>
            </>
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