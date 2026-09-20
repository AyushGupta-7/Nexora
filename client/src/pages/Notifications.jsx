import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { getNotifications, markRead, markAllRead } from '../services/notificationService'
import { formatDistanceToNow } from 'date-fns'
import './Notifications.css'

const NOTIFICATION_ICONS = {
  connection_request: 'person_add',
  connection_accepted: 'people',
  post_like: 'thumb_up',
  post_comment: 'comment',
  comment_reply: 'reply',
  comment_like: 'thumb_up',
  new_message: 'chat',
  application_status: 'work',
}

const NotificationItem = ({ notification, onRead }) => {
  const navigate = useNavigate()
  const sender = notification.sender || {}
  const senderAvatar = sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.fullName || 'User')}&background=00dce3&color=041329`
  const icon = NOTIFICATION_ICONS[notification.type] || 'notifications'

  const formatDate = (date) => {
    try { return formatDistanceToNow(new Date(date), { addSuffix: true }) }
    catch { return '' }
  }

  const handleClick = async () => {
    if (!notification.read) {
      await onRead(notification._id)
    }
    if (notification.link) {
      navigate(notification.link)
    }
  }

  return (
    <div
      className={`notification-item ${!notification.read ? 'unread' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-avatar-wrapper">
        {sender.fullName ? (
          <img src={senderAvatar} alt={sender.fullName} className="notification-avatar" />
        ) : (
          <div className="notification-system-icon">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        )}
        <div className="notification-type-icon">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="notification-content">
        <p className="notification-message">{notification.message}</p>
        <span className="notification-time">{formatDate(notification.createdAt)}</span>
      </div>
      {!notification.read && <div className="notification-unread-dot" />}
    </div>
  )
}

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const response = await getNotifications()
      if (response.success) {
        setNotifications(response.notifications)
        setUnreadCount(response.unreadCount)
      }
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (notificationId) => {
    try {
      await markRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Mark read error:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Mark all read error:', err)
    }
  }

  return (
    <div className="notif-page">
      <Navbar />
      <main className="notif-main">
        <div className="notif-header">
          <div>
            <h1 className="notif-title">Notifications</h1>
            {unreadCount > 0 && (
              <p className="notif-unread-count">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button className="notif-mark-all-btn" onClick={handleMarkAllRead}>
              <span className="material-symbols-outlined">done_all</span>
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="notif-loading">
            <div className="loader"></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="notif-empty">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <span className="material-symbols-outlined">notifications_off</span>
            <h3>No notifications yet</h3>
            <p>When someone interacts with your posts or profile, you'll see it here.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map(n => (
              <NotificationItem key={n._id} notification={n} onRead={handleMarkRead} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Notifications
