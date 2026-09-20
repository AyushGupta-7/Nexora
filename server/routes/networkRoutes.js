const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getUsers,
  getRequests,
  getConnections,
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeConnection,
} = require('../controllers/networkController')

router.get('/users', protect, getUsers)
router.get('/requests', protect, getRequests)
router.get('/connections', protect, getConnections)
router.post('/connect/:userId', protect, sendRequest)
router.post('/accept/:userId', protect, acceptRequest)
router.post('/reject/:userId', protect, rejectRequest)
router.delete('/:userId', protect, removeConnection)

module.exports = router
