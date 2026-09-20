import api from './api'

export const getJobs = async (params = {}) => {
  try {
    const response = await api.get('/jobs', { params })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getJob = async (jobId) => {
  try {
    const response = await api.get(`/jobs/${jobId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const createJob = async (jobData) => {
  try {
    const response = await api.post('/jobs', jobData)
    return response.data
  } catch (error) {
    throw error
  }
}
