const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')

// Storage for PDF resumes — use raw resource_type for non-image files
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nexora/resumes',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
    use_filename: true,
    unique_filename: true,
  },
})

const resumeUpload = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed for resumes'), false)
    }
  },
})

module.exports = resumeUpload
