const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { getOrCreateConversation, getConversations, getMessages, sendMessage } = require('../controllers/messageController')

router.post('/conversation', protect, getOrCreateConversation)
router.get('/conversations', protect, getConversations)
router.get('/:conversationId', protect, getMessages)
router.post('/', protect, sendMessage)

module.exports = router
