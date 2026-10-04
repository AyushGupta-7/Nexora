import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import ConfirmModal from '../components/common/ConfirmModal'
import { useAuth } from '../context/AuthContext'
import {
  getMyPostedJobs,
  createJob,
  closeApplications,
  deleteJob,
  getJobApplicants,
  updateApplicantStage,
} from '../services/jobService'
import { formatDistanceToNow, format } from 'date-fns'
import './RecruiterJobs.css'

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Remote']
const DURATIONS = ['3 Months', '6 Months', '1 Year', 'Full Time / Permanent', 'Project Based']
const ALL_STAGES = [
  'Applied', 'Under Review', 'Shortlisted', 'Interview',
  'DSA Round', 'Technical Interview', 'HR Interview',
  'Selected', 'Rejected',
]

const STATUS_STYLES = {
  'Applied': { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  'Under Review': { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  'Shortlisted': { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  'Interview': { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  'DSA Round': { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  'Technical Interview': { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  'HR Interview': { color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  'Selected': { color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
  'Rejected': { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  'Withdrawn': { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
}

// ── Applicant Row ─────────────────────────────────────────────────────────────
const ApplicantRow = ({ application, jobId, onStageUpdate }) => {
  const [updating, setUpdating] = useState(false)
  const [selectedStage, setSelectedStage] = useState(application.status || 'Applied')
  const user = application.user || {}
  const resume = application.resume || {}
  const statusStyle = STATUS_STYLES[selectedStage] || STATUS_STYLES['Applied']

  const userAvatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=00dce3&color=041329`

  const handleStageChange = async (e) => {
    const stage = e.target.value
    setSelectedStage(stage)
    setUpdating(true)
    try {
      await updateApplicantStage(jobId, application._id, stage)
      onStageUpdate(application._id, stage)
    } catch (err) {
      console.error('Stage update error:', err)
      setSelectedStage(application.status)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="applicant-row">
      <div className="applicant-info">
        <img src={userAvatar} alt={user.fullName} className="applicant-avatar" />
        <div>
          <p className="applicant-name">{user.fullName || 'Applicant'}</p>
          <p className="applicant-title">{user.title || user.email}</p>
        </div>
      </div>
      <div className="applicant-resume">
        {resume.name ? (
          <span className="applicant-resume-name">
            <span className="material-symbols-outlined">description</span>
            {resume.name}
          </span>
        ) : (
          <span className="applicant-no-resume">No resume</span>
        )}
      </div>
      <div className="applicant-date">
        {application.createdAt ? format(new Date(application.createdAt), 'dd MMM yyyy') : '—'}
      </div>
      <div className="applicant-stage-col">
        <span
          className="applicant-stage-badge"
          style={{ color: statusStyle.color, background: statusStyle.bg }}
        >
          {selectedStage}
        </span>
        <select
          className="stage-select"
          value={selectedStage}
          onChange={handleStageChange}
          disabled={updating}
        >
          {ALL_STAGES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </div>
  )
}

// ── Job Card ──────────────────────────────────────────────────────────────────
const JobCard = ({ job, onClose, onDelete }) => {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [applicants, setApplicants] = useState([])
  const [applicantsLoading, setApplicantsLoading] = useState(false)
  const [applicantsList, setApplicantsList] = useState([])
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [closing, setClosing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadApplicants = async () => {
    if (applicantsLoading) return
    setApplicantsLoading(true)
    try {
      const response = await getJobApplicants(job._id)
      if (response.success) {
        setApplicantsList(response.applications)
        setApplicants(response.applications)
      }
    } catch (err) {
      console.error('Load applicants error:', err)
    } finally {
      setApplicantsLoading(false)
    }
  }

  const handleExpand = () => {
    if (!expanded) loadApplicants()
    setExpanded(!expanded)
  }

  const handleCloseApplications = async () => {
    setClosing(true)
    try {
      await closeApplications(job._id)
      setShowCloseModal(false)
      onClose(job._id)
    } catch (err) {
      console.error('Close error:', err)
    } finally {
      setClosing(false)
    }
  }

  const handleDeleteJob = async () => {
    setDeleting(true)
    try {
      await deleteJob(job._id)
      setShowDeleteModal(false)
      onDelete(job._id)
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleStageUpdate = (applicationId, newStage) => {
    setApplicantsList(prev =>
      prev.map(app => app._id === applicationId ? { ...app, status: newStage } : app)
    )
  }

  const getApiBase = () => import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const fetchPdf = async (path, disposition) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${getApiBase()}/jobs/${job._id}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      console.error('JD fetch failed', res.status)
      return null
    }
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  }

  const handleViewJD = async () => {
    const url = await fetchPdf('/jd/view', 'inline')
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadJD = async () => {
    const url = await fetchPdf('/jd/download', 'attachment')
    if (url) {
      const link = document.createElement('a')
      link.href = url
      link.download = `${job.title}_JD.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    }
  }

  const postedDate = job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : ''

  return (
    <>
      <div className="rec-job-card">
        <div className="rec-job-header">
          <div className="rec-job-main-info">
            <div className="rec-job-title-row">
              <h3 className="rec-job-title">{job.title}</h3>
              <div className="rec-job-badges">
                <span className="rec-job-type-badge">{job.type}</span>
                {job.duration && <span className="rec-job-duration-badge">{job.duration}</span>}
                <span className={`rec-job-status-badge ${job.applicationsOpen ? 'open' : 'closed'}`}>
                  {job.applicationsOpen ? 'Applications Open' : 'Applications Closed'}
                </span>
              </div>
            </div>
            <p className="rec-job-company">{job.company} · {job.location}</p>
            {job.salary && <p className="rec-job-salary">💰 {job.salary}</p>}
          </div>

          <div className="rec-job-meta">
            <span className="rec-job-posted">Posted {postedDate}</span>
            <span className="rec-job-app-count">
              <span className="material-symbols-outlined">group</span>
              {job.applicationCount || 0} applicant{job.applicationCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="rec-job-actions">
          <div className="rec-job-actions-left">
            <button className="rec-btn rec-btn-ghost" onClick={handleExpand}>
              <span className="material-symbols-outlined">
                {expanded ? 'expand_less' : 'people'}
              </span>
              {expanded ? 'Hide Applicants' : 'View Applicants'}
            </button>

            {job.jdUrl && (
              <>
                <button className="rec-btn rec-btn-ghost" onClick={handleViewJD} title="View JD PDF">
                  <span className="material-symbols-outlined">visibility</span>
                  View JD
                </button>
                <button className="rec-btn rec-btn-ghost" onClick={handleDownloadJD} title="Download JD PDF">
                  <span className="material-symbols-outlined">download</span>
                  Download JD
                </button>
              </>
            )}
          </div>

          <div className="rec-job-actions-right">
            {job.applicationsOpen && (
              <button
                className="rec-btn rec-btn-warning"
                onClick={() => setShowCloseModal(true)}
              >
                <span className="material-symbols-outlined">lock</span>
                Close Applications
              </button>
            )}
            <button
              className="rec-btn rec-btn-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <span className="material-symbols-outlined">delete</span>
              Delete
            </button>
          </div>
        </div>

        {/* Applicants panel */}
        {expanded && (
          <div className="applicants-panel">
            <div className="applicants-panel-header">
              <h4>Applicants ({applicantsList.length})</h4>
            </div>
            {applicantsLoading ? (
              <div className="applicants-loading">
                <div className="loader" />
                <span>Loading applicants...</span>
              </div>
            ) : applicantsList.length === 0 ? (
              <div className="applicants-empty">
                <span className="material-symbols-outlined">person_search</span>
                <p>No applications yet</p>
              </div>
            ) : (
              <div className="applicants-list">
                <div className="applicants-list-header">
                  <span>Applicant</span>
                  <span>Resume</span>
                  <span>Applied</span>
                  <span>Stage</span>
                </div>
                {applicantsList.map(app => (
                  <ApplicantRow
                    key={app._id}
                    application={app}
                    jobId={job._id}
                    onStageUpdate={handleStageUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showCloseModal}
        title="Close Applications?"
        message="Once closed, no new applications can be submitted. Existing applicants will still be visible."
        confirmLabel="Close Applications"
        cancelLabel="Keep Open"
        loading={closing}
        onConfirm={handleCloseApplications}
        onCancel={() => setShowCloseModal(false)}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete this job?"
        message="This will permanently delete the job posting and all associated data."
        confirmLabel="Delete Job"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={handleDeleteJob}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  )
}

// ── Add Job Form ──────────────────────────────────────────────────────────────
const AddJobForm = ({ onJobCreated }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [jdFile, setJdFile] = useState(null)
  const jdInputRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    duration: '',
    salary: '',
    experience: '',
    description: '',
    skills: '',
    requirements: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleJdSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted for the JD')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('JD PDF must be under 10MB')
      return
    }
    setJdFile(file)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.company.trim() || !form.location.trim() || !form.description.trim()) {
      setError('Title, company, location, and description are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'skills' || key === 'requirements') {
          // send as comma-separated string — backend handles as array
          formData.append(key, val)
        } else {
          formData.append(key, val)
        }
      })
      if (jdFile) formData.append('jd', jdFile)

      const response = await createJob(formData)

      if (response.success) {
        setSuccess('Job posted successfully!')
        setForm({
          title: '', company: '', location: '', type: 'Full-time',
          duration: '', salary: '', experience: '', description: '',
          skills: '', requirements: '',
        })
        setJdFile(null)
        if (jdInputRef.current) jdInputRef.current.value = ''
        onJobCreated(response.job)
        setTimeout(() => setSuccess(''), 4000)
      } else {
        setError(response.message || 'Failed to create job')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="add-job-form" onSubmit={handleSubmit}>
      <h2 className="add-job-title">Post a New Job</h2>

      {error && (
        <div className="add-job-error">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      {success && (
        <div className="add-job-success">
          <span className="material-symbols-outlined">check_circle</span>
          {success}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Job Title *</label>
          <input
            className="form-input"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Senior Software Engineer"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Company Name *</label>
          <input
            className="form-input"
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="e.g. TechCorp Inc."
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Location *</label>
          <input
            className="form-input"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Remote / Bangalore"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Job Type</label>
          <select className="form-select" name="type" value={form.type} onChange={handleChange}>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Duration</label>
          <select className="form-select" name="duration" value={form.duration} onChange={handleChange}>
            <option value="">Select duration</option>
            {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Salary / Stipend</label>
          <input
            className="form-input"
            name="salary"
            value={form.salary}
            onChange={handleChange}
            placeholder="e.g. ₹12-18 LPA or ₹25,000/month"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Experience Required</label>
        <input
          className="form-input"
          name="experience"
          value={form.experience}
          onChange={handleChange}
          placeholder="e.g. 2-4 years"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Job Description *</label>
        <textarea
          className="form-textarea"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the role, responsibilities, and expectations..."
          rows={6}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Required Skills</label>
          <input
            className="form-input"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, MongoDB (comma separated)"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Requirements</label>
          <input
            className="form-input"
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            placeholder="e.g. B.Tech CS, Open source contributions (comma separated)"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Job Description PDF (optional)</label>
        <div
          className={`jd-upload-area ${jdFile ? 'has-file' : ''}`}
          onClick={() => jdInputRef.current?.click()}
        >
          <span className="material-symbols-outlined jd-upload-icon">
            {jdFile ? 'picture_as_pdf' : 'upload_file'}
          </span>
          <span className="jd-upload-text">
            {jdFile ? jdFile.name : 'Click to upload JD PDF (max 10MB)'}
          </span>
          {jdFile && (
            <button
              type="button"
              className="jd-remove-btn"
              onClick={(e) => { e.stopPropagation(); setJdFile(null); if (jdInputRef.current) jdInputRef.current.value = '' }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
        <input
          ref={jdInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleJdSelect}
          style={{ display: 'none' }}
        />
      </div>

      <button type="submit" className="post-job-btn" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner-inline" />
            Posting...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">post_add</span>
            Post Job
          </>
        )}
      </button>
    </form>
  )
}

// ── Main RecruiterJobs Page ───────────────────────────────────────────────────
const RecruiterJobs = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('posted')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Guard: redirect non-recruiters
  useEffect(() => {
    if (user && user.role !== 'recruiter') {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const response = await getMyPostedJobs()
      if (response.success) {
        setJobs(response.jobs)
      } else {
        setError('Failed to load jobs')
      }
    } catch (err) {
      setError('Unable to load posted jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleJobCreated = (newJob) => {
    // Add applicationCount: 0 for display
    setJobs(prev => [{ ...newJob, applicationCount: 0 }, ...prev])
    setActiveTab('posted')
  }

  const handleJobClosed = (jobId) => {
    setJobs(prev => prev.map(j => j._id === jobId ? { ...j, applicationsOpen: false } : j))
  }

  const handleJobDeleted = (jobId) => {
    setJobs(prev => prev.filter(j => j._id !== jobId))
  }

  return (
    <div className="recruiter-jobs-page">
      <Navbar />
      <main className="recruiter-jobs-main">
        <div className="recruiter-jobs-header">
          <div>
            <div className="recruiter-page-badge">
              <span className="material-symbols-outlined">business_center</span>
              Recruiter Dashboard
            </div>
            <h1 className="recruiter-jobs-title">Job Management</h1>
            <p className="recruiter-jobs-subtitle">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted by {user?.companyName || user?.fullName || 'you'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="recruiter-tabs">
          <button
            className={`recruiter-tab ${activeTab === 'posted' ? 'active' : ''}`}
            onClick={() => setActiveTab('posted')}
          >
            <span className="material-symbols-outlined">list_alt</span>
            Posted Jobs ({jobs.length})
          </button>
          <button
            className={`recruiter-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <span className="material-symbols-outlined">add_circle</span>
            Post New Job
          </button>
        </div>

        {/* Content */}
        {activeTab === 'posted' ? (
          <div className="posted-jobs-section">
            {loading ? (
              <div className="recruiter-loading">
                <div className="loader" />
                <p>Loading your jobs...</p>
              </div>
            ) : error ? (
              <div className="recruiter-error">
                <span className="material-symbols-outlined">error</span>
                <p>{error}</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="recruiter-empty">
                <span className="material-symbols-outlined">work_off</span>
                <h3>No jobs posted yet</h3>
                <p>Click "Post New Job" to create your first job listing</p>
                <button className="post-first-job-btn" onClick={() => setActiveTab('add')}>
                  <span className="material-symbols-outlined">add_circle</span>
                  Post New Job
                </button>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map(job => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onClose={handleJobClosed}
                    onDelete={handleJobDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="add-job-section">
            <AddJobForm onJobCreated={handleJobCreated} />
          </div>
        )}
      </main>
    </div>
  )
}

export default RecruiterJobs
