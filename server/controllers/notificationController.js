const Notification = require('../models/Notification')

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'fullName avatar title')
      .sort({ createdAt: -1 })
      .limit(50)

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    })

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    notification.read = true
    await notification.save()

    res.status(200).json({ success: true, message: 'Marked as read' })
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    )

    res.status(200).json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Mark all read error:', error)
    res.status(500).json({ success: false, message: error.message || 'Server error' })
  }
}

// Helper function to create a notification (used by other controllers)
const createNotification = async ({ recipient, sender, type, message, link = '', referenceId = '' }) => {
  try {
    // Don't notify yourself
    if (recipient.toString() === sender.toString()) return null

    await Notification.create({
      recipient,
      sender,
      type,
      message,
      link,
      referenceId,
    })
  } catch (error) {
    console.error('Create notification error:', error.message)
    // Non-blocking: don't throw
  }
}

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  createNotification,
}
