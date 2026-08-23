const mongoose = require('mongoose')

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  endorsements: {
    type: Number,
    default: 0
  }
})

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String },
  logo: { type: String }
})

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String },
  activities: { type: String }
})

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [50, 'Full name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  avatar: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    default: 'Member',
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  location: {
    type: String,
    default: '',
    trim: true,
  },
  about: {
    type: String,
    default: '',
    maxlength: [1000, 'About cannot exceed 1000 characters'],
  },
  coverImage: {
    type: String,
    default: '',
  },
  skills: [skillSchema],
  experiences: [experienceSchema],
  educations: [educationSchema],
}, {
  timestamps: true,
})

// Remove password from JSON response
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password
    delete ret.__v
    return ret
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User