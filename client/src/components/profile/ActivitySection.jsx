import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import CreatePost from '../home/CreatePost'
import PostCard from '../home/PostCard'
import { getPosts } from '../../services/postService'
import './ActivitySection.css'

const ActivitySection = ({ profile, user, onUpdate }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = await getPosts()
      if (response.success) {
        // Filter posts by user
        const userPosts = response.posts.filter(
          post => post.author?._id === user?._id
        )
        setPosts(userPosts)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [user])

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev])
  }

  return (
    <section className="activity-section">
      <div className="activity-header">
        <h2 className="activity-title">Activity</h2>
        <div className="activity-header-actions">
          <button className="activity-filter-btn">
            <span className="material-symbols-outlined">filter_list</span>
            Filter
          </button>
        </div>
      </div>

      <div className="activity-content">
        <CreatePost onPostCreated={handlePostCreated} />
        
        {loading ? (
          <div className="activity-loading">
            <div className="loader"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="activity-empty">
            <span className="material-symbols-outlined">post_add</span>
            <p>No posts yet. Share your first post!</p>
          </div>
        ) : (
          <div className="activity-posts">
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onPostUpdated={loadPosts} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ActivitySection