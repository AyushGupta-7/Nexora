const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { messageUpload } = require('../middleware/upload')
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  sendMediaMessage,
} = require('../controllers/messageController')

router.post('/conversation', protect, getOrCreateConversation)
router.get('/conversations', protect, getConversations)
router.post('/media', protect, messageUpload.single('image'), sendMediaMessage)
router.post('/', protect, sendMessage)
router.get('/:conversationId', protect, getMessages)

module.exports = router
