import React, { useState } from 'react'
import './EducationSection.css'

const EducationSection = ({ profile, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [educations, setEducations] = useState(profile?.educations || [])
  const [formData, setFormData] = useState({
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: '',
    activities: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.school || !formData.degree) return
    
    const updatedEducations = [...educations, { ...formData, id: Date.now() }]
    const result = await onUpdate({ educations: updatedEducations })
    if (result.success) {
      setEducations(updatedEducations)
      setFormData({
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        description: '',
        activities: ''
      })
      setIsAdding(false)
    }
  }

  const handleRemove = async (id) => {
    const updatedEducations = educations.filter(edu => edu.id !== id)
    const result = await onUpdate({ educations: updatedEducations })
    if (result.success) {
      setEducations(updatedEducations)
    }
  }

  return (
    <section className="education-section">
      <div className="education-header">
        <h2 className="education-title">Education</h2>
        <div className="education-header-actions">
          <button 
            className="education-add-btn"
            onClick={() => setIsAdding(!isAdding)}
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="education-edit-btn">
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>
      </div>

      <div className="education-list">
        {educations.map((edu) => (
          <div key={edu.id} className="education-item">
            <div className="education-item-icon">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div className="education-item-content">
              <h3 className="education-item-school">{edu.school}</h3>
              <p className="education-item-degree">{edu.degree} in {edu.field}</p>
              <p className="education-item-date">
                {edu.startDate} - {edu.endDate}
              </p>
              {edu.description && (
                <p className="education-item-description">{edu.description}</p>
              )}
              {edu.activities && (
                <p className="education-item-activities">
                  <strong>Activities:</strong> {edu.activities}
                </p>
              )}
            </div>
            <button 
              className="education-item-remove"
              onClick={() => handleRemove(edu.id)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="education-add-form">
          <input
            type="text"
            name="school"
            className="education-add-input"
            placeholder="School/University"
            value={formData.school}
            onChange={handleChange}
          />
          <input
            type="text"
            name="degree"
            className="education-add-input"
            placeholder="Degree"
            value={formData.degree}
            onChange={handleChange}
          />
          <input
            type="text"
            name="field"
            className="education-add-input"
            placeholder="Field of Study"
            value={formData.field}
            onChange={handleChange}
          />
          <div className="education-add-dates">
            <input
              type="date"
              name="startDate"
              className="education-add-input"
              placeholder="Start Date"
              value={formData.startDate}
              onChange={handleChange}
            />
            <input
              type="date"
              name="endDate"
              className="education-add-input"
              placeholder="End Date"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
          <textarea
            name="description"
            className="education-add-textarea"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
          />
          <textarea
            name="activities"
            className="education-add-textarea"
            placeholder="Activities and societies"
            value={formData.activities}
            onChange={handleChange}
            rows={2}
          />
          <div className="education-add-actions">
            <button className="education-add-cancel" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button 
              className="education-add-submit" 
              onClick={handleSubmit}
              disabled={!formData.school || !formData.degree}
            >
              Add Education
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default EducationSection