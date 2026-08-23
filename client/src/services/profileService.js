import api from './api'

export const getProfile = async () => {
  try {
    const response = await api.get('/profile')
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const addSkill = async (skillData) => {
  try {
    const response = await api.post('/profile/skills', skillData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const removeSkill = async (skillId) => {
  try {
    const response = await api.delete(`/profile/skills/${skillId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const addExperience = async (expData) => {
  try {
    const response = await api.post('/profile/experience', expData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const removeExperience = async (expId) => {
  try {
    const response = await api.delete(`/profile/experience/${expId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const addEducation = async (eduData) => {
  try {
    const response = await api.post('/profile/education', eduData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const removeEducation = async (eduId) => {
  try {
    const response = await api.delete(`/profile/education/${eduId}`)
    return response.data
  } catch (error) {
    throw error
  }
}