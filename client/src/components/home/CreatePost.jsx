import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createPost } from '../../services/postService'
import './CreatePost.css'

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please write something to post')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await createPost({ content: content.trim() })
      if (response.success) {
        setContent('')
        if (onPostCreated) onPostCreated(response.post)
      } else {
        setError(response.message || 'Failed to create post')
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
      {error && <div className="create-post-error">{error}</div>}
      <div className="create-post-actions">
        <div className="create-post-tools">
          <button className="tool-btn">
            <span className="material-symbols-outlined">image</span>
            <span>Media</span>
          </button>
          <button className="tool-btn">
            <span className="material-symbols-outlined">article</span>
            <span>Article</span>
          </button>
        </div>
        <button
          className={`post-submit-btn ${loading ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  )
}

export default CreatePost