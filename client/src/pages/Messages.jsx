import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Navbar from '../components/layout/Navbar'
import { getConversations, getOrCreateConversation, getMessages, sendMessage } from '../services/messageService'
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
    p => p._id !== currentUserId && p._id?.toString() !== currentUserId
  ) || conversation.participants?.[0] || {}

  const avatar = otherParticipant.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.fullName || 'User')}&background=00dce3&color=041329`
  const isOnline = isUserOnline(otherParticipant._id)
  const isActive = activeConversationId === conversation._id
  const lastMsg = conversation.lastMessage

  return (
    <div className={`convo-item ${isActive ? 'active' : ''}`} onClick={() => onClick(conversation)}>
      <div className="convo-avatar-wrapper">
        <img src={avatar} alt={otherParticipant.fullName} className="convo-avatar" />
        {isOnline && <span className="convo-online-dot" />}
      </div>
      <div className="convo-info">
        <div className="convo-header-row">
          <span className="convo-name">{otherParticipant.fullName || 'User'}</span>
          {lastMsg?.createdAt && (
            <span className="convo-time">{formatMsgDate(lastMsg.createdAt)}</span>
          )}
        </div>
        <p className="convo-last-msg">
          {lastMsg?.content || 'Start a conversation'}
        </p>
      </div>
    </div>
  )
}

const MessageBubble = ({ message, currentUserId }) => {
  const isSelf = message.sender?._id === currentUserId || message.sender === currentUserId
  const sender = message.sender || {}
  const avatar = sender.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.fullName || 'U')}&background=00dce3&color=041329`

  return (
    <div className={`msg-row ${isSelf ? 'self' : 'other'}`}>
      {!isSelf && (
        <img src={avatar} alt={sender.fullName} className="msg-avatar" />
      )}
      <div className="msg-bubble-wrapper">
        <div className={`msg-bubble ${isSelf ? 'self' : 'other'}`}>
          <p>{message.content}</p>
        </div>
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
  const currentUserId = user?._id || user?.id

  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)

  // Load conversations
  useEffect(() => {
    loadConversations()
  }, [])

  // If conversationId in URL, auto-open that conversation
  useEffect(() => {
    if (paramConvId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === paramConvId)
      if (conv) {
        openConversation(conv)
      } else {
        // Conversation not in list, fetch it directly
        fetchAndOpenConversation(paramConvId)
      }
    }
  }, [paramConvId, conversations])

  // Socket.IO: listen for incoming messages
  useEffect(() => {
    if (!socket || !activeConversation) return

    socket.emit('conversation:join', activeConversation._id)

    const handleReceiveMessage = (message) => {
      setMessages(prev => [...prev, message])
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
      socket.emit('conversation:leave', activeConversation._id)
    }
  }, [socket, activeConversation, currentUserId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const response = await getConversations()
      if (response.success) {
        setConversations(response.conversations)
      }
    } catch (err) {
      console.error('Load conversations error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAndOpenConversation = async (convId) => {
    // Try to load by opening from conversations
    // We'll just load messages directly since we have the ID
    setMessagesLoading(true)
    try {
      const response = await getMessages(convId)
      if (response.success) {
        setMessages(response.messages)
        setActiveConversation({ _id: convId })
      }
    } catch (err) {
      console.error('Fetch conversation error:', err)
    } finally {
      setMessagesLoading(false)
    }
  }

  const openConversation = async (conversation) => {
    if (activeConversation?._id === conversation._id) return
    setActiveConversation(conversation)
    setMessages([])
    setIsTyping(false)
    navigate(`/messages/${conversation._id}`, { replace: true })
    setMessagesLoading(true)
    try {
      const response = await getMessages(conversation._id)
      if (response.success) {
        setMessages(response.messages)
      }
    } catch (err) {
      console.error('Load messages error:', err)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || sending) return

    const content = messageInput.trim()
    setMessageInput('')
    setSending(true)

    // Optimistic UI update
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      conversation: activeConversation._id,
      sender: { _id: currentUserId, fullName: user?.fullName, avatar: user?.avatar },
      content,
      createdAt: new Date().toISOString(),
      isTemp: true,
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      const response = await sendMessage(activeConversation._id, content)
      if (response.success) {
        // Replace temp message with real one
        setMessages(prev => prev.map(m => m._id === tempMessage._id ? response.message : m))

        // Emit via socket for real-time delivery
        if (socket) {
          socket.emit('message:send', {
            conversationId: activeConversation._id,
            message: response.message,
          })
        }

        // Update conversation's last message in sidebar
        setConversations(prev =>
          prev.map(c => c._id === activeConversation._id
            ? { ...c, lastMessage: response.message, lastMessageAt: new Date() }
            : c
          )
        )
      }
    } catch (err) {
      console.error('Send message error:', err)
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id))
      setMessageInput(content) // restore input
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (e) => {
    setMessageInput(e.target.value)

    // Typing indicator
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
    p => p._id !== currentUserId && p._id?.toString() !== currentUserId
  ) || activeConversation?.participants?.[0]

  return (
    <div className="messages-page">
      <Navbar />
      <main className="messages-main">
        <div className="messages-layout">
          {/* Sidebar */}
          <aside className={`messages-sidebar ${showSidebar ? 'open' : ''}`}>
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
                  <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', textAlign: 'center' }}>
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
                  <button className="chat-back-btn" onClick={() => setActiveConversation(null)}>
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
                        <h3 className="chat-header-name"
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
                      <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                        No messages yet. Say hello!
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

                {/* Input */}
                <div className="chat-input-area">
                  <textarea
                    ref={inputRef}
                    className="chat-input"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                  <button
                    className={`chat-send-btn ${messageInput.trim() ? 'active' : ''}`}
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sending}
                  >
                    <span className="material-symbols-outlined">send</span>
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
