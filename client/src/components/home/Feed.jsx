import React, { useState, useEffect } from 'react'
import CreatePost from './CreatePost'
import PostCard from './PostCard'
import { getPosts } from '../../services/postService'
import './Feed.css'

const Feed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = await getPosts()
      if (response.success) {
        setPosts(response.posts || [])
      } else {
        setError(response.message || 'Failed to load posts')
      }
    } catch (err) {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev])
  }

  if (loading) {
    return (
      <div className="feed-loading">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="feed">
      <CreatePost onPostCreated={handlePostCreated} />
      
      <div className="feed-divider">
        <span className="divider-line"></span>
        <span className="divider-text">Latest Updates</span>
        <span className="divider-line"></span>
      </div>

      {error && (
        <div className="feed-error">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {posts.length === 0 && !error && (
        <div className="feed-empty">
          <span className="material-symbols-outlined">post_add</span>
          <p>No posts yet. Be the first to share!</p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} onPostUpdated={loadPosts} />
      ))}
    </div>
  )
}

export default Feed