const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
    // Not required — a message may be image-only
  },
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text',
  },
  media: {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
    type: { type: String, default: null }, // 'image'
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

// Validate: must have content OR media
messageSchema.pre('save', function (next) {
  if (!this.content && !this.media?.url) {
    return next(new Error('Message must have text content or media'))
  }
  next()
})

messageSchema.index({ conversation: 1, createdAt: 1 })

const Message = mongoose.model('Message', messageSchema)

module.exports = Message
