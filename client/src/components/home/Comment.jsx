import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import Reply from './Reply'
import { likeComment, unlikeComment, addReply, deleteReply } from '../../services/postService'

const Comment = ({ comment, postId, postAuthorId, onCommentUpdated, onDeleteComment }) => {
  const { user } = useAuth()
  const [commentLiked, setCommentLiked] = useState(comment.isLiked || false)
  const [commentLikesCount, setCommentLikesCount] = useState(comment.likes?.length || 0)
  const [showReplies, setShowReplies] = useState(false)
  const [replyInputVisible, setReplyInputVisible] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replies, setReplies] = useState(comment.replies || [])
  const [loading, setLoading] = useState(false)

  const commentAuthor = comment.author || {}
  const commentAuthorName = commentAuthor.fullName || 'Unknown User'
  const commentAuthorAvatar = commentAuthor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(commentAuthorName)}`
  const isCommentAuthor = user?._id === commentAuthor._id
  const isPostAuthor = user?._id === postAuthorId

  // Comment can be deleted by: comment author OR post author
  const canDeleteComment = isCommentAuthor || isPostAuthor

  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`

  const formatDate = (date) => {
    try {
      if (!date) return 'recently'
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }

  const handleCommentLike = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (commentLiked) {
        await unlikeComment(postId, comment._id)
        setCommentLikesCount(prev => prev - 1)
        setCommentLiked(false)
      } else {
        await likeComment(postId, comment._id)
        setCommentLikesCount(prev => prev + 1)
        setCommentLiked(true)
      }
      if (onCommentUpdated) onCommentUpdated()
    } catch (error) {
      console.error('Comment like error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddReply = async () => {
    if (!replyText.trim() || loading) return

    setLoading(true)
    try {
      const response = await addReply(postId, comment._id, { content: replyText.trim() })
      if (response.success) {
        setReplies(prev => [...prev, response.reply])
        setReplyText('')
        setReplyInputVisible(false)
        if (onCommentUpdated) onCommentUpdated()
      }
    } catch (error) {
      console.error('Reply error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Delete this reply?')) return
    try {
      await deleteReply(postId, comment._id, replyId)
      setReplies(prev => prev.filter(r => r._id !== replyId))
      if (onCommentUpdated) onCommentUpdated()
    } catch (error) {
      console.error('Delete reply error:', error)
    }
  }

  return (
    <div className="comment-item">
      <div className="comment-avatar-small">
        <img src={commentAuthorAvatar} alt={commentAuthorName} />
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{commentAuthorName}</span>
          <span className="comment-time">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
        <div className="comment-actions">
          <button 
            className={`comment-like-btn ${commentLiked ? 'liked' : ''}`}
            onClick={handleCommentLike}
            disabled={loading}
          >
            <span className="material-symbols-outlined">{commentLiked ? 'thumb_up' : 'thumb_up'}</span>
            <span>{commentLikesCount}</span>
          </button>
          <button 
            className="comment-reply-btn"
            onClick={() => setReplyInputVisible(!replyInputVisible)}
          >
            Reply
          </button>
          {/* ✅ Delete button - ALWAYS VISIBLE, shown only if user can delete */}
          {canDeleteComment && (
            <button 
              className="comment-delete-btn"
              onClick={() => onDeleteComment(comment._id)}
              title="Delete comment"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          )}
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="replies-section">
            <button 
              className="show-replies-btn"
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies ? 'Hide' : 'Show'} {replies.length} replies
            </button>
            
            {showReplies && replies.map((reply) => (
              <Reply
                key={reply._id}
                reply={reply}
                postId={postId}
                commentId={comment._id}
                postAuthorId={postAuthorId}
                onReplyDeleted={handleDeleteReply}
              />
            ))}
          </div>
        )}

        {/* Reply Input */}
        {replyInputVisible && (
          <div className="reply-input-wrapper">
            <div className="reply-avatar-small">
              <img src={userAvatar} alt={user?.fullName || 'User'} />
            </div>
            <input
              type="text"
              className="reply-input"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={loading}
            />
            <button 
              className="reply-submit"
              onClick={handleAddReply}
              disabled={!replyText.trim() || loading}
            >
              <span className="material-symbols-outlined">send</span>
            </button>
            <button 
              className="reply-cancel"
              onClick={() => { setReplyInputVisible(false); setReplyText('') }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Comment