import api from './api'

// Post CRUD
export const getPosts = async () => {
  try {
    const response = await api.get('/posts')
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPost = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createPost = async (postData) => {
  try {
    const response = await api.post('/posts', postData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updatePost = async (postId, postData) => {
  try {
    const response = await api.put(`/posts/${postId}`, postData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Like functions
export const likePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/like`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const unlikePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}/unlike`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Comment functions
export const addComment = async (postId, commentData) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, commentData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteComment = async (postId, commentId) => {
  try {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const likeComment = async (postId, commentId) => {
  try {
    const response = await api.post(`/posts/${postId}/comments/${commentId}/like`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const unlikeComment = async (postId, commentId) => {
  try {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}/unlike`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Reply functions
export const addReply = async (postId, commentId, replyData) => {
  try {
    const response = await api.post(`/posts/${postId}/comments/${commentId}/replies`, replyData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteReply = async (postId, commentId, replyId) => {
  try {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}/replies/${replyId}`)
    return response.data
  } catch (error) {
    throw error
  }
}