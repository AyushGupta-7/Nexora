const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { applyForJob, getMyApplications, getApplication, withdrawApplication } = require('../controllers/applicationController')

router.route('/')
  .get(protect, getMyApplications)
  .post(protect, applyForJob)

router.route('/:id')
  .get(protect, getApplication)

router.put('/:id/withdraw', protect, withdrawApplication)

module.exports = router
