const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require('./routes/authRoutes')
const postRoutes = require('./routes/postRoutes')
const profileRoutes = require('./routes/profileRoutes')
const networkRoutes = require('./routes/networkRoutes')
const jobRoutes = require('./routes/jobRoutes')
const resumeRoutes = require('./routes/resumeRoutes')
const applicationRoutes = require('./routes/applicationRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const messageRoutes = require('./routes/messageRoutes')

// Initialize express
const app = express()
const server = http.createServer(app)

// Socket.IO setup
const allowedOrigin = (origin, callback) => {
  // Allow all localhost origins (any port) and requests with no origin (e.g. mobile apps, curl)
  if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return callback(null, true)
  }
  callback(new Error('Not allowed by CORS'))
}

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Track online users: userId -> socketId
const onlineUsers = new Map()

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`)

  // User comes online
  socket.on('user:online', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id)
      socket.userId = userId
      io.emit('users:online', Array.from(onlineUsers.keys()))
      console.log(`👤 User ${userId} is online`)
    }
  })

  // Join a conversation room
  socket.on('conversation:join', (conversationId) => {
    socket.join(conversationId)
    console.log(`📨 Socket ${socket.id} joined conversation ${conversationId}`)
  })

  // Leave a conversation room
  socket.on('conversation:leave', (conversationId) => {
    socket.leave(conversationId)
  })

  // Real-time message
  socket.on('message:send', (data) => {
    const { conversationId, message } = data
    if (conversationId && message) {
      // Broadcast to all participants in the conversation room
      socket.to(conversationId).emit('message:receive', message)
    }
  })

  // Typing indicator
  socket.on('typing:start', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typing:start', { userId })
  })

  socket.on('typing:stop', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typing:stop', { userId })
  })

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId)
      io.emit('users:online', Array.from(onlineUsers.keys()))
      console.log(`👋 User ${socket.userId} went offline`)
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`)
  })
})

// Make io accessible in controllers
app.set('io', io)

// Middleware
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB connection error:`, error.message)
    process.exit(1)
  }
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/network', networkRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/messages', messageRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Nexora API is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  connectDB()
})