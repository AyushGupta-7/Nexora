const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const upload = require('../middleware/upload')
const { coverUpload } = require('../middleware/upload')
const {
  getProfile,
  getProfileById,
  updateProfile,
  uploadAvatar,
  uploadCover,
  addSkill,
  removeSkill,
  addExperience,
  removeExperience,
  addEducation,
  removeEducation
} = require('../controllers/profileController')

// Own profile (must come before /:userId to avoid conflict)
router.route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile)

// Specific sub-routes (must come BEFORE /:userId to avoid conflict)
router.route('/avatar')
  .post(protect, upload.single('avatar'), uploadAvatar)

router.route('/cover')
  .post(protect, coverUpload.single('cover'), uploadCover)

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

// Public profile by userId — LAST to avoid capturing sub-routes
router.route('/:userId')
  .get(protect, getProfileById)

module.exports = router