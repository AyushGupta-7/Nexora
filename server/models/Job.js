const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  companyLogo: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Remote'],
    default: 'Full-time',
  },
  experience: {
    type: String,
    default: '0-1 years',
  },
  salary: {
    type: String,
    default: '',
  },
  skills: [{
    type: String,
    trim: true,
  }],
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  responsibilities: [{
    type: String,
  }],
  requirements: [{
    type: String,
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deadline: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Text index for search
jobSchema.index({
  title: 'text',
  company: 'text',
  location: 'text',
  description: 'text',
  skills: 'text',
})

const Job = mongoose.model('Job', jobSchema)

module.exports = Job
