import api from './api'

export const applyForJob = async (applicationData) => {
  try {
    const response = await api.post('/applications', applicationData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMyApplications = async () => {
  try {
    const response = await api.get('/applications')
    return response.data
  } catch (error) {
    throw error
  }
}

export const getApplication = async (applicationId) => {
  try {
    const response = await api.get(`/applications/${applicationId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const withdrawApplication = async (applicationId) => {
  try {
    const response = await api.put(`/applications/${applicationId}/withdraw`)
    return response.data
  } catch (error) {
    throw error
  }
}
