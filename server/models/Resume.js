const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Resume name is required'],
    trim: true,
    maxlength: [100, 'Resume name cannot exceed 100 characters'],
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
  },
  publicId: {
    type: String,
    default: '',
  },
  fileType: {
    type: String,
    default: 'application/pdf',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

const Resume = mongoose.model('Resume', resumeSchema)

module.exports = Resume
