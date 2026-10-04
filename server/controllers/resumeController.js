const Resume = require('../models/Resume')
const cloudinary = require('../config/cloudinary')

// @desc    Get all resumes for current user
// @route   GET /api/resumes
// @access  Private
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      resumes,
    })
  } catch (error) {
    console.error('Get resumes error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Upload a resume
// @route   POST /api/resumes
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file',
      })
    }

    const { name } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name for this resume',
      })
    }

    const resume = await Resume.create({
      user: req.user._id,
      name: name.trim(),
      fileUrl: req.file.path,
      publicId: req.file.filename || '',
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    })

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume,
    })
  } catch (error) {
    console.error('Upload resume error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Rename a resume
// @route   PUT /api/resumes/:id
// @access  Private
const renameResume = async (req, res) => {
  try {
    const { name } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a name' })
    }

    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' })
    }

    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    resume.name = name.trim()
    await resume.save()

    res.status(200).json({
      success: true,
      message: 'Resume renamed successfully',
      resume,
    })
  } catch (error) {
    console.error('Rename resume error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' })
    }

    if (resume.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    // Delete from Cloudinary
    if (resume.publicId) {
      try {
        await cloudinary.uploader.destroy(resume.publicId, { resource_type: 'raw' })
      } catch (cloudErr) {
        console.error('Cloudinary delete error:', cloudErr.message)
        // Continue even if Cloudinary delete fails
      }
    }

    await resume.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    })
  } catch (error) {
    console.error('Delete resume error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// ── Shared helper: fetch from Cloudinary and pipe to client ─────────────────
const https = require('https')
const http  = require('http')

// Agent that bypasses TLS cert chain errors caused by local TLS inspection proxy
const cloudinaryAgent = new https.Agent({ rejectUnauthorized: false })

const proxyResume = (res, fileUrl, disposition) => {
  const isHttps = fileUrl.startsWith('https')
  const options = isHttps ? { agent: cloudinaryAgent } : {}

  const lib = isHttps ? https : http
  lib.get(fileUrl, options, (cloudRes) => {
    if (cloudRes.statusCode !== 200) {
      console.error(`Proxy resume: Cloudinary returned ${cloudRes.statusCode} for ${fileUrl}`)
      res.status(502).json({ success: false, message: `Storage returned ${cloudRes.statusCode}` })
      return
    }
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', disposition)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    cloudRes.pipe(res)
  }).on('error', (err) => {
    console.error('Proxy resume error:', err.code, err.message)
    res.status(502).json({ success: false, message: 'Failed to fetch PDF from storage: ' + err.message })
  })
}

// @desc    View a resume inline (opens browser PDF viewer — no download)
// @route   GET /api/resumes/:id/view
// @access  Private
const viewResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' })
    let isAuthorized = resume.user.toString() === req.user._id.toString()
    if (!isAuthorized && req.user.role === 'recruiter') {
      const Application = require('../models/Application')
      const applications = await Application.find({ resume: resume._id }).populate('job', 'postedBy')
      isAuthorized = applications.some(app => app.job && app.job.postedBy.toString() === req.user._id.toString())
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    proxyResume(res, resume.fileUrl, 'inline')
  } catch (error) {
    console.error('View resume error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Download a resume as an attachment (forces browser to save the file)
// @route   GET /api/resumes/:id/download
// @access  Private
const downloadResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' })
    let isAuthorized = resume.user.toString() === req.user._id.toString()
    if (!isAuthorized && req.user.role === 'recruiter') {
      const Application = require('../models/Application')
      const applications = await Application.find({ resume: resume._id }).populate('job', 'postedBy')
      isAuthorized = applications.some(app => app.job && app.job.postedBy.toString() === req.user._id.toString())
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }
    const safeName = (resume.name || 'Resume')
      .replace(/[^a-zA-Z0-9 _\-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
    proxyResume(res, resume.fileUrl, `attachment; filename="${safeName}.pdf"`)
  } catch (error) {
    console.error('Download resume error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

module.exports = {
  getResumes,
  uploadResume,
  renameResume,
  deleteResume,
  viewResume,
  downloadResume,
}
