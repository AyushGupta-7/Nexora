import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Navbar from '../components/layout/Navbar'
import { getConversations, getOrCreateConversation, getMessages, sendMessage, sendMediaMessage } from '../services/messageService'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import './Messages.css'

const formatMsgDate = (date) => {
  try {
    const d = new Date(date)
    if (isToday(d)) return format(d, 'h:mm a')
    if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`
    return format(d, 'MMM d, h:mm a')
  } catch { return '' }
}

const ConversationItem = ({ conversation, currentUserId, activeConversationId, onClick }) => {
  const { isUserOnline } = useSocket()
  const otherParticipant = conversation.participants?.find(
    p => (p._id || p).toString() !== currentUserId
  ) || conversation.participants?.[0] || {}

  const avatar = otherParticipant.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.fullName || 'User')}&background=00dce3&color=041329`
  const isOnline = isUserOnline(otherParticipant._id)
  const isActive = activeConversationId === conversation._id
  const lastMsg = conversation.lastMessage

  const lastMsgText = lastMsg?.messageType === 'image'
    ? '📷 Image'
    : lastMsg?.content || 'Start a conversation'

  return (
    <div className={`convo-item ${isActive ? 'active' : ''}`} onClick={() => onClick(conversation)}>
      <div className="convo-avatar-wrapper">
        <img src={avatar} alt={otherParticipant.fullName || 'User'} className="convo-avatar" />
        {isOnline && <span className="convo-online-dot" />}
      </div>
      <div className="convo-info">
        <div className="convo-header-row">
          <span className="convo-name">{otherParticipant.fullName || 'User'}</span>
          {lastMsg?.createdAt && (
            <span className="convo-time">{formatMsgDate(lastMsg.createdAt)}</span>
          )}
        </div>
        <p className="convo-last-msg">{lastMsgText}</p>
      </div>
    </div>
  )
}

const MessageBubble = ({ message, currentUserId }) => {
  const isSelf = (message.sender?._id || message.sender)?.toString() === currentUserId
  const sender = message.sender || {}
  const avatar = sender.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.fullName || 'U')}&background=00dce3&color=041329`
  const hasMedia = message.messageType === 'image' && message.media?.url
  const hasText = message.content && message.content.trim()

  return (
    <div className={`msg-row ${isSelf ? 'self' : 'other'}`}>
      {!isSelf && (
        <img src={avatar} alt={sender.fullName} className="msg-avatar" />
      )}
      <div className="msg-bubble-wrapper">
        {/* Image */}
        {hasMedia && (
          <div className={`msg-bubble ${isSelf ? 'self' : 'other'} msg-bubble-image`}>
            <a href={message.media.url} target="_blank" rel="noopener noreferrer">
              <img
                src={message.media.url}
                alt="Sent image"
                className="msg-image"
                onError={(e) => { e.target.src = ''; e.target.alt = 'Image unavailable' }}
              />
            </a>
          </div>
        )}
        {/* Text */}
        {hasText && (
          <div className={`msg-bubble ${isSelf ? 'self' : 'other'}`}>
            <p>{message.content}</p>
          </div>
        )}
        <span className="msg-time">{formatMsgDate(message.createdAt)}</span>
      </div>
    </div>
  )
}

const Messages = () => {
  const { conversationId: paramConvId } = useParams()
  const { user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const currentUserId = (user?._id || user?.id)?.toString()

  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const imageInputRef = useRef(null)
  const activeConvIdRef = useRef(null)

  // Load conversations once
  useEffect(() => {
    loadConversations()
  }, [])

  // Auto-open conversation from URL
  useEffect(() => {
    if (paramConvId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === paramConvId)
      if (conv) {
        openConversation(conv)
      } else {
        // Load the conversation even if not in sidebar list
        loadMessagesFor(paramConvId)
        setActiveConversation({ _id: paramConvId, participants: [] })
        activeConvIdRef.current = paramConvId
      }
    }
  }, [paramConvId, conversations])

  // Socket: join/leave room + message events — clean up on unmount or conversation change
  useEffect(() => {
    if (!socket || !activeConversation?._id) return

    const convId = activeConversation._id
    socket.emit('conversation:join', convId)

    const handleReceiveMessage = (message) => {
      // Deduplicate: ignore if we already have this message (sent optimistically)
      setMessages(prev => {
        const exists = prev.some(m => m._id === message._id)
        if (exists) return prev
        return [...prev, message]
      })
      scrollToBottom()
    }

    const handleTypingStart = ({ userId }) => {
      if (userId !== currentUserId) setIsTyping(true)
    }

    const handleTypingStop = ({ userId }) => {
      if (userId !== currentUserId) setIsTyping(false)
    }

    socket.on('message:receive', handleReceiveMessage)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)

    return () => {
      socket.off('message:receive', handleReceiveMessage)
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
      socket.emit('conversation:leave', convId)
    }
  }, [socket, activeConversation?._id, currentUserId])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  useEffect(() => {
    if (messages.length > 0) scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const response = await getConversations()
      if (response.success) setConversations(response.conversations)
    } catch (err) {
      console.error('Load conversations error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMessagesFor = async (convId) => {
    setMessagesLoading(true)
    try {
      const response = await getMessages(convId)
      if (response.success) setMessages(response.messages)
    } catch (err) {
      console.error('Load messages error:', err)
    } finally {
      setMessagesLoading(false)
    }
  }

  const openConversation = async (conversation) => {
    if (activeConvIdRef.current === conversation._id) return
    setActiveConversation(conversation)
    activeConvIdRef.current = conversation._id
    setMessages([])
    setIsTyping(false)
    navigate(`/messages/${conversation._id}`, { replace: true })
    await loadMessagesFor(conversation._id)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('Image must be under 8MB')
      return
    }
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !activeConversation || sending) return

    const content = messageInput.trim()
    const imageFile = selectedImage
    setMessageInput('')
    setSelectedImage(null)
    setImagePreview(null)
    setSending(true)

    // Optimistic message
    const tempId = `temp-${Date.now()}`
    const tempMessage = {
      _id: tempId,
      conversation: activeConversation._id,
      sender: { _id: currentUserId, fullName: user?.fullName, avatar: user?.avatar },
      content: content || null,
      messageType: imageFile ? 'image' : 'text',
      media: imageFile ? { url: imagePreview, type: 'image' } : null,
      createdAt: new Date().toISOString(),
      isTemp: true,
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      let response
      if (imageFile) {
        response = await sendMediaMessage(activeConversation._id, content, imageFile)
      } else {
        response = await sendMessage(activeConversation._id, content)
      }

      if (response.success) {
        // Replace optimistic message with real one
        setMessages(prev => prev.map(m => m._id === tempId ? response.message : m))

        // Emit via socket for real-time delivery to the other participant
        if (socket) {
          socket.emit('message:send', {
            conversationId: activeConversation._id,
            message: response.message,
          })
        }

        // Update conversation last message in sidebar
        setConversations(prev => prev.map(c =>
          c._id === activeConversation._id
            ? { ...c, lastMessage: response.message, lastMessageAt: new Date() }
            : c
        ))
      }
    } catch (err) {
      console.error('Send message error:', err)
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m._id !== tempId))
      setMessageInput(content)
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (e) => {
    setMessageInput(e.target.value)

    if (socket && activeConversation) {
      socket.emit('typing:start', { conversationId: activeConversation._id, userId: currentUserId })
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId: activeConversation._id, userId: currentUserId })
      }, 1500)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const otherParticipant = activeConversation?.participants?.find(
    p => (p._id || p)?.toString() !== currentUserId
  )

  return (
    <div className="messages-page">
      <Navbar />
      <main className="messages-main">
        <div className="messages-layout">
          {/* Sidebar */}
          <aside className="messages-sidebar">
            <div className="sidebar-header">
              <h2>Messages</h2>
            </div>
            <div className="convo-list">
              {loading ? (
                <div className="messages-state-center">
                  <div className="loader"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="messages-state-center">
                  <span className="material-symbols-outlined" style={{ fontSize: 36, opacity: 0.3 }}>chat</span>
                  <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', textAlign: 'center', padding: '0 16px' }}>
                    No conversations yet.<br />Message someone from their profile.
                  </p>
                </div>
              ) : (
                conversations.map(conv => (
                  <ConversationItem
                    key={conv._id}
                    conversation={conv}
                    currentUserId={currentUserId}
                    activeConversationId={activeConversation?._id}
                    onClick={openConversation}
                  />
                ))
              )}
            </div>
          </aside>

          {/* Chat Area */}
          <div className="chat-area">
            {!activeConversation ? (
              <div className="chat-empty">
                <span className="material-symbols-outlined">forum</span>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the left to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <button className="chat-back-btn" onClick={() => { setActiveConversation(null); activeConvIdRef.current = null; navigate('/messages') }}>
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  {otherParticipant && (
                    <>
                      <img
                        src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.fullName || 'U')}&background=00dce3&color=041329`}
                        alt={otherParticipant.fullName}
                        className="chat-header-avatar"
                      />
                      <div className="chat-header-info">
                        <h3
                          className="chat-header-name"
                          onClick={() => navigate(`/profile/${otherParticipant._id}`)}
                        >
                          {otherParticipant.fullName}
                        </h3>
                        <p className="chat-header-title">{otherParticipant.title || 'Member'}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Messages */}
                <div className="chat-messages">
                  {messagesLoading ? (
                    <div className="messages-state-center">
                      <div className="loader"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="messages-state-center">
                      <span className="material-symbols-outlined" style={{ fontSize: 32, opacity: 0.25 }}>chat</span>
                      <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                        No messages yet. Say hello! 👋
                      </p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <MessageBubble key={msg._id} message={msg} currentUserId={currentUserId} />
                    ))
                  )}
                  {isTyping && (
                    <div className="typing-indicator">
                      <span /><span /><span />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Image preview strip */}
                {imagePreview && (
                  <div className="chat-image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button className="chat-image-remove" onClick={handleRemoveImage}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                )}

                {/* Input */}
                <div className="chat-input-area">
                  <button className="chat-attach-btn" onClick={() => imageInputRef.current?.click()} title="Attach image">
                    <span className="material-symbols-outlined">image</span>
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  <textarea
                    className="chat-input"
                    placeholder={selectedImage ? 'Add a caption...' : 'Type a message...'}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={sending}
                  />
                  <button
                    className={`chat-send-btn ${(messageInput.trim() || selectedImage) ? 'active' : ''}`}
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && !selectedImage) || sending}
                  >
                    <span className="material-symbols-outlined">
                      {sending ? 'hourglass_empty' : 'send'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Messages
