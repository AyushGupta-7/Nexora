const Job = require('../models/Job')

// @desc    Get all jobs (with search/filter)
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

    if (location) {
      filter.location = { $regex: location, $options: 'i' }
    }

    if (type) {
      filter.type = type
    }

    if (experience) {
      filter.experience = { $regex: experience, $options: 'i' }
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'fullName avatar title')
      .sort({ createdAt: -1 })
      .limit(50)

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'fullName avatar title')

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      })
    }

    res.status(200).json({
      success: true,
      job,
    })
  } catch (error) {
    console.error('Get job error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Create job
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res) => {
  try {
    const {
      title, company, companyLogo, location, type, experience,
      salary, skills, description, responsibilities, requirements, deadline,
    } = req.body

    if (!title || !company || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, company, location, and description are required',
      })
    }

    const job = await Job.create({
      title,
      company,
      companyLogo: companyLogo || '',
      location,
      type: type || 'Full-time',
      experience: experience || '0-1 years',
      salary: salary || '',
      skills: skills || [],
      description,
      responsibilities: responsibilities || [],
      requirements: requirements || [],
      postedBy: req.user._id,
      deadline: deadline || null,
    })

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job,
    })
  } catch (error) {
    console.error('Create job error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' })
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const allowedUpdates = ['title', 'company', 'companyLogo', 'location', 'type', 'experience',
      'salary', 'skills', 'description', 'responsibilities', 'requirements', 'deadline', 'isActive']
    
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

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' })
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    await job.deleteOne()

    res.status(200).json({ success: true, message: 'Job deleted' })
  } catch (error) {
    console.error('Delete job error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
}
