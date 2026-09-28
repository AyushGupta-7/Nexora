import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Navbar from '../components/layout/Navbar'
import ConfirmModal from '../components/common/ConfirmModal'
import {
  getConversations,
  getMessages,
  sendMessage,
  sendMediaMessage,
  deleteMessage as deleteMessageApi,
} from '../services/messageService'
import { format, isToday, isYesterday } from 'date-fns'
import './Messages.css'

/* ─── helpers ─────────────────────────────────────────────────────── */
const fmtTime = (date) => {
  try {
    const d = new Date(date)
    if (isToday(d))     return format(d, 'h:mm a')
    if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`
    return format(d, 'MMM d, h:mm a')
  } catch { return '' }
}

const avatarUrl = (name, src) =>
  src || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=00dce3&color=041329`

/* ─── Conversation sidebar item ───────────────────────────────────── */
const ConversationItem = ({ conversation, currentUserId, activeConvId, onClick }) => {
  const { isUserOnline } = useSocket()
  const other = conversation.participants?.find(
    p => (p._id || p)?.toString() !== currentUserId
  ) || conversation.participants?.[0] || {}

  const isOnline  = isUserOnline(other._id)
  const isActive  = activeConvId === conversation._id
  const lastMsg   = conversation.lastMessage
  const lastText  = lastMsg?.messageType === 'image'
    ? '📷 Image'
    : (lastMsg?.content || 'Start a conversation')

  return (
    <div className={`convo-item ${isActive ? 'active' : ''}`} onClick={() => onClick(conversation)}>
      <div className="convo-avatar-wrapper">
        <img src={avatarUrl(other.fullName, other.avatar)} alt={other.fullName || 'User'} className="convo-avatar" />
        {isOnline && <span className="convo-online-dot" />}
      </div>
      <div className="convo-info">
        <div className="convo-header-row">
          <span className="convo-name">{other.fullName || 'User'}</span>
          {lastMsg?.createdAt && <span className="convo-time">{fmtTime(lastMsg.createdAt)}</span>}
        </div>
        <p className="convo-last-msg">{lastText}</p>
      </div>
    </div>
  )
}

/* ─── Individual message bubble with action menu ─────────────────── */
const MessageBubble = ({ message, currentUserId, onReply, onDelete }) => {
  const isSelf   = (message.sender?._id || message.sender)?.toString() === currentUserId
  const sender   = message.sender || {}
  const side     = isSelf ? 'self' : 'other'
  const isSending = message.isSending === true

  const mediaUrl  = message.messageType === 'image' ? message.media?.url : null
  const hasText   = message.content?.trim()

  const [menuOpen, setMenuOpen] = useState(false)
  const [copyDone, setCopyDone] = useState(false)
  const menuRef = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleCopy = async () => {
    setMenuOpen(false)
    if (!hasText) return
    try {
      await navigator.clipboard.writeText(message.content)
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2000)
    } catch { /* silently ignore */ }
  }

  const handleReply = () => {
    setMenuOpen(false)
    onReply?.(message)
  }

  const handleDelete = () => {
    setMenuOpen(false)
    onDelete?.(message)
  }

  return (
    <div className={`msg-row ${side} ${isSending ? 'msg-temp' : ''}`}>
      {!isSelf && (
        <img src={avatarUrl(sender.fullName, sender.avatar)} alt={sender.fullName || 'U'} className="msg-avatar" />
      )}
      <div className="msg-bubble-wrapper">
        {/* Image */}
        {mediaUrl && (
          <div className={`msg-bubble ${side} msg-bubble-image`}>
            {isSending ? (
              <div className="msg-image-sending">
                <div className="msg-image-placeholder">
                  <div className="msg-image-spinner" />
                  <span className="msg-image-sending-label">Uploading…</span>
                </div>
              </div>
            ) : (
              <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={mediaUrl}
                  alt="Image"
                  className="msg-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.parentNode.innerHTML = '<span class="msg-image-error">Image unavailable</span>'
                  }}
                />
              </a>
            )}
          </div>
        )}
        {/* Text */}
        {hasText && (
          <div className={`msg-bubble ${side} ${isSending ? 'msg-bubble-sending' : ''}`}>
            <p>{message.content}</p>
          </div>
        )}
        <span className="msg-time">
          {copyDone ? '✓ Copied' : isSending ? 'Sending…' : fmtTime(message.createdAt)}
        </span>
      </div>

      {/* Action button — only for own non-pending messages */}
      {isSelf && !isSending && (
        <div className="msg-action-wrapper" ref={menuRef}>
          <button
            className={`msg-action-btn ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            title="Message actions"
          >
            <span className="material-symbols-outlined">expand_more</span>
          </button>

          {menuOpen && (
            <div className="msg-action-menu">
              {hasText && (
                <button className="msg-action-item" onClick={handleCopy}>
                  <span className="material-symbols-outlined">content_copy</span>
                  Copy
                </button>
              )}
              <button className="msg-action-item" onClick={handleReply}>
                <span className="material-symbols-outlined">reply</span>
                Reply
              </button>
              <button className="msg-action-item msg-action-danger" onClick={handleDelete}>
                <span className="material-symbols-outlined">delete</span>
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reply action for OTHER's messages (reply only, no delete) */}
      {!isSelf && !isSending && (
        <div className="msg-action-wrapper msg-action-other" ref={menuRef}>
          <button
            className={`msg-action-btn ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            title="Message actions"
          >
            <span className="material-symbols-outlined">expand_more</span>
          </button>
          {menuOpen && (
            <div className="msg-action-menu msg-action-menu-other">
              {hasText && (
                <button className="msg-action-item" onClick={handleCopy}>
                  <span className="material-symbols-outlined">content_copy</span>
                  Copy
                </button>
              )}
              <button className="msg-action-item" onClick={handleReply}>
                <span className="material-symbols-outlined">reply</span>
                Reply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main Messages page ──────────────────────────────────────────── */
const Messages = () => {
  const { conversationId: paramConvId } = useParams()
  const { user }   = useAuth()
  const { socket } = useSocket()
  const navigate   = useNavigate()
  const currentUserId = (user?._id || user?.id)?.toString()

  const [conversations,    setConversations]    = useState([])
  const [activeConv,       setActiveConv]       = useState(null)
  const [messages,         setMessages]         = useState([])
  const [messageInput,     setMessageInput]     = useState('')
  const [selectedImage,    setSelectedImage]    = useState(null)
  const [imagePreview,     setImagePreview]     = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [messagesLoading,  setMessagesLoading]  = useState(false)
  const [sending,          setSending]          = useState(false)
  const [sendError,        setSendError]        = useState('')
  const [isTyping,         setIsTyping]         = useState(false)

  // Reply state
  const [replyTo,          setReplyTo]          = useState(null) // message object

  // Delete modal state
  const [deleteTarget,     setDeleteTarget]     = useState(null) // message object
  const [deleteLoading,    setDeleteLoading]    = useState(false)

  const messagesEndRef   = useRef(null)
  const typingTimeoutRef = useRef(null)
  const imageInputRef    = useRef(null)
  const activeConvIdRef  = useRef(null)
  const openedByUrlRef   = useRef(false)

  /* ── Load conversations on mount ─────────────────────────────── */
  useEffect(() => { loadConversations() }, [])

  /* ── Auto-open from URL param ────────────────────────────────── */
  useEffect(() => {
    if (!paramConvId || conversations.length === 0) return
    if (openedByUrlRef.current) return
    const conv = conversations.find(c => c._id === paramConvId)
    if (conv) {
      openedByUrlRef.current = true
      openConversation(conv)
    } else if (!activeConvIdRef.current) {
      openedByUrlRef.current = true
      activeConvIdRef.current = paramConvId
      setActiveConv({ _id: paramConvId, participants: [] })
      loadMessagesFor(paramConvId)
    }
  }, [paramConvId, conversations])

  /* ── Socket: join room + listeners ──────────────────────────── */
  useEffect(() => {
    if (!socket || !activeConv?._id) return

    const convId = activeConv._id
    socket.emit('conversation:join', convId)

    const onReceive = (message) => {
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) return prev
        return [...prev, message]
      })
      scrollToBottom()
    }

    const onDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId))
    }

    const onTypingStart = ({ userId }) => { if (userId !== currentUserId) setIsTyping(true) }
    const onTypingStop  = ({ userId }) => { if (userId !== currentUserId) setIsTyping(false) }

    socket.on('message:receive', onReceive)
    socket.on('message:deleted', onDeleted)
    socket.on('typing:start',    onTypingStart)
    socket.on('typing:stop',     onTypingStop)

    return () => {
      socket.off('message:receive', onReceive)
      socket.off('message:deleted', onDeleted)
      socket.off('typing:start',    onTypingStart)
      socket.off('typing:stop',     onTypingStop)
      socket.emit('conversation:leave', convId)
    }
  }, [socket, activeConv?._id, currentUserId])

  /* ── Scroll to bottom ────────────────────────────────────────── */
  useEffect(() => {
    if (messages.length > 0) scrollToBottom()
  }, [messages])

  const scrollToBottom = () =>
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

  /* ── API helpers ─────────────────────────────────────────────── */
  const loadConversations = async () => {
    setLoading(true)
    try {
      const res = await getConversations()
      if (res.success) setConversations(res.conversations)
    } catch (err) {
      console.error('Load conversations error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMessagesFor = async (convId) => {
    setMessagesLoading(true)
    try {
      const res = await getMessages(convId)
      if (res.success) setMessages(res.messages)
    } catch (err) {
      console.error('Load messages error:', err)
    } finally {
      setMessagesLoading(false)
    }
  }

  const openConversation = async (conversation) => {
    if (activeConvIdRef.current === conversation._id) return
    setActiveConv(conversation)
    activeConvIdRef.current = conversation._id
    setMessages([])
    setIsTyping(false)
    setSendError('')
    setReplyTo(null)
    navigate(`/messages/${conversation._id}`, { replace: true })
    await loadMessagesFor(conversation._id)
  }

  /* ── Image picker ────────────────────────────────────────────── */
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setSendError('Only image files are allowed.'); return }
    if (file.size > 8 * 1024 * 1024)    { setSendError('Image must be under 8 MB.');    return }
    setSendError('')
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleRemoveImage = () => { setSelectedImage(null); setImagePreview(null); setSendError('') }

  /* ── Send message ────────────────────────────────────────────── */
  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !activeConv || sending) return

    const content   = messageInput.trim()
    const imageFile = selectedImage
    const replyRef  = replyTo

    setMessageInput('')
    setSelectedImage(null)
    setImagePreview(null)
    setReplyTo(null)
    setSendError('')
    setSending(true)

    const tempId = `temp-${Date.now()}`
    const tempMessage = {
      _id:          tempId,
      conversation: activeConv._id,
      sender:       { _id: currentUserId, fullName: user?.fullName, avatar: user?.avatar },
      content:      content || null,
      messageType:  imageFile ? 'image' : 'text',
      media:        imageFile ? { url: imagePreview, type: 'image' } : null,
      replyTo:      replyRef ? { _id: replyRef._id, content: replyRef.content, sender: replyRef.sender } : null,
      createdAt:    new Date().toISOString(),
      isTemp:       true,
      isSending:    true,
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      let response
      if (imageFile) {
        response = await sendMediaMessage(activeConv._id, content, imageFile)
      } else {
        response = await sendMessage(activeConv._id, content)
      }

      if (response?.success && response.message) {
        const realMsg = { ...response.message, isTemp: false, isSending: false }
        setMessages(prev => prev.map(m => (m._id === tempId ? realMsg : m)))
        socket?.emit('message:send', { conversationId: activeConv._id, message: realMsg })
        setConversations(prev => prev.map(c =>
          c._id === activeConv._id
            ? { ...c, lastMessage: response.message, lastMessageAt: new Date() }
            : c
        ))
      } else {
        throw new Error(response?.message || 'Send failed')
      }
    } catch (err) {
      console.error('Send message error:', err)
      setMessages(prev => prev.filter(m => m._id !== tempId))
      if (content) setMessageInput(content)
      setSendError(imageFile ? 'Failed to send image. Please try again.' : 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  /* ── Delete message ──────────────────────────────────────────── */
  const confirmDeleteMessage = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await deleteMessageApi(deleteTarget._id)
      if (res.success) {
        setMessages(prev => prev.filter(m => m._id !== deleteTarget._id))
        setDeleteTarget(null)
      } else {
        setSendError('Failed to delete message.')
      }
    } catch (err) {
      console.error('Delete message error:', err)
      setSendError('Failed to delete message.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setMessageInput(e.target.value)
    if (socket && activeConv) {
      socket.emit('typing:start', { conversationId: activeConv._id, userId: currentUserId })
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId: activeConv._id, userId: currentUserId })
      }, 1500)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const otherParticipant = activeConv?.participants?.find(
    p => (p._id || p)?.toString() !== currentUserId
  )

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="messages-page">
      <Navbar />
      <main className="messages-main">
        <div className="messages-layout">

          {/* ── Sidebar ──────────────────────────────────────────── */}
          <aside className="messages-sidebar">
            <div className="sidebar-header">
              <h2>Messages</h2>
            </div>
            <div className="convo-list">
              {loading ? (
                <div className="messages-state-center"><div className="loader" /></div>
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
                    activeConvId={activeConv?._id}
                    onClick={openConversation}
                  />
                ))
              )}
            </div>
          </aside>

          {/* ── Chat area ────────────────────────────────────────── */}
          <div className="chat-area">
            {!activeConv ? (
              <div className="chat-empty">
                <span className="material-symbols-outlined">forum</span>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the left to start messaging</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="chat-header">
                  <button
                    className="chat-back-btn"
                    onClick={() => {
                      setActiveConv(null)
                      activeConvIdRef.current = null
                      openedByUrlRef.current = false
                      setReplyTo(null)
                      navigate('/messages')
                    }}
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  {otherParticipant && (
                    <>
                      <img
                        src={avatarUrl(otherParticipant.fullName, otherParticipant.avatar)}
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
                    <div className="messages-state-center"><div className="loader" /></div>
                  ) : messages.length === 0 ? (
                    <div className="messages-state-center">
                      <span className="material-symbols-outlined" style={{ fontSize: 32, opacity: 0.25 }}>chat</span>
                      <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                        No messages yet. Say hello! 👋
                      </p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <MessageBubble
                        key={msg._id}
                        message={msg}
                        currentUserId={currentUserId}
                        onReply={setReplyTo}
                        onDelete={setDeleteTarget}
                      />
                    ))
                  )}
                  {isTyping && (
                    <div className="typing-indicator">
                      <span /><span /><span />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send error */}
                {sendError && (
                  <div className="chat-send-error">
                    <span className="material-symbols-outlined">error</span>
                    {sendError}
                    <button onClick={() => setSendError('')}>✕</button>
                  </div>
                )}

                {/* Reply bar */}
                {replyTo && (
                  <div className="chat-reply-bar">
                    <div className="chat-reply-content">
                      <span className="material-symbols-outlined chat-reply-icon">reply</span>
                      <div>
                        <span className="chat-reply-label">Replying to</span>
                        <p className="chat-reply-preview">
                          {replyTo.messageType === 'image' ? '📷 Image' : (replyTo.content || '')}
                        </p>
                      </div>
                    </div>
                    <button className="chat-reply-close" onClick={() => setReplyTo(null)}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                )}

                {/* Image preview */}
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
                  <button
                    className="chat-attach-btn"
                    onClick={() => imageInputRef.current?.click()}
                    title="Attach image"
                    disabled={sending}
                  >
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
                    placeholder={selectedImage ? 'Add a caption…' : replyTo ? 'Write a reply…' : 'Type a message…'}
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

      {/* Delete message confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete message?"
        message="This message will be permanently removed for everyone."
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={confirmDeleteMessage}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default Messages
