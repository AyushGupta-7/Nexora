import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import SocialLogin from '../components/common/SocialLogin'
import { login } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setIsAuthenticated, setUser, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (generalError) setGeneralError('')
    if (successMessage) setSuccessMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setGeneralError('')
    
    try {
      console.log('📝 Attempting login for:', formData.email)
      const response = await login(formData)
      
      if (response.success) {
        console.log('✅ Login successful')
        localStorage.setItem('token', response.token)
        setIsAuthenticated(true)
        setUser(response.user)
        navigate('/dashboard', { replace: true })
      } else {
        setGeneralError(response.message || 'Login failed. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      
      let errorMessage = 'An error occurred. Please try again.'
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.'
      } else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 5000.'
      } else if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`
      } else if (err.request) {
        errorMessage = 'No response from server. Please check if the server is running.'
      }
      
      setGeneralError(errorMessage)
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`)
  }

  const leftContent = (
    <>
      <h1 className="auth-headline">Welcome back to Nexora.</h1>
      <p className="auth-description">
        The premier network for high-performance engineering and technology leadership.
      </p>
    </>
  )

  return (
    <AuthLayout leftContent={leftContent}>
      <div className="login-page">
        <div className="login-container">
          <div className="login-mobile-logo">
            <span className="logo-text">Nexora</span>
          </div>

          <div className="login-header">
            <h2 className="login-title">Sign In</h2>
            <p className="login-subtitle">Enter your details to access your dashboard.</p>
          </div>

          {successMessage && (
            <div className="login-success-banner">
              <span className="material-symbols-outlined">check_circle</span>
              {successMessage}
            </div>
          )}

          {generalError && (
            <div className="login-error-banner">
              <span className="material-symbols-outlined">error</span>
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="engineer@domain.com"
              icon="mail"
              error={errors.email}
              required
            />

            <div className="login-password-header">
              <label htmlFor="password" className="input-label">Password</label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon="lock"
              error={errors.password}
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
              Sign In
            </Button>
          </form>

          <SocialLogin
            onGoogle={() => handleSocialLogin('google')}
            onLinkedIn={() => handleSocialLogin('linkedin')}
          />

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="login-link">Apply to join</Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default Login