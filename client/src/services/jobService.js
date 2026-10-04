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

export const createJob = async (formData) => {
  try {
    const response = await api.post('/jobs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateJob = async (jobId, jobData) => {
  try {
    const response = await api.put(`/jobs/${jobId}`, jobData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteJob = async (jobId) => {
  try {
    const response = await api.delete(`/jobs/${jobId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const closeApplications = async (jobId) => {
  try {
    const response = await api.put(`/jobs/${jobId}/close-applications`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getMyPostedJobs = async () => {
  try {
    const response = await api.get('/jobs/recruiter/mine')
    return response.data
  } catch (error) {
    throw error
  }
}

export const getJobApplicants = async (jobId) => {
  try {
    const response = await api.get(`/jobs/${jobId}/applicants`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateApplicantStage = async (jobId, applicationId, stage) => {
  try {
    const response = await api.put(`/jobs/${jobId}/applicants/${applicationId}/stage`, { stage })
    return response.data
  } catch (error) {
    throw error
  }
}
