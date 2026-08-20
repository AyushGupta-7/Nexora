import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../common/Input'
import Button from '../common/Button'
import SocialLogin from '../common/SocialLogin'
import PasswordStrength from './PasswordStrength'
import { register } from '../../services/authService'
import './RegisterForm.css'

const RegisterForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else {
      // Check password strength criteria
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
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (generalError) setGeneralError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setGeneralError('')
    
    try {
      const { confirmPassword, ...registerData } = formData
      const response = await register(registerData)
      
      if (response.success) {
        navigate('/login', { 
          state: { message: 'Registration successful! Please login.' },
          replace: true 
        })
      } else {
        setGeneralError(response.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      console.error('Registration error details:', err)
      
      // Handle different error types
      let errorMessage = 'An error occurred. Please try again.'
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data)
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request)
        errorMessage = 'No response from server. Please check if the server is running.'
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', err.message)
        errorMessage = err.message
      }
      
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please login.'
      }
      
      setGeneralError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`)
    // Implement social login logic
  }

  return (
    <div className="register-form">
      <div className="form-header">
        <h2 className="form-title">Create Account</h2>
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
          placeholder="e.g. Alex Chen"
          icon="person"
          error={errors.fullName}
          required
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="alex.chen@example.com"
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
          Create Account
        </Button>
      </form>

      <SocialLogin
        onGoogle={() => handleSocialLogin('google')}
        onLinkedIn={() => handleSocialLogin('linkedin')}
      />

      <p className="form-footer">
        By creating an account, you agree to our{' '}
        <Link to="/terms" className="form-link">Terms of Service</Link>{' '}
        and <Link to="/privacy" className="form-link">Privacy Policy</Link>.
      </p>
    </div>
  )
}

export default RegisterForm