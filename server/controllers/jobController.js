const Job = require('../models/Job')
const Application = require('../models/Application')
const cloudinary = require('../config/cloudinary')
const https = require('https')
const http = require('http')

// Agent that bypasses TLS cert chain errors caused by local TLS inspection proxy
const cloudinaryAgent = new https.Agent({ rejectUnauthorized: false })

// ── Public: Get all active jobs (with search/filter) ─────────────────────────
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const { search, location, type, experience } = req.query

    const filter = { isActive: true }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $elemMatch: { $regex: search, $options: 'i' } } },
      ]
    }

    if (location) filter.location = { $regex: location, $options: 'i' }
    if (type) filter.type = type
    if (experience) filter.experience = { $regex: experience, $options: 'i' }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'fullName avatar title companyName role')
      .sort({ createdAt: -1 })
      .limit(50)

    res.status(200).json({ success: true, count: jobs.length, jobs })
  } catch (error) {
    console.error('Get jobs error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// ── Get single job ────────────────────────────────────────────────────────────
// @route   GET /api/jobs/:id
// @access  Private
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'fullName avatar title companyName role')

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' })
    }

    res.status(200).json({ success: true, job })
  } catch (error) {
    console.error('Get job error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// ── Create job (recruiter only) ───────────────────────────────────────────────
// @route   POST /api/jobs
// @access  Private + Recruiter
const createJob = async (req, res) => {
  try {
    const {
      title, company, companyLogo, location, type, experience,
      salary, skills, description, responsibilities, requirements, deadline, duration,
    } = req.body

    if (!title || !company || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, company, location, and description are required',
      })
    }

    const jobData = {
      title,
      company,
      companyLogo: companyLogo || '',
      location,
      type: type || 'Full-time',
      experience: experience || '',
      salary: salary || '',
      skills: skills
        ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean))
        : [],
      description,
      responsibilities: responsibilities
        ? (Array.isArray(responsibilities) ? responsibilities : responsibilities.split(',').map(s => s.trim()).filter(Boolean))
        : [],
      requirements: requirements
        ? (Array.isArray(requirements) ? requirements : requirements.split(',').map(s => s.trim()).filter(Boolean))
        : [],
      postedBy: req.user._id,
      deadline: deadline || null,
      duration: duration || '',
    }

    // JD PDF upload via multer
    if (req.file) {
      jobData.jdUrl = req.file.path
      jobData.jdPublicId = req.file.filename || ''
    }

    const job = await Job.create(jobData)

    res.status(201).json({ success: true, message: 'Job posted successfully', job })
  } catch (error) {
    console.error('Create job error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// ── Update job (recruiter, owner only) ───────────────────────────────────────
// @route   PUT /api/jobs/:id
// @access  Private + Recruiter
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const allowedUpdates = ['title', 'company', 'companyLogo', 'location', 'type', 'experience',
      'salary', 'skills', 'description', 'responsibilities', 'requirements', 'deadline', 'isActive', 'duration']
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field]
      }
    })

    await job.save()

    res.status(200).json({ success: true, message: 'Job updated', job })
  } catch (error) {
    console.error('Update job error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// ── Close applications (recruiter, owner only) ───────────────────────────────
// @route   PUT /api/jobs/:id/close-applications
// @access  Private + Recruiter
const closeApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    job.applicationsOpen = false
    await job.save()

    res.status(200).json({ success: true, message: 'Applications closed', job })
  } catch (error) {
    console.error('Close applications error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// ── Delete job (recruiter, owner only) ───────────────────────────────────────
// @route   DELETE /api/jobs/:id
// @access  Private + Recruiter
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    // Delete JD from Cloudinary if exists
    if (job.jdPublicId) {
      try {
        await cloudinary.uploader.destroy(job.jdPublicId, { resource_type: 'raw' })
      } catch (cloudErr) {
        console.error('Cloudinary JD delete error:', cloudErr.message)
      }
    }

    await job.deleteOne()

    res.status(200).json({ success: true, message: 'Job deleted' })
  } catch (error) {
    console.error('Delete job error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// ── Get recruiter's own posted jobs ──────────────────────────────────────────
// @route   GET /api/jobs/recruiter/mine
// @access  Private + Recruiter
const getMyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 })

    // Add application count to each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ job: job._id, status: { $ne: 'Withdrawn' } })
        return { ...job.toObject(), applicationCount: count }
      })
    )

    res.status(200).json({ success: true, count: jobs.length, jobs: jobsWithCounts })
  } catch (error) {
    console.error('Get my posted jobs error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// ── Get applicants for a specific job (recruiter, owner only) ─────────────────
// @route   GET /api/jobs/:id/applicants
// @access  Private + Recruiter
const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const applications = await Application.find({ job: req.params.id })
      .populate('user', 'fullName email avatar title')
      .populate('resume', 'name fileUrl')
      .sort({ createdAt: -1 })

    res.status(200).json({ success: true, count: applications.length, applications, job })
  } catch (error) {
    console.error('Get job applicants error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// ── Update applicant stage (recruiter, owner only) ────────────────────────────
// @route   PUT /api/jobs/:id/applicants/:applicationId/stage
// @access  Private + Recruiter
const updateApplicantStage = async (req, res) => {
  try {
    const { stage } = req.body

    const validStages = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'DSA Round', 'Technical Interview', 'HR Interview', 'Selected', 'Rejected', 'Withdrawn']
    if (!stage || !validStages.includes(stage)) {
      return res.status(400).json({ success: false, message: 'Invalid stage' })
    }

    const job = await Job.findById(req.params.id)
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const application = await Application.findById(req.params.applicationId)
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' })

    if (application.job.toString() !== req.params.id) {
      return res.status(400).json({ success: false, message: 'Application does not belong to this job' })
    }

    application.status = stage
    application.stage = stage
    await application.save()

    res.status(200).json({ success: true, message: 'Stage updated', application })
  } catch (error) {
    console.error('Update applicant stage error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// ── JD PDF proxy helpers ──────────────────────────────────────────────────────
const proxyPdf = (res, fileUrl, disposition) => {
  const isHttps = fileUrl.startsWith('https')
  const options = isHttps ? { agent: cloudinaryAgent } : {}
  const lib = isHttps ? https : http

  lib.get(fileUrl, options, (cloudRes) => {
    if (cloudRes.statusCode !== 200) {
      return res.status(502).json({ success: false, message: `Storage returned ${cloudRes.statusCode}` })
    }
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', disposition)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    cloudRes.pipe(res)
  }).on('error', (err) => {
    res.status(502).json({ success: false, message: 'Failed to fetch PDF: ' + err.message })
  })
}

// @route   GET /api/jobs/:id/jd/view
// @access  Private
const viewJD = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })
    if (!job.jdUrl) return res.status(404).json({ success: false, message: 'No JD uploaded for this job' })
    proxyPdf(res, job.jdUrl, 'inline')
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @route   GET /api/jobs/:id/jd/download
// @access  Private
const downloadJD = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })
    if (!job.jdUrl) return res.status(404).json({ success: false, message: 'No JD uploaded for this job' })
    const safeName = (job.title || 'JD').replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '_')
    proxyPdf(res, job.jdUrl, `attachment; filename="${safeName}_JD.pdf"`)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

module.exports = {
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
}
