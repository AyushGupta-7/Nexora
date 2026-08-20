import React, { createContext, useState, useContext, useEffect } from 'react'
import { getPosts } from '../services/postService'

const PostContext = createContext(null)

export const usePosts = () => {
  const context = useContext(PostContext)
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider')
  }
  return context
}

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = await getPosts()
      if (response.success) {
        setPosts(response.posts)
      } else {
        setError(response.message || 'Failed to load posts')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const addPost = (newPost) => {
    setPosts(prev => [newPost, ...prev])
  }

  const updatePost = (updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p))
  }

  const removePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId))
  }

  const value = {
    posts,
    loading,
    error,
    loadPosts,
    addPost,
    updatePost,
    removePost,
  }

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  )
}