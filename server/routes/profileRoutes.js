const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getProfile,
  updateProfile,
  addSkill,
  removeSkill,
  addExperience,
  removeExperience,
  addEducation,
  removeEducation
} = require('../controllers/profileController')

router.route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile)

router.route('/skills')
  .post(protect, addSkill)

router.route('/skills/:skillId')
  .delete(protect, removeSkill)

router.route('/experience')
  .post(protect, addExperience)

router.route('/experience/:expId')
  .delete(protect, removeExperience)

router.route('/education')
  .post(protect, addEducation)

router.route('/education/:eduId')
  .delete(protect, removeEducation)

module.exports = router