const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const User = require('../models/User')

// @desc    Get or create conversation between two users
// @route   POST /api/messages/conversation
// @access  Private
const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' })
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot message yourself' })
    }

    const targetUser = await User.findById(userId).select('fullName avatar title')
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] },
    }).populate('participants', 'fullName avatar title')
      .populate('lastMessage')

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId],
      })
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'fullName avatar title')
    }

    res.status(200).json({ success: true, conversation })
  } catch (error) {
    console.error('Get/create conversation error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'fullName avatar title')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })

    res.status(200).json({ success: true, conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' })
    }

    // Ensure current user is a participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    )

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'fullName avatar')
      .sort({ createdAt: 1 })
      .limit(100)

    // Mark messages as read
    await Message.updateMany(
      { conversation: req.params.conversationId, sender: { $ne: req.user._id }, read: false },
      { read: true }
    )

    res.status(200).json({ success: true, messages })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body

    if (!conversationId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'conversationId and content are required' })
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' })
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    )
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content: content.trim(),
    })

    // Update conversation's last message
    conversation.lastMessage = message._id
    conversation.lastMessageAt = new Date()
    await conversation.save()

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullName avatar title')

    res.status(201).json({
      success: true,
      message: populatedMessage,
    })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
}
