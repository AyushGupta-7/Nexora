import React, { useState } from 'react'
import './AboutSection.css'

const AboutSection = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(profile?.about || '')

  const handleSubmit = async () => {
    const result = await onUpdate({ about: content })
    if (result.success) {
      setIsEditing(false)
    }
  }

  return (
    <section className="about-section">
      <div className="about-header">
        <h2 className="about-title">About</h2>
        <button 
          className="about-edit-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          <span className="material-symbols-outlined">edit</span>
        </button>
      </div>

      {isEditing ? (
        <div className="about-edit">
          <textarea
            className="about-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Tell us about yourself..."
          />
          <div className="about-edit-actions">
            <button className="about-cancel-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button className="about-save-btn" onClick={handleSubmit}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="about-content">
          {profile?.about ? (
            <p>{profile.about}</p>
          ) : (
            <p className="about-empty">No about information added yet.</p>
          )}
        </div>
      )}
    </section>
  )
}

export default AboutSection