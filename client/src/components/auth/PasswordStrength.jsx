import React from 'react'
import './PasswordStrength.css'

const PasswordStrength = ({ password }) => {
  const getStrength = (pwd) => {
    if (!pwd) return { 
      level: 0, 
      label: 'Empty', 
      color: 'var(--color-outline-variant)',
      score: 0
    }
    
    let score = 0
    const criteria = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^a-zA-Z0-9]/.test(pwd)
    }
    
    // Each criterion adds 1 point
    if (criteria.length) score++
    if (criteria.lowercase) score++
    if (criteria.uppercase) score++
    if (criteria.number) score++
    if (criteria.special) score++
    
    const levels = [
      { label: 'Very Weak', color: 'var(--color-error)', description: 'Add more characters' },
      { label: 'Weak', color: '#ff6b6b', description: 'Use uppercase & numbers' },
      { label: 'Fair', color: '#ffb74d', description: 'Add special characters' },
      { label: 'Good', color: 'var(--color-secondary-fixed)', description: 'Almost there!' },
      { label: 'Strong', color: '#69db7c', description: 'Great password!' },
      { label: 'Very Strong', color: 'var(--color-primary-container)', description: 'Excellent!' }
    ]
    
    // Map score to level (0-5)
    const level = Math.min(score, 5)
    return { 
      level, 
      label: levels[level].label, 
      color: levels[level].color,
      description: levels[level].description,
      criteria,
      score
    }
  }

  const strength = getStrength(password)
  const totalBars = 5

  // Get criteria status for display
  const getCriteriaStatus = () => {
    if (!password) return []
    const { criteria } = strength
    return [
      { key: 'length', label: '8+ characters', met: criteria.length },
      { key: 'lowercase', label: 'Lowercase letter', met: criteria.lowercase },
      { key: 'uppercase', label: 'Uppercase letter', met: criteria.uppercase },
      { key: 'number', label: 'Number', met: criteria.number },
      { key: 'special', label: 'Special character', met: criteria.special }
    ]
  }

  const criteriaList = getCriteriaStatus()

  return (
    <div className="password-strength">
      <div className="strength-header">
        <span className="strength-label">Password Strength</span>
        <span className="strength-value" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>
      
      <div className="strength-bars">
        {Array.from({ length: totalBars }).map((_, index) => (
          <div
            key={index}
            className="strength-bar"
            style={{
              background: index < strength.level 
                ? strength.color 
                : 'var(--color-surface-container-high)',
              opacity: index < strength.level ? 1 : 0.3
            }}
          />
        ))}
      </div>
      
      {password && (
        <>
          <div className="strength-description" style={{ color: strength.color }}>
            {strength.description}
          </div>
          
          <div className="criteria-list">
            {criteriaList.map((criterion) => (
              <div key={criterion.key} className="criteria-item">
                <span className={`criteria-icon ${criterion.met ? 'met' : 'unmet'}`}>
                  <span className="material-symbols-outlined">
                    {criterion.met ? 'check_circle' : 'cancel'}
                  </span>
                </span>
                <span className={`criteria-text ${criterion.met ? 'met' : 'unmet'}`}>
                  {criterion.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default PasswordStrength