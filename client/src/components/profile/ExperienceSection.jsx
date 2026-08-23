import React, { useState } from 'react'
import './ExperienceSection.css'

const ExperienceSection = ({ profile, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [experiences, setExperiences] = useState(profile?.experiences || [])
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    logo: ''
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.company || !formData.position) return
    
    const updatedExperiences = [...experiences, { ...formData, id: Date.now() }]
    const result = await onUpdate({ experiences: updatedExperiences })
    if (result.success) {
      setExperiences(updatedExperiences)
      setFormData({
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        logo: ''
      })
      setIsAdding(false)
    }
  }

  const handleRemove = async (id) => {
    const updatedExperiences = experiences.filter(exp => exp.id !== id)
    const result = await onUpdate({ experiences: updatedExperiences })
    if (result.success) {
      setExperiences(updatedExperiences)
    }
  }

  return (
    <section className="experience-section">
      <div className="experience-header">
        <h2 className="experience-title">Experience</h2>
        <div className="experience-header-actions">
          <button 
            className="experience-add-btn"
            onClick={() => setIsAdding(!isAdding)}
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="experience-edit-btn">
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>
      </div>

      <div className="experience-timeline">
        {experiences.map((exp) => (
          <div key={exp.id} className="experience-item">
            <div className="experience-item-line"></div>
            <div className="experience-item-content">
              <div className="experience-item-header">
                <div className="experience-item-logo">
                  {exp.logo ? (
                    <img src={exp.logo} alt={exp.company} />
                  ) : (
                    <span className="material-symbols-outlined">business</span>
                  )}
                </div>
                <div className="experience-item-info">
                  <h3 className="experience-item-position">{exp.position}</h3>
                  <p className="experience-item-company">{exp.company} · Full-time</p>
                  <p className="experience-item-date">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </p>
                  {exp.location && (
                    <p className="experience-item-location">
                      <span className="material-symbols-outlined">location_on</span>
                      {exp.location} · Hybrid
                    </p>
                  )}
                  {exp.description && (
                    <ul className="experience-item-description">
                      {exp.description.split('\n').map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <button 
                  className="experience-item-remove"
                  onClick={() => handleRemove(exp.id)}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="experience-add-form">
          <input
            type="text"
            name="company"
            className="experience-add-input"
            placeholder="Company name"
            value={formData.company}
            onChange={handleChange}
          />
          <input
            type="text"
            name="position"
            className="experience-add-input"
            placeholder="Position"
            value={formData.position}
            onChange={handleChange}
          />
          <input
            type="text"
            name="location"
            className="experience-add-input"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
          />
          <div className="experience-add-dates">
            <input
              type="date"
              name="startDate"
              className="experience-add-input"
              placeholder="Start Date"
              value={formData.startDate}
              onChange={handleChange}
            />
            <input
              type="date"
              name="endDate"
              className="experience-add-input"
              placeholder="End Date"
              value={formData.endDate}
              onChange={handleChange}
              disabled={formData.current}
            />
          </div>
          <label className="experience-add-current">
            <input
              type="checkbox"
              name="current"
              checked={formData.current}
              onChange={handleChange}
            />
            I currently work here
          </label>
          <textarea
            name="description"
            className="experience-add-textarea"
            placeholder="Description (one per line)"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
          <div className="experience-add-actions">
            <button className="experience-add-cancel" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button 
              className="experience-add-submit" 
              onClick={handleSubmit}
              disabled={!formData.company || !formData.position}
            >
              Add Experience
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default ExperienceSection