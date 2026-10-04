import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import PasswordStrength from '../components/auth/PasswordStrength'
import { recruiterRegister } from '../services/authService'
import '../components/auth/RegisterForm.css'
import './RecruiterRegister.css'

const RecruiterRegister = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else {
      const hasLowercase = /[a-z]/.test(formData.password)
      const hasUppercase = /[A-Z]/.test(formData.password)
      const hasNumber = /[0-9]/.test(formData.password)
      const hasSpecial = /[^a-zA-Z0-9]/.test(formData.password)
      if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecial) {
        newErrors.password = 'Password must include uppercase, lowercase, number, and special character'
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (generalError) setGeneralError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setGeneralError('')

    try {
      const { confirmPassword, ...registerData } = formData
      const response = await recruiterRegister(registerData)

      if (response.success) {
        navigate('/login', {
          state: { message: 'Recruiter account created! Please sign in.' },
          replace: true,
        })
      } else {
        setGeneralError(response.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      let errorMessage = 'An error occurred. Please try again.'
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.request) {
        errorMessage = 'No response from server. Please check if the server is running.'
      }
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        errorMessage = 'An account with this email already exists. Please log in.'
      }
      setGeneralError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const leftContent = (
    <>
      <h1 className="auth-headline">Hire on Nexora.</h1>
      <p className="auth-description">
        Post jobs, manage applications, and discover top engineering talent — all in one platform.
      </p>
      <div className="auth-glass-panel recruiter-panel">
        <div className="glass-header">
          <div className="glass-icon recruiter-glass-icon">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              business_center
            </span>
          </div>
          <div>
            <div className="glass-title">Recruiter Access</div>
            <div className="glass-subtitle">Company Verified</div>
          </div>
        </div>
        <div className="recruiter-features">
          <div className="recruiter-feature">
            <span className="material-symbols-outlined">post_add</span>
            Post unlimited jobs
          </div>
          <div className="recruiter-feature">
            <span className="material-symbols-outlined">group</span>
            Manage applicants
          </div>
          <div className="recruiter-feature">
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Attach JD PDFs
          </div>
        </div>
      </div>
    </>
  )

  return (
    <AuthLayout leftContent={leftContent}>
      <div className="recruiter-register-page">
        <div className="recruiter-register-form">
          <div className="form-header">
            <div className="recruiter-badge">
              <span className="material-symbols-outlined">business_center</span>
              Recruiter Account
            </div>
            <h2 className="form-title">Create Recruiter Account</h2>
            <p className="form-subtitle">
              Already have an account? <Link to="/login" className="form-link">Sign in</Link>
            </p>
          </div>

          {generalError && (
            <div className="form-error-banner">
              <span className="material-symbols-outlined">error</span>
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Sarah Mitchell"
              icon="person"
              error={errors.fullName}
              required
            />

            <Input
              label="Company Name"
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. TechCorp Inc."
              icon="business"
              error={errors.companyName}
              required
            />

            <Input
              label="Work Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sarah@techcorp.com"
              icon="mail"
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon="lock"
              error={errors.password}
              required
            />

            {formData.password && <PasswordStrength password={formData.password} />}

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon="lock"
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon="arrow_forward"
              iconPosition="right"
            >
              Create Recruiter Account
            </Button>
          </form>

          <p className="form-footer">
            Looking to join as a candidate?{' '}
            <Link to="/register" className="form-link">Register as a user</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}

export default RecruiterRegister
