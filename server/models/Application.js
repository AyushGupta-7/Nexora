const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Selected', 'Withdrawn'],
    default: 'Applied',
  },
  coverNote: {
    type: String,
    maxlength: [500, 'Cover note cannot exceed 500 characters'],
    default: '',
  },
}, {
  timestamps: true,
})

// Prevent duplicate applications for the same job
applicationSchema.index({ user: 1, job: 1 }, { unique: true })

const Application = mongoose.model('Application', applicationSchema)

module.exports = Application
