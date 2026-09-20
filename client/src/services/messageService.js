import api from './api'

export const getOrCreateConversation = async (userId) => {
  try {
    const response = await api.post('/messages/conversation', { userId })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getConversations = async () => {
  try {
    const response = await api.get('/messages/conversations')
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMessages = async (conversationId) => {
  try {
    const response = await api.get(`/messages/${conversationId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const sendMessage = async (conversationId, content) => {
  try {
    const response = await api.post('/messages', { conversationId, content })
    return response.data
  } catch (error) {
    throw error
  }
}
