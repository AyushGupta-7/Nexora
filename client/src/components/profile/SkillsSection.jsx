import React, { useState } from 'react'
import ConfirmModal from '../common/ConfirmModal'
import './SkillsSection.css'

const SkillsSection = ({ profile, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [skills, setSkills] = useState(profile?.skills || [])
  const [deleteIndex, setDeleteIndex] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return
    const updatedSkills = [...skills, { name: newSkill.trim(), endorsements: 0 }]
    const result = await onUpdate({ skills: updatedSkills })
    if (result.success) {
      setSkills(updatedSkills)
      setNewSkill('')
      setIsAdding(false)
    }
  }

  const confirmRemoveSkill = async () => {
    setDeleteLoading(true)
    const updatedSkills = skills.filter((_, i) => i !== deleteIndex)
    const result = await onUpdate({ skills: updatedSkills })
    if (result.success) {
      setSkills(updatedSkills)
      setDeleteIndex(null)
    }
    setDeleteLoading(false)
  }

  const deletingSkillName = deleteIndex !== null ? skills[deleteIndex]?.name : ''

  return (
    <section className="skills-section">
      <div className="skills-header">
        <h2 className="skills-title">Skills</h2>
        <div className="skills-header-actions">
          <button className="skills-quiz-btn">Take skill quiz</button>
          <button
            className="skills-add-btn"
            onClick={() => setIsAdding(!isAdding)}
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="skills-edit-btn">
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>
      </div>

      <div className="skills-list">
        {skills.map((skill, index) => (
          <div key={skill._id || skill.id || index} className="skill-item">
            <div className="skill-info">
              <span className="skill-name">{skill.name}</span>
              <div className="skill-endorsements">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  groups
                </span>
                <span>Endorsed by {skill.endorsements || 0} colleagues</span>
              </div>
            </div>
            <button
              className="skill-remove-btn"
              onClick={() => setDeleteIndex(index)}
              title={`Delete ${skill.name}`}
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="skill-add-form">
          <input
            type="text"
            className="skill-add-input"
            placeholder="Enter skill name..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
          />
          <div className="skill-add-actions">
            <button className="skill-add-cancel" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button className="skill-add-submit" onClick={handleAddSkill}>
              Add Skill
            </button>
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="skills-show-all">
          <button className="skills-show-all-btn">
            Show all {skills.length} skills
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteIndex !== null}
        title="Delete Skill?"
        message={`Are you sure you want to remove "${deletingSkillName}" from your skills?`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={confirmRemoveSkill}
        onCancel={() => setDeleteIndex(null)}
      />
    </section>
  )
}

export default SkillsSection