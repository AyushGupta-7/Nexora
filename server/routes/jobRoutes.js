const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { getJobs, getJob, createJob, updateJob, deleteJob } = require('../controllers/jobController')

router.route('/')
  .get(protect, getJobs)
  .post(protect, createJob)

router.route('/:id')
  .get(protect, getJob)
  .put(protect, updateJob)
  .delete(protect, deleteJob)

module.exports = router
