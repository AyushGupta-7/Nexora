import React from 'react'
import './AuthLayout.css'

const AuthLayout = ({ children, leftContent }) => {
  return (
    <div className="auth-layout">
      {/* Left Side - Branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <span className="material-symbols-outlined logo-icon">hexagon</span>
            <span className="logo-text">Nexora</span>
          </div>
          {leftContent}
        </div>
        <div className="auth-bg-pattern"></div>
        <div className="auth-glow"></div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-right">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout