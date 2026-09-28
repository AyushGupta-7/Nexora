import React, { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import './CreatePost.css'

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const fileInputRef = useRef(null)

  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=00dce3&color=041329`

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    if (selectedImages.length + files.length > 5) {
      setError('Maximum 5 images allowed per post')
      return
    }

    const validFiles = []
    const newPreviews = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed')
        return
      }
      if (file.size > 8 * 1024 * 1024) {
        setError('Image must be under 8MB')
        return
      }
      validFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    }

    setSelectedImages(prev => [...prev, ...validFiles])
    setImagePreviews(prev => [...prev, ...newPreviews])
    setError('')
  }

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      // revoke object url to avoid memory leak
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      setError('Please write something or add an image')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      if (content.trim()) {
        formData.append('content', content.trim())
      }
      
      selectedImages.forEach((image) => {
        formData.append('images', image)
      })

      const response = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data.success) {
        setContent('')
        setSelectedImages([])
        imagePreviews.forEach(url => URL.revokeObjectURL(url))
        setImagePreviews([])
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

      {/* Multiple Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="create-post-images-preview">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="create-post-image-item">
              <img src={preview} alt={`Preview ${index + 1}`} />
              <button 
                className="remove-image-btn" 
                onClick={() => handleRemoveImage(index)} 
                title="Remove image"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <div className="create-post-error">{error}</div>}

      <div className="create-post-actions">
        <div className="create-post-tools">
          <button 
            className="tool-btn" 
            onClick={() => fileInputRef.current?.click()} 
            type="button"
            disabled={selectedImages.length >= 5}
            style={{ opacity: selectedImages.length >= 5 ? 0.5 : 1 }}
          >
            <span className="material-symbols-outlined">image</span>
            <span>Media {selectedImages.length > 0 && `(${selectedImages.length}/5)`}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>
        <button
          className={`post-submit-btn ${loading ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && selectedImages.length === 0)}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  )
}

export default CreatePost