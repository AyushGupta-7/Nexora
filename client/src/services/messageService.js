import api from './api'

export const getOrCreateConversation = async (userId) => {
  const response = await api.post('/messages/conversation', { userId })
  return response.data
}

export const getConversations = async () => {
  const response = await api.get('/messages/conversations')
  return response.data
}

export const getMessages = async (conversationId) => {
  const response = await api.get(`/messages/${conversationId}`)
  return response.data
}

export const sendMessage = async (conversationId, content) => {
  const response = await api.post('/messages', { conversationId, content })
  return response.data
}

export const sendMediaMessage = async (conversationId, content, imageFile) => {
  const formData = new FormData()
  formData.append('conversationId', conversationId)
  if (content && content.trim()) {
    formData.append('content', content.trim())
  }
  if (imageFile) {
    formData.append('image', imageFile)
  }
  const response = await api.post('/messages/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
