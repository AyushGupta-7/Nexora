import React, { useState } from 'react'
import './Input.css'

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  error,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {icon && (
          <span className="input-icon">
            <span className="material-symbols-outlined">{icon}</span>
          </span>
        )}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input-field ${icon ? 'has-icon' : ''} ${isPassword ? 'has-password' : ''} ${error ? 'has-error' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            <span className="material-symbols-outlined">
              {showPassword ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        )}
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  )
}

export default Input