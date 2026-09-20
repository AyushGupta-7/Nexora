const mongoose = require('mongoose')

const connectionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
})

// Compound index to prevent duplicate connections
connectionSchema.index({ sender: 1, recipient: 1 }, { unique: true })

const Connection = mongoose.model('Connection', connectionSchema)

module.exports = Connection
