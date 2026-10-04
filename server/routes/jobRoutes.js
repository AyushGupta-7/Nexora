const express = require('express')
const router = express.Router()
const { protect, recruiterOnly } = require('../middleware/auth')
const { jdUpload } = require('../middleware/upload')
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  closeApplications,
  getMyPostedJobs,
  getJobApplicants,
  updateApplicantStage,
  viewJD,
  downloadJD,
} = require('../controllers/jobController')

// Public listings (all authenticated users)
router.route('/')
  .get(protect, getJobs)
  .post(protect, recruiterOnly, jdUpload.single('jd'), createJob)

// Recruiter: get only their own posted jobs
router.get('/recruiter/mine', protect, recruiterOnly, getMyPostedJobs)

// JD view/download (all authenticated users can view)
router.get('/:id/jd/view', protect, viewJD)
router.get('/:id/jd/download', protect, downloadJD)

// Recruiter: close applications
router.put('/:id/close-applications', protect, recruiterOnly, closeApplications)

// Recruiter: view and manage applicants for a specific job
router.get('/:id/applicants', protect, recruiterOnly, getJobApplicants)
router.put('/:id/applicants/:applicationId/stage', protect, recruiterOnly, updateApplicantStage)

// Job CRUD
router.route('/:id')
  .get(protect, getJob)
  .put(protect, recruiterOnly, updateJob)
  .delete(protect, recruiterOnly, deleteJob)

module.exports = router
