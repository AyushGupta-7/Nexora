const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { resumeUpload } = require('../middleware/upload')
const { getResumes, uploadResume, renameResume, deleteResume, viewResume, downloadResume } = require('../controllers/resumeController')


router.route('/')
  .get(protect, getResumes)
  .post(protect, resumeUpload.single('resume'), uploadResume)

// These must come before /:id so Express doesn't match 'view'/'download' as an id param
router.get('/:id/view', protect, viewResume)
router.get('/:id/download', protect, downloadResume)

router.route('/:id')
  .put(protect, renameResume)
  .delete(protect, deleteResume)

module.exports = router
