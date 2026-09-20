const Application = require('../models/Application')
const Job = require('../models/Job')
const Resume = require('../models/Resume')

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private
const applyForJob = async (req, res) => {
  try {
    const { jobId, resumeId, coverNote } = req.body

    if (!jobId || !resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Job and resume are required',
      })
    }

    // Verify job exists
    const job = await Job.findById(jobId)
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: 'Job not found or no longer active' })
    }

    // Verify resume belongs to user
    const resume = await Resume.findById(resumeId)
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' })
    }
    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to use this resume' })
    }

    // Check for duplicate application
    const existing = await Application.findOne({ user: req.user._id, job: jobId })
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' })
    }

    const application = await Application.create({
      user: req.user._id,
      job: jobId,
      resume: resumeId,
      coverNote: coverNote || '',
    })

    const populated = await Application.findById(application._id)
      .populate('job', 'title company location type')
      .populate('resume', 'name fileUrl')

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: populated,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' })
    }
    console.error('Apply error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Get my applications
// @route   GET /api/applications
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('job', 'title company location type experience salary companyLogo')
      .populate('resume', 'name fileUrl')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    })
  } catch (error) {
    console.error('Get applications error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company location type experience salary description')
      .populate('resume', 'name fileUrl')

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' })
    }

    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    res.status(200).json({ success: true, application })
  } catch (error) {
    console.error('Get application error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Withdraw application
// @route   PUT /api/applications/:id/withdraw
// @access  Private
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' })
    }

    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    if (application.status === 'Withdrawn') {
      return res.status(400).json({ success: false, message: 'Already withdrawn' })
    }

    application.status = 'Withdrawn'
    await application.save()

    res.status(200).json({ success: true, message: 'Application withdrawn', application })
  } catch (error) {
    console.error('Withdraw error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

module.exports = {
  applyForJob,
  getMyApplications,
  getApplication,
  withdrawApplication,
}
