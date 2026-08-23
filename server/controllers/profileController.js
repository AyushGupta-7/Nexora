const User = require('../models/User')

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      profile: user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const updates = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Update allowed fields
    const allowedUpdates = [
      'fullName', 'title', 'location', 'about', 'avatar', 
      'coverImage', 'skills', 'experiences', 'educations'
    ]
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field]
      }
    })

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: user
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    })
  }
}

// @desc    Add skill
// @route   POST /api/profile/skills
// @access  Private
const addSkill = async (req, res) => {
  try {
    const { name, endorsements } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.skills.push({ name, endorsements: endorsements || 0 })
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Skill added successfully',
      skills: user.skills
    })
  } catch (error) {
    console.error('Add skill error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    })
  }
}

// @desc    Remove skill
// @route   DELETE /api/profile/skills/:skillId
// @access  Private
const removeSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.skills = user.skills.filter(
      skill => skill._id.toString() !== req.params.skillId
    )
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Skill removed successfully',
      skills: user.skills
    })
  } catch (error) {
    console.error('Remove skill error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    })
  }
}

// @desc    Add experience
// @route   POST /api/profile/experience
// @access  Private
const addExperience = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.experiences.push(req.body)
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Experience added successfully',
      experiences: user.experiences
    })
  } catch (error) {
    console.error('Add experience error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    })
  }
}

// @desc    Remove experience
// @route   DELETE /api/profile/experience/:expId
// @access  Private
const removeExperience = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.experiences = user.experiences.filter(
      exp => exp._id.toString() !== req.params.expId
    )
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Experience removed successfully',
      experiences: user.experiences
    })
  } catch (error) {
    console.error('Remove experience error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    })
  }
}

// @desc    Add education
// @route   POST /api/profile/education
// @access  Private
const addEducation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.educations.push(req.body)
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Education added successfully',
      educations: user.educations
    })
  } catch (error) {
    console.error('Add education error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    })
  }
}

// @desc    Remove education
// @route   DELETE /api/profile/education/:eduId
// @access  Private
const removeEducation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.educations = user.educations.filter(
      edu => edu._id.toString() !== req.params.eduId
    )
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Education removed successfully',
      educations: user.educations
    })
  } catch (error) {
    console.error('Remove education error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    })
  }
}

module.exports = {
  getProfile,
  updateProfile,
  addSkill,
  removeSkill,
  addExperience,
  removeExperience,
  addEducation,
  removeEducation
}