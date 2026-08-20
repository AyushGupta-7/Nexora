import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { likeComment, unlikeComment } from '../../services/postService'

const Reply = ({ reply, postId, commentId, postAuthorId, onReplyDeleted }) => {
  const { user } = useAuth()
  const [replyLiked, setReplyLiked] = useState(reply.isLiked || false)
  const [replyLikesCount, setReplyLikesCount] = useState(reply.likes?.length || 0)
  const [loading, setLoading] = useState(false)

  const replyAuthor = reply.author || {}
  const replyAuthorName = replyAuthor.fullName || 'Unknown User'
  const replyAuthorAvatar = replyAuthor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(replyAuthorName)}`
  const isReplyAuthor = user?._id === replyAuthor._id
  const isPostAuthor = user?._id === postAuthorId

  // ✅ Reply can be deleted by: reply author OR post author
  const canDeleteReply = isReplyAuthor || isPostAuthor

  const formatDate = (date) => {
    try {
      if (!date) return 'recently'
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }

  const handleReplyLike = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (replyLiked) {
        await unlikeComment(postId, commentId)
        setReplyLikesCount(prev => prev - 1)
        setReplyLiked(false)
      } else {
        await likeComment(postId, commentId)
        setReplyLikesCount(prev => prev + 1)
        setReplyLiked(true)
      }
    } catch (error) {
      console.error('Reply like error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reply-item">
      <div className="reply-avatar">
        <img src={replyAuthorAvatar} alt={replyAuthorName} />
      </div>
      <div className="reply-content">
        <div className="reply-header">
          <span className="reply-author">{replyAuthorName}</span>
          <span className="reply-time">{formatDate(reply.createdAt)}</span>
        </div>
        <p className="reply-text">{reply.content}</p>
        <div className="reply-actions">
          <button 
            className={`reply-like-btn ${replyLiked ? 'liked' : ''}`}
            onClick={handleReplyLike}
            disabled={loading}
          >
            <span className="material-symbols-outlined">{replyLiked ? 'thumb_up' : 'thumb_up'}</span>
            <span>{replyLikesCount}</span>
          </button>
          {/* ✅ Delete button - always visible, shown only if user can delete */}
          {canDeleteReply && (
            <button 
              className="reply-delete-btn"
              onClick={() => onReplyDeleted(reply._id)}
              title="Delete reply"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reply