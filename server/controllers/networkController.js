const User = require('../models/User')
const Connection = require('../models/Connection')

// Helper: get connection status between current user and target user
const getConnectionStatus = async (currentUserId, targetUserId) => {
  const connection = await Connection.findOne({
    $or: [
      { sender: currentUserId, recipient: targetUserId },
      { sender: targetUserId, recipient: currentUserId },
    ],
  })

  if (!connection) return 'none'
  if (connection.status === 'accepted') return 'connected'
  if (connection.status === 'pending') {
    if (connection.sender.toString() === currentUserId.toString()) return 'pending_sent'
    return 'pending_received'
  }
  return 'none'
}

// @desc    Get users to discover (excludes self and connected users)
// @route   GET /api/network/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { search } = req.query

    // Get all accepted connections for the current user
    const acceptedConnections = await Connection.find({
      $or: [
        { sender: req.user._id, status: 'accepted' },
        { recipient: req.user._id, status: 'accepted' },
      ],
    })

    const connectedUserIds = acceptedConnections.map(conn =>
      conn.sender.toString() === req.user._id.toString() ? conn.recipient : conn.sender
    )

    // Build search query
    const searchQuery = {
      _id: { $ne: req.user._id },
    }

    if (search) {
      searchQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { 'skills.name': { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(searchQuery)
      .select('fullName title location avatar about skills')
      .limit(50)

    // Attach connection status to each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const status = await getConnectionStatus(req.user._id, user._id)
        return {
          ...user.toJSON(),
          connectionStatus: status,
        }
      })
    )

    res.status(200).json({
      success: true,
      users: usersWithStatus,
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Get pending connection requests received
// @route   GET /api/network/requests
// @access  Private
const getRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      recipient: req.user._id,
      status: 'pending',
    }).populate('sender', 'fullName title location avatar about skills')

    res.status(200).json({
      success: true,
      requests,
    })
  } catch (error) {
    console.error('Get requests error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Get all accepted connections
// @route   GET /api/network/connections
// @access  Private
const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { sender: req.user._id, status: 'accepted' },
        { recipient: req.user._id, status: 'accepted' },
      ],
    })
      .populate('sender', 'fullName title location avatar about skills')
      .populate('recipient', 'fullName title location avatar about skills')

    const connectedUsers = connections.map(conn => {
      const isRequester = conn.sender._id.toString() === req.user._id.toString()
      return {
        connectionId: conn._id,
        user: isRequester ? conn.recipient : conn.sender,
        connectedAt: conn.updatedAt,
      }
    })

    res.status(200).json({
      success: true,
      connections: connectedUsers,
    })
  } catch (error) {
    console.error('Get connections error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Send connection request
// @route   POST /api/network/connect/:userId
// @access  Private
const sendRequest = async (req, res) => {
  try {
    const targetUserId = req.params.userId

    // Cannot connect to self
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot connect to yourself',
      })
    }

    // Check if user exists
    const targetUser = await User.findById(targetUserId)
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check for existing connection
    const existing = await Connection.findOne({
      $or: [
        { sender: req.user._id, recipient: targetUserId },
        { sender: targetUserId, recipient: req.user._id },
      ],
    })

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Already connected' })
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, message: 'Connection request already sent' })
      }
      // If rejected, allow re-request by updating
      existing.status = 'pending'
      existing.sender = req.user._id
      existing.recipient = targetUserId
      await existing.save()
      return res.status(200).json({ success: true, message: 'Connection request sent', status: 'pending_sent' })
    }

    await Connection.create({
      sender: req.user._id,
      recipient: targetUserId,
    })

    res.status(201).json({
      success: true,
      message: 'Connection request sent',
      status: 'pending_sent',
    })
  } catch (error) {
    console.error('Send request error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Accept connection request
// @route   POST /api/network/accept/:userId
// @access  Private
const acceptRequest = async (req, res) => {
  try {
    const senderId = req.params.userId

    const connection = await Connection.findOne({
      sender: senderId,
      recipient: req.user._id,
      status: 'pending',
    })

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found',
      })
    }

    connection.status = 'accepted'
    await connection.save()

    res.status(200).json({
      success: true,
      message: 'Connection accepted',
      status: 'connected',
    })
  } catch (error) {
    console.error('Accept request error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Reject connection request
// @route   POST /api/network/reject/:userId
// @access  Private
const rejectRequest = async (req, res) => {
  try {
    const senderId = req.params.userId

    const connection = await Connection.findOne({
      sender: senderId,
      recipient: req.user._id,
      status: 'pending',
    })

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found',
      })
    }

    connection.status = 'rejected'
    await connection.save()

    res.status(200).json({
      success: true,
      message: 'Connection request rejected',
    })
  } catch (error) {
    console.error('Reject request error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Remove connection / withdraw request
// @route   DELETE /api/network/:userId
// @access  Private
const removeConnection = async (req, res) => {
  try {
    const targetUserId = req.params.userId

    const connection = await Connection.findOneAndDelete({
      $or: [
        { sender: req.user._id, recipient: targetUserId },
        { sender: targetUserId, recipient: req.user._id },
      ],
    })

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Connection removed',
    })
  } catch (error) {
    console.error('Remove connection error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

module.exports = {
  getUsers,
  getRequests,
  getConnections,
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeConnection,
}
