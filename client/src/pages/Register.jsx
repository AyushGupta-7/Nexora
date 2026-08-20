import React from 'react'
import AuthLayout from '../components/layout/AuthLayout'
import RegisterForm from '../components/auth/RegisterForm'
import './Register.css'

const Register = () => {
  const leftContent = (
    <>
      <h1 className="auth-headline">Join Nexora.</h1>
      <p className="auth-description">
        Connect with leading tech professionals, architect your career path, and 
        gain access to exclusive enterprise opportunities.
      </p>
      <div className="auth-glass-panel">
        <div className="glass-header">
          <div className="glass-icon">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              terminal
            </span>
          </div>
          <div>
            <div className="glass-title">System Access</div>
            <div className="glass-subtitle">Level 1 Authorization</div>
          </div>
        </div>
        <div className="glass-progress">
          <div className="progress-bar" style={{ width: '75%' }}></div>
          <div className="progress-bar progress-bar-secondary" style={{ width: '50%' }}></div>
        </div>
      </div>
    </>
  )

  return (
    <AuthLayout leftContent={leftContent}>
      <div className="register-page">
        <RegisterForm />
      </div>
    </AuthLayout>
  )
}

export default Register