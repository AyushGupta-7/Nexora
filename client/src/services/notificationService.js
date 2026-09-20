import api from './api'

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications')
    return response.data
  } catch (error) {
    throw error
  }
}

export const markRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const markAllRead = async () => {
  try {
    const response = await api.put('/notifications/read-all')
    return response.data
  } catch (error) {
    throw error
  }
}
