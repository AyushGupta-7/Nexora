const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')
const path = require('path')
const os = require('os')

const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME
  return name && name !== 'Root' && name !== 'your_cloud_name_here'
}

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed for resumes'), false)
  }
}

// ── Profile avatar/cover ──────────────────────────────────────────────────────
const profileStorage = isCloudinaryConfigured()
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'nexora/profiles',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
      },
    })
  : multer.diskStorage({
      destination: os.tmpdir(),
      filename: (req, file, cb) => cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`),
    })

const coverStorage = isCloudinaryConfigured()
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'nexora/covers',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        transformation: [{ width: 1500, height: 500, crop: 'limit' }],
      },
    })
  : multer.diskStorage({
      destination: os.tmpdir(),
      filename: (req, file, cb) => cb(null, `cover-${Date.now()}${path.extname(file.originalname)}`),
    })

// ── Post images ───────────────────────────────────────────────────────────────
const postStorage = isCloudinaryConfigured()
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'nexora/posts',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }],
      },
    })
  : multer.diskStorage({
      destination: os.tmpdir(),
      filename: (req, file, cb) => cb(null, `post-${Date.now()}${path.extname(file.originalname)}`),
    })

// ── Message images ────────────────────────────────────────────────────────────
const messageStorage = isCloudinaryConfigured()
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'nexora/messages',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }],
      },
    })
  : multer.diskStorage({
      destination: os.tmpdir(),
      filename: (req, file, cb) => cb(null, `msg-${Date.now()}${path.extname(file.originalname)}`),
    })

// ── Resume PDFs ───────────────────────────────────────────────────────────────
const resumeStorage = isCloudinaryConfigured()
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'nexora/resumes',
        resource_type: 'raw',
        allowed_formats: ['pdf'],
        use_filename: true,
        unique_filename: true,
      },
    })
  : multer.diskStorage({
      destination: os.tmpdir(),
      filename: (req, file, cb) => cb(null, `resume-${Date.now()}.pdf`),
    })

// ── Multer instances ──────────────────────────────────────────────────────────
const upload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
})

const coverUpload = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
})

const postUpload = multer({
  storage: postStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: imageFilter,
})

const messageUpload = multer({
  storage: messageStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: imageFilter,
})

const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: pdfFilter,
})

module.exports = upload
module.exports.coverUpload = coverUpload
module.exports.postUpload = postUpload
module.exports.messageUpload = messageUpload
module.exports.resumeUpload = resumeUpload