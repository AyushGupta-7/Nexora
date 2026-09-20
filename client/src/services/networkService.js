import api from './api'

export const getUsers = async (search = '') => {
  try {
    const params = search ? { search } : {}
    const response = await api.get('/network/users', { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getRequests = async () => {
  try {
    const response = await api.get('/network/requests')
    return response.data
  } catch (error) {
    throw error
  }
}

export const getConnections = async () => {
  try {
    const response = await api.get('/network/connections')
    return response.data
  } catch (error) {
    throw error
  }
}

export const sendRequest = async (userId) => {
  try {
    const response = await api.post(`/network/connect/${userId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const acceptRequest = async (userId) => {
  try {
    const response = await api.post(`/network/accept/${userId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const rejectRequest = async (userId) => {
  try {
    const response = await api.post(`/network/reject/${userId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const removeConnection = async (userId) => {
  try {
    const response = await api.delete(`/network/${userId}`)
    return response.data
  } catch (error) {
    throw error
  }
}
