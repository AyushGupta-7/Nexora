import React, { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import './CreatePost.css'

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=00dce3&color=041329`

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be under 8MB')
      return
    }

    setSelectedImage(file)
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!content.trim() && !selectedImage) {
      setError('Please write something or add an image')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('content', content.trim() || ' ')
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data.success) {
        setContent('')
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (onPostCreated) onPostCreated(response.data.post)
      } else {
        setError(response.data.message || 'Failed to create post')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-post">
      <div className="create-post-header">
        <div className="create-post-avatar">
          <img src={userAvatar} alt={user?.fullName || 'User'} />
        </div>
        <div className="create-post-input-wrapper">
          <textarea
            className="create-post-textarea"
            placeholder="Share your latest insight..."
            value={content}
            onChange={(e) => { setContent(e.target.value); if (error) setError('') }}
            rows={2}
          />
        </div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="create-post-image-preview">
          <img src={imagePreview} alt="Preview" />
          <button className="remove-image-btn" onClick={handleRemoveImage} title="Remove image">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {error && <div className="create-post-error">{error}</div>}

      <div className="create-post-actions">
        <div className="create-post-tools">
          <button className="tool-btn" onClick={() => fileInputRef.current?.click()} type="button">
            <span className="material-symbols-outlined">image</span>
            <span>Media</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>
        <button
          className={`post-submit-btn ${loading ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && !selectedImage)}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  )
}

export default CreatePost