import api from './api'

export const getResumes = async () => {
  try {
    const response = await api.get('/resumes')
    return response.data
  } catch (error) {
    throw error
  }
}

export const uploadResume = async (formData) => {
  try {
    const response = await api.post('/resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const renameResume = async (resumeId, name) => {
  try {
    const response = await api.put(`/resumes/${resumeId}`, { name })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteResume = async (resumeId) => {
  try {
    const response = await api.delete(`/resumes/${resumeId}`)
    return response.data
  } catch (error) {
    throw error
  }
}
