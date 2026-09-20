const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  type: {
    type: String,
    enum: [
      'connection_request',
      'connection_accepted',
      'post_like',
      'post_comment',
      'comment_reply',
      'comment_like',
      'new_message',
      'application_status',
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: '',
  },
  read: {
    type: Boolean,
    default: false,
  },
  referenceId: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
})

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification
