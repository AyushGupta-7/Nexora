const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const resumeUpload = require('../middleware/resumeUpload')
const { getResumes, uploadResume, renameResume, deleteResume } = require('../controllers/resumeController')

router.route('/')
  .get(protect, getResumes)
  .post(protect, resumeUpload.single('resume'), uploadResume)

router.route('/:id')
  .put(protect, renameResume)
  .delete(protect, deleteResume)

module.exports = router
