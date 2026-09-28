import React, { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import ConfirmModal from '../components/common/ConfirmModal'
import { getResumes, uploadResume, renameResume, deleteResume } from '../services/resumeService'
import { formatDistanceToNow } from 'date-fns'
import './Resumes.css'

const Resumes = () => {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadName, setUploadName] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteResumeId, setDeleteResumeId] = useState(null)
  const [deleteResumeLoading, setDeleteResumeLoading] = useState(false)
  const [viewingId, setViewingId] = useState(null)      // resume._id being viewed/downloaded
  const [downloadingId, setDownloadingId] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  // Fetch the PDF through the authenticated backend proxy, return a blob URL
  const fetchPdfBlob = async (resumeId, action) => {
    const token = localStorage.getItem('token')
    const resp = await fetch(`${API_URL}/resumes/${resumeId}/${action}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
    if (!resp.ok) throw new Error(`Server returned ${resp.status}`)
    const blob = await resp.blob()
    return URL.createObjectURL(blob)
  }

  // Opens PDF inline in a new browser tab — no download
  const handleViewResume = async (resume) => {
    if (viewingId === resume._id) return   // already loading
    setViewingId(resume._id)
    try {
      const blobUrl = await fetchPdfBlob(resume._id, 'view')
      window.open(blobUrl, '_blank', 'noopener,noreferrer')
      // Revoke after a short delay — browser has already opened it by then
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000)
    } catch (err) {
      console.error('View resume error:', err)
      alert('Could not open the PDF. Please try again.')
    } finally {
      setViewingId(null)
    }
  }

  // Forces the browser to download the PDF with a proper filename
  const handleDownloadResume = async (resume) => {
    if (downloadingId === resume._id) return   // already downloading
    setDownloadingId(resume._id)
    try {
      const blobUrl = await fetchPdfBlob(resume._id, 'download')
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${resume.name || 'Resume'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
    } catch (err) {
      console.error('Download resume error:', err)
      alert('Could not download the PDF. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    setLoading(true)
    try {
      const response = await getResumes()
      if (response.success) setResumes(response.resumes)
    } catch (err) {
      setError('Failed to load resumes')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be under 5MB')
      return
    }
    setUploadFile(file)
    setUploadError('')
    if (!uploadName) {
      setUploadName(file.name.replace('.pdf', ''))
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) { setUploadError('Please select a PDF file'); return }
    if (!uploadName.trim()) { setUploadError('Please provide a resume name'); return }

    setUploading(true)
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('resume', uploadFile)
      formData.append('name', uploadName.trim())

      const response = await uploadResume(formData)
      if (response.success) {
        setResumes(prev => [response.resume, ...prev])
        setShowUploadModal(false)
        setUploadFile(null)
        setUploadName('')
      } else {
        setUploadError(response.message || 'Upload failed')
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRenameStart = (resume) => {
    setRenamingId(resume._id)
    setRenameValue(resume.name)
  }

  const handleRenameSave = async (resumeId) => {
    if (!renameValue.trim()) return
    try {
      const response = await renameResume(resumeId, renameValue.trim())
      if (response.success) {
        setResumes(prev => prev.map(r => r._id === resumeId ? { ...r, name: renameValue.trim() } : r))
      }
    } catch (err) {
      console.error('Rename error:', err)
    } finally {
      setRenamingId(null)
    }
  }

  const handleDelete = (resumeId) => {
    setDeleteResumeId(resumeId)
  }

  const confirmDelete = async () => {
    setDeleteResumeLoading(true)
    try {
      const response = await deleteResume(deleteResumeId)
      if (response.success) {
        setResumes(prev => prev.filter(r => r._id !== deleteResumeId))
        setDeleteResumeId(null)
      }
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeleteResumeLoading(false)
    }
  }

  const formatBytes = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (date) => {
    try { return formatDistanceToNow(new Date(date), { addSuffix: true }) }
    catch { return '' }
  }

  return (
    <div className="resumes-page">
      <Navbar />
      <main className="resumes-main">
        {/* Header */}
        <div className="resumes-header">
          <div className="resumes-header-text">
            <h1 className="resumes-title">My Resumes</h1>
            <p className="resumes-subtitle">Manage multiple resumes and apply with the right one</p>
          </div>
          <button className="resumes-upload-btn" onClick={() => { setShowUploadModal(true); setUploadFile(null); setUploadName(''); setUploadError('') }}>
            <span className="material-symbols-outlined">upload</span>
            Upload Resume
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="resumes-loading">
            <div className="loader"></div>
            <p>Loading resumes...</p>
          </div>
        ) : error ? (
          <div className="resumes-error">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="resumes-empty">
            <span className="material-symbols-outlined">description</span>
            <h3>No resumes yet</h3>
            <p>Upload your first resume to start applying for jobs</p>
            <button className="resumes-upload-btn" onClick={() => { setShowUploadModal(true); setUploadFile(null); setUploadName(''); setUploadError('') }}>
              <span className="material-symbols-outlined">upload</span>
              Upload Resume
            </button>
          </div>
        ) : (
          <div className="resumes-grid">
            {resumes.map(resume => (
              <div key={resume._id} className="resume-card">
                <div className="resume-card-icon">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="resume-card-content">
                  {renamingId === resume._id ? (
                    <div className="resume-rename-form">
                      <input
                        className="resume-rename-input"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameSave(resume._id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        autoFocus
                      />
                      <div className="resume-rename-actions">
                        <button className="resume-action-btn save" onClick={() => handleRenameSave(resume._id)}>Save</button>
                        <button className="resume-action-btn cancel" onClick={() => setRenamingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <h3 className="resume-name">{resume.name}</h3>
                  )}
                  <div className="resume-meta">
                    {resume.fileSize && <span>{formatBytes(resume.fileSize)}</span>}
                    <span>Updated {formatDate(resume.updatedAt)}</span>
                  </div>
                </div>
                <div className="resume-card-actions">
                  {/* View — opens PDF inline in browser, no download */}
                  <button
                    className="resume-icon-btn"
                    title={viewingId === resume._id ? 'Opening…' : 'View PDF'}
                    onClick={() => handleViewResume(resume)}
                    disabled={viewingId === resume._id || downloadingId === resume._id}
                  >
                    <span className="material-symbols-outlined">
                      {viewingId === resume._id ? 'hourglass_top' : 'visibility'}
                    </span>
                  </button>
                  {/* Download — forces PDF file download with correct name */}
                  <button
                    className="resume-icon-btn"
                    title={downloadingId === resume._id ? 'Downloading…' : 'Download PDF'}
                    onClick={() => handleDownloadResume(resume)}
                    disabled={viewingId === resume._id || downloadingId === resume._id}
                  >
                    <span className="material-symbols-outlined">
                      {downloadingId === resume._id ? 'hourglass_top' : 'download'}
                    </span>
                  </button>
                  <button
                    className="resume-icon-btn"
                    title="Rename"
                    onClick={() => handleRenameStart(resume)}
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    className="resume-icon-btn delete"
                    title="Delete"
                    onClick={() => handleDelete(resume._id)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Resume</h2>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="upload-area" onClick={() => document.getElementById('resume-file-input').click()}>
                {uploadFile ? (
                  <div className="upload-file-selected">
                    <span className="material-symbols-outlined">description</span>
                    <span className="upload-filename">{uploadFile.name}</span>
                    <span className="upload-filesize">{formatBytes(uploadFile.size)}</span>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined upload-icon">upload_file</span>
                    <p className="upload-hint">Click to select a PDF file</p>
                    <p className="upload-hint-small">Max size: 5MB · PDF only</p>
                  </>
                )}
              </div>
              <input
                id="resume-file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <div className="modal-field">
                <label className="modal-label">Resume Name</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Backend Developer Resume"
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                />
              </div>

              {uploadError && <p className="modal-error">{uploadError}</p>}

              <div className="modal-actions">
                <button className="modal-btn modal-btn-ghost" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button className="modal-btn modal-btn-primary" onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Resume'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteResumeId}
        title="Delete this resume?"
        message="This action cannot be undone. The resume file will be permanently removed."
        confirmLabel="Delete"
        loading={deleteResumeLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteResumeId(null)}
      />
    </div>
  )
}

export default Resumes
