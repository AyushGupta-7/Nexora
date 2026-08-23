import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import ProfileHeader from '../components/profile/ProfileHeader'
import AboutSection from '../components/profile/AboutSection'
import SkillsSection from '../components/profile/SkillsSection'
import ExperienceSection from '../components/profile/ExperienceSection'
import EducationSection from '../components/profile/EducationSection'
import ActivitySection from '../components/profile/ActivitySection'
import { getProfile, updateProfile } from '../services/profileService'
import './Profile.css'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await getProfile()
      if (response.success) {
        setProfile(response.profile)
      } else {
        setError('Failed to load profile')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await updateProfile(updatedData)
      if (response.success) {
        setProfile(response.profile)
        return { success: true }
      }
      return { success: false, message: response.message }
    } catch (err) {
      return { success: false, message: 'Failed to update profile' }
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-loading">
          <div className="loader"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-error">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-main">
        <div className="profile-grid">
          {/* Profile Header */}
          <ProfileHeader 
            profile={profile} 
            user={user} 
            onUpdate={handleUpdateProfile} 
          />

          {/* Bento Grid */}
          <div className="profile-bento-grid">
            {/* Left Column */}
            <div className="profile-left-column">
              <AboutSection 
                profile={profile} 
                onUpdate={handleUpdateProfile} 
              />
              <SkillsSection 
                profile={profile} 
                onUpdate={handleUpdateProfile} 
              />
            </div>

            {/* Right Column */}
            <div className="profile-right-column">
              <ExperienceSection 
                profile={profile} 
                onUpdate={handleUpdateProfile} 
              />
              <EducationSection 
                profile={profile} 
                onUpdate={handleUpdateProfile} 
              />
            </div>
          </div>

          {/* Activity Section - Full Width */}
          <ActivitySection 
            profile={profile} 
            user={user}
            onUpdate={handleUpdateProfile} 
          />
        </div>
      </main>
    </div>
  )
}

export default Profile