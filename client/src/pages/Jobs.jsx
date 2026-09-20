import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { getJobs } from '../services/jobService'
import { formatDistanceToNow } from 'date-fns'
import './Jobs.css'

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Remote']
const EXPERIENCE_OPTIONS = ['0-1 years', '1-3 years', '3-5 years', '5+ years']

const JobCard = ({ job, onClick }) => {
  const avatar = job.companyLogo || null
  const initials = job.company?.charAt(0) || 'J'

  const formatDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }

  return (
    <div className="job-card" onClick={() => onClick(job._id)}>
      <div className="job-card-header">
        <div className="job-company-logo">
          {avatar ? <img src={avatar} alt={job.company} /> : <span>{initials}</span>}
        </div>
        <div className="job-card-meta">
          <h3 className="job-title">{job.title}</h3>
          <p className="job-company">{job.company}</p>
          <div className="job-card-tags">
            <span className="job-tag">
              <span className="material-symbols-outlined">location_on</span>
              {job.location}
            </span>
            <span className="job-tag">
              <span className="material-symbols-outlined">work</span>
              {job.type}
            </span>
            <span className="job-tag">
              <span className="material-symbols-outlined">schedule</span>
              {job.experience}
            </span>
          </div>
        </div>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="job-skills">
          {job.skills.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="job-skill-tag">{skill}</span>
          ))}
          {job.skills.length > 4 && (
            <span className="job-skill-tag job-skill-more">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="job-card-footer">
        {job.salary && <span className="job-salary">{job.salary}</span>}
        <span className="job-posted">{formatDate(job.createdAt)}</span>
        <button className="job-view-btn">View Job</button>
      </div>
    </div>
  )
}

const Jobs = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ search: '', location: '', type: '', experience: '' })
  const [searchInput, setSearchInput] = useState('')

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.location) params.location = filters.location
      if (filters.type) params.type = filters.type
      if (filters.experience) params.experience = filters.experience

      const response = await getJobs(params)
      if (response.success) {
        setJobs(response.jobs)
      } else {
        setError('Failed to load jobs')
      }
    } catch (err) {
      setError('Unable to load jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, search: searchInput }))
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }))
  }

  const clearFilters = () => {
    setFilters({ search: '', location: '', type: '', experience: '' })
    setSearchInput('')
  }

  const hasActiveFilters = Object.values(filters).some(v => v)

  return (
    <div className="jobs-page">
      <Navbar />
      <main className="jobs-main">
        <div className="jobs-header">
          <h1 className="jobs-title">Find Your Next Opportunity</h1>
          <p className="jobs-subtitle">Curated tech jobs for early-career professionals</p>
        </div>

        {/* Search Bar */}
        <form className="jobs-search" onSubmit={handleSearch}>
          <div className="jobs-search-input-wrapper">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="jobs-search-input"
            />
          </div>
          <button type="submit" className="jobs-search-btn">Search</button>
        </form>

        <div className="jobs-layout">
          {/* Filters Sidebar */}
          <aside className="jobs-filters">
            <div className="filter-section">
              <div className="filter-header">
                <h3>Filters</h3>
                {hasActiveFilters && (
                  <button className="clear-filters-btn" onClick={clearFilters}>Clear all</button>
                )}
              </div>

              <div className="filter-group">
                <h4>Job Type</h4>
                <div className="filter-options">
                  {JOB_TYPES.map(type => (
                    <button
                      key={type}
                      className={`filter-option ${filters.type === type ? 'active' : ''}`}
                      onClick={() => handleFilterChange('type', type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h4>Experience</h4>
                <div className="filter-options">
                  {EXPERIENCE_OPTIONS.map(exp => (
                    <button
                      key={exp}
                      className={`filter-option ${filters.experience === exp ? 'active' : ''}`}
                      onClick={() => handleFilterChange('experience', exp)}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Jobs List */}
          <div className="jobs-list">
            {loading ? (
              <div className="jobs-loading">
                <div className="loader"></div>
                <p>Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="jobs-error">
                <span className="material-symbols-outlined">error</span>
                <p>{error}</p>
                <button className="jobs-retry-btn" onClick={loadJobs}>Try Again</button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="jobs-empty">
                <span className="material-symbols-outlined">work_off</span>
                <h3>No jobs found</h3>
                <p>Try adjusting your search or filters</p>
                {hasActiveFilters && (
                  <button className="jobs-retry-btn" onClick={clearFilters}>Clear Filters</button>
                )}
              </div>
            ) : (
              <>
                <p className="jobs-count">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
                <div className="jobs-grid">
                  {jobs.map(job => (
                    <JobCard key={job._id} job={job} onClick={(id) => navigate(`/jobs/${id}`)} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Jobs
