import React from 'react'
import './Button.css'

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn-loader"></span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="btn-icon">
              <span className="material-symbols-outlined">{icon}</span>
            </span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="btn-icon btn-icon-right">
              <span className="material-symbols-outlined">{icon}</span>
            </span>
          )}
        </>
      )}
    </button>
  )
}

export default Button