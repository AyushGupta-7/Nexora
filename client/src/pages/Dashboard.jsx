import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-logo">
            <span className="material-symbols-outlined">hexagon</span>
            <span>Nexora</span>
          </div>
          <div className="dashboard-nav-right">
            <span className="dashboard-user">
              <span className="material-symbols-outlined">account_circle</span>
              {user?.fullName || user?.email || 'User'}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Welcome, {user?.fullName || 'User'}!</h1>
          <p className="dashboard-subtitle">You have successfully logged in to Nexora.</p>

          <div className="dashboard-cards">
            <div className="dashboard-card">
              <div className="card-icon">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h3>Profile</h3>
              <p>Manage your account settings and preferences.</p>
            </div>
            <div className="dashboard-card">
              <div className="card-icon">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <h3>Analytics</h3>
              <p>View your performance metrics and insights.</p>
            </div>
            <div className="dashboard-card">
              <div className="card-icon">
                <span className="material-symbols-outlined">people</span>
              </div>
              <h3>Network</h3>
              <p>Connect with other professionals in your field.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard