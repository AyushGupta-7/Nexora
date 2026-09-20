import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { getJob } from '../services/jobService'
import { getResumes } from '../services/resumeService'
import { applyForJob } from '../services/applicationService'
import { formatDistanceToNow, format } from 'date-fns'
import './JobDetails.css'

const JobDetails = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [applyStep, setApplyStep] = useState('select') // 'select' | 'review'
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    loadJob()
  }, [jobId])

  const loadJob = async () => {
    setLoading(true)
    try {
      const response = await getJob(jobId)
      if (response.success) {
        setJob(response.job)
      } else {
        setError('Job not found')
      }
    } catch (err) {
      setError('Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenApply = async () => {
    try {
      const response = await getResumes()
      if (response.success) setResumes(response.resumes)
    } catch (err) {
      console.error('Load resumes error:', err)
    }
    setApplyStep('select')
    setSelectedResumeId('')
    setApplyError('')
    setShowApplyModal(true)
  }

  const handleReview = () => {
    if (!selectedResumeId) {
      setApplyError('Please select a resume')
      return
    }
    setApplyStep('review')
    setApplyError('')
  }

  const handleSubmitApplication = async () => {
    if (!selectedResumeId) return
    setApplying(true)
    try {
      const response = await applyForJob({ jobId, resumeId: selectedResumeId })
      if (response.success) {
        setApplied(true)
        setShowApplyModal(false)
      } else {
        setApplyError(response.message || 'Application failed')
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Application failed. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const selectedResume = resumes.find(r => r._id === selectedResumeId)

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM d, yyyy')
    } catch { return '' }
  }

  if (loading) {
    return (
      <div className="jd-page">
        <Navbar />
        <div className="jd-loading">
          <div className="loader"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="jd-page">
        <Navbar />
        <div className="jd-error">
          <span className="material-symbols-outlined">work_off</span>
          <h2>{error || 'Job not found'}</h2>
          <button className="jd-btn jd-btn-primary" onClick={() => navigate('/jobs')}>Back to Jobs</button>
        </div>
      </div>
    )
  }

  const initials = job.company?.charAt(0) || 'J'

  return (
    <div className="jd-page">
      <Navbar />
      <main className="jd-main">
        <button className="jd-back-btn" onClick={() => navigate('/jobs')}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Jobs
        </button>

        <div className="jd-layout">
          {/* Main content */}
          <div className="jd-content">
            {/* Header */}
            <div className="jd-header-card">
              <div className="jd-header-top">
                <div className="jd-company-logo">
                  {job.companyLogo ? <img src={job.companyLogo} alt={job.company} /> : <span>{initials}</span>}
                </div>
                <div className="jd-header-info">
                  <h1 className="jd-title">{job.title}</h1>
                  <p className="jd-company">{job.company}</p>
                  <div className="jd-meta-tags">
                    <span className="jd-meta-tag">
                      <span className="material-symbols-outlined">location_on</span>
                      {job.location}
                    </span>
                    <span className="jd-meta-tag">
                      <span className="material-symbols-outlined">work</span>
                      {job.type}
                    </span>
                    <span className="jd-meta-tag">
                      <span className="material-symbols-outlined">trending_up</span>
                      {job.experience}
                    </span>
                    {job.salary && (
                      <span className="jd-meta-tag">
                        <span className="material-symbols-outlined">payments</span>
                        {job.salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="jd-header-actions">
                <div className="jd-date-info">
                  <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                  {job.deadline && <span className="jd-deadline">Deadline: {formatDate(job.deadline)}</span>}
                </div>
                {applied ? (
                  <div className="jd-applied-badge">
                    <span className="material-symbols-outlined">check_circle</span>
                    Applied
                  </div>
                ) : (
                  <button className="jd-btn jd-btn-primary jd-apply-btn" onClick={handleOpenApply}>
                    <span className="material-symbols-outlined">send</span>
                    Apply Now
                  </button>
                )}
              </div>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="jd-section-card">
                <h2 className="jd-section-title">Required Skills</h2>
                <div className="jd-skills-grid">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="jd-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="jd-section-card">
              <h2 className="jd-section-title">Job Description</h2>
              <p className="jd-description">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="jd-section-card">
                <h2 className="jd-section-title">Key Responsibilities</h2>
                <ul className="jd-list">
                  {job.responsibilities.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="jd-section-card">
                <h2 className="jd-section-title">Requirements</h2>
                <ul className="jd-list">
                  {job.requirements.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="jd-sidebar">
            <div className="jd-sidebar-card">
              <h3>Job Summary</h3>
              <div className="jd-summary-item">
                <span className="material-symbols-outlined">business</span>
                <div>
                  <p className="summary-label">Company</p>
                  <p className="summary-value">{job.company}</p>
                </div>
              </div>
              <div className="jd-summary-item">
                <span className="material-symbols-outlined">location_on</span>
                <div>
                  <p className="summary-label">Location</p>
                  <p className="summary-value">{job.location}</p>
                </div>
              </div>
              <div className="jd-summary-item">
                <span className="material-symbols-outlined">work</span>
                <div>
                  <p className="summary-label">Job Type</p>
                  <p className="summary-value">{job.type}</p>
                </div>
              </div>
              <div className="jd-summary-item">
                <span className="material-symbols-outlined">trending_up</span>
                <div>
                  <p className="summary-label">Experience</p>
                  <p className="summary-value">{job.experience}</p>
                </div>
              </div>
              {job.salary && (
                <div className="jd-summary-item">
                  <span className="material-symbols-outlined">payments</span>
                  <div>
                    <p className="summary-label">Salary</p>
                    <p className="summary-value">{job.salary}</p>
                  </div>
                </div>
              )}
              {job.deadline && (
                <div className="jd-summary-item">
                  <span className="material-symbols-outlined">event</span>
                  <div>
                    <p className="summary-label">Application Deadline</p>
                    <p className="summary-value">{formatDate(job.deadline)}</p>
                  </div>
                </div>
              )}
              {applied ? (
                <div className="jd-applied-badge sidebar-applied">
                  <span className="material-symbols-outlined">check_circle</span>
                  Application Submitted
                </div>
              ) : (
                <button className="jd-btn jd-btn-primary jd-sidebar-apply" onClick={handleOpenApply}>
                  Apply Now
                </button>
              )}
            </div>

            <button className="jd-btn jd-btn-secondary" onClick={() => navigate('/applications')}>
              <span className="material-symbols-outlined">list_alt</span>
              My Applications
            </button>
          </aside>
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{applyStep === 'select' ? 'Select a Resume' : 'Review Application'}</h2>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {applyStep === 'select' && (
              <div className="modal-body">
                <p className="modal-subtitle">Apply for: <strong>{job.title}</strong> at {job.company}</p>
                
                {resumes.length === 0 ? (
                  <div className="modal-empty">
                    <span className="material-symbols-outlined">description</span>
                    <p>You haven't uploaded any resumes yet.</p>
                    <button className="jd-btn jd-btn-primary" onClick={() => navigate('/resumes')}>
                      Upload Resume
                    </button>
                  </div>
                ) : (
                  <div className="resume-select-list">
                    {resumes.map(resume => (
                      <label key={resume._id} className={`resume-option ${selectedResumeId === resume._id ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="resume"
                          value={resume._id}
                          checked={selectedResumeId === resume._id}
                          onChange={() => { setSelectedResumeId(resume._id); setApplyError('') }}
                        />
                        <div className="resume-option-info">
                          <span className="material-symbols-outlined">description</span>
                          <div>
                            <p className="resume-option-name">{resume.name}</p>
                            <p className="resume-option-date">
                              Updated {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {applyError && <p className="modal-error">{applyError}</p>}

                {resumes.length > 0 && (
                  <div className="modal-actions">
                    <button className="jd-btn jd-btn-ghost" onClick={() => setShowApplyModal(false)}>Cancel</button>
                    <button className="jd-btn jd-btn-primary" onClick={handleReview}>
                      Review Application
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {applyStep === 'review' && (
              <div className="modal-body">
                <div className="review-card">
                  <div className="review-item">
                    <p className="review-label">Job</p>
                    <p className="review-value">{job.title}</p>
                  </div>
                  <div className="review-item">
                    <p className="review-label">Company</p>
                    <p className="review-value">{job.company}</p>
                  </div>
                  <div className="review-item">
                    <p className="review-label">Resume</p>
                    <p className="review-value">{selectedResume?.name}</p>
                  </div>
                </div>

                {applyError && <p className="modal-error">{applyError}</p>}

                <div className="modal-actions">
                  <button className="jd-btn jd-btn-ghost" onClick={() => setApplyStep('select')}>
                    <span className="material-symbols-outlined">arrow_back</span>
                    Change Resume
                  </button>
                  <button className="jd-btn jd-btn-primary" onClick={handleSubmitApplication} disabled={applying}>
                    {applying ? 'Submitting...' : 'Submit Application'}
                    {!applying && <span className="material-symbols-outlined">send</span>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetails
