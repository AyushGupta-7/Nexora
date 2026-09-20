import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { getMyApplications, withdrawApplication } from '../services/applicationService'
import { formatDistanceToNow } from 'date-fns'
import './Applications.css'

const STATUS_STYLES = {
  'Applied': { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', icon: 'send' },
  'Under Review': { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', icon: 'visibility' },
  'Shortlisted': { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: 'star' },
  'Interview': { color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: 'groups' },
  'Selected': { color: '#4ade80', bg: 'rgba(74,222,128,0.15)', icon: 'check_circle' },
  'Rejected': { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: 'cancel' },
  'Withdrawn': { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: 'undo' },
}

const ApplicationCard = ({ application, onWithdraw }) => {
  const navigate = useNavigate()
  const job = application.job || {}
  const resume = application.resume || {}
  const status = application.status || 'Applied'
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES['Applied']
  const [withdrawing, setWithdrawing] = useState(false)

  const formatDate = (date) => {
    try { return formatDistanceToNow(new Date(date), { addSuffix: true }) }
    catch { return '' }
  }

  const initials = job.company?.charAt(0) || 'J'

  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw this application?')) return
    setWithdrawing(true)
    try {
      await withdrawApplication(application._id)
      onWithdraw(application._id)
    } catch (err) {
      console.error('Withdraw error:', err)
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <div className="app-card">
      <div className="app-card-main">
        <div className="app-company-logo">
          {job.companyLogo
            ? <img src={job.companyLogo} alt={job.company} />
            : <span>{initials}</span>
          }
        </div>
        <div className="app-card-info">
          <h3 className="app-job-title" onClick={() => navigate(`/jobs/${job._id}`)}>{job.title}</h3>
          <p className="app-company">{job.company}</p>
          <div className="app-meta">
            {job.location && (
              <span className="app-meta-item">
                <span className="material-symbols-outlined">location_on</span>
                {job.location}
              </span>
            )}
            {job.type && (
              <span className="app-meta-item">
                <span className="material-symbols-outlined">work</span>
                {job.type}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="app-card-details">
        <div className="app-resume-info">
          <span className="material-symbols-outlined">description</span>
          <div>
            <p className="app-resume-label">Resume used</p>
            <p className="app-resume-name">{resume.name || 'Resume'}</p>
          </div>
        </div>
        <div
          className="app-status-badge"
          style={{ color: statusStyle.color, background: statusStyle.bg }}
        >
          <span className="material-symbols-outlined">{statusStyle.icon}</span>
          {status}
        </div>
      </div>

      <div className="app-card-footer">
        <span className="app-date">Applied {formatDate(application.createdAt)}</span>
        {status !== 'Withdrawn' && status !== 'Rejected' && status !== 'Selected' && (
          <button className="app-withdraw-btn" onClick={handleWithdraw} disabled={withdrawing}>
            {withdrawing ? 'Withdrawing...' : 'Withdraw'}
          </button>
        )}
        {resume.fileUrl && (
          <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="app-view-resume-btn">
            <span className="material-symbols-outlined">open_in_new</span>
            View Resume
          </a>
        )}
      </div>
    </div>
  )
}

const Applications = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const response = await getMyApplications()
      if (response.success) {
        setApplications(response.applications)
      } else {
        setError('Failed to load applications')
      }
    } catch (err) {
      setError('Unable to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = (applicationId) => {
    setApplications(prev =>
      prev.map(app => app._id === applicationId ? { ...app, status: 'Withdrawn' } : app)
    )
  }

  const filteredApplications = filterStatus === 'all'
    ? applications
    : applications.filter(app => app.status === filterStatus)

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="apps-page">
      <Navbar />
      <main className="apps-main">
        <div className="apps-header">
          <div>
            <h1 className="apps-title">My Applications</h1>
            <p className="apps-subtitle">Track the status of your job applications</p>
          </div>
          <button className="apps-jobs-btn" onClick={() => navigate('/jobs')}>
            <span className="material-symbols-outlined">work</span>
            Browse Jobs
          </button>
        </div>

        {/* Status Filter */}
        {applications.length > 0 && (
          <div className="apps-filters">
            <button
              className={`apps-filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({applications.length})
            </button>
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                className={`apps-filter-chip ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
                style={filterStatus === status ? { borderColor: STATUS_STYLES[status]?.color, color: STATUS_STYLES[status]?.color } : {}}
              >
                {status} ({count})
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="apps-loading">
            <div className="loader"></div>
            <p>Loading applications...</p>
          </div>
        ) : error ? (
          <div className="apps-error">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="apps-empty">
            <span className="material-symbols-outlined">list_alt</span>
            <h3>No applications yet</h3>
            <p>Start applying to jobs to track your applications here</p>
            <button className="apps-jobs-btn" onClick={() => navigate('/jobs')}>Browse Jobs</button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="apps-empty">
            <span className="material-symbols-outlined">filter_list_off</span>
            <h3>No {filterStatus} applications</h3>
            <button className="apps-filter-chip active" onClick={() => setFilterStatus('all')}>Show All</button>
          </div>
        ) : (
          <div className="apps-list">
            {filteredApplications.map(app => (
              <ApplicationCard key={app._id} application={app} onWithdraw={handleWithdraw} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Applications
