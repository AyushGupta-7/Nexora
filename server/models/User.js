const mongoose = require('mongoose')

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