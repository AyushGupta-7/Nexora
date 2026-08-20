import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import Comment from './Comment'
import { 
  likePost, 
  unlikePost, 
  addComment, 
  deleteComment,
  updatePost,
  deletePost
} from '../../services/postService'
import './PostCard.css'

const PostCard = ({ post, onPostUpdated }) => {
  const { user } = useAuth()
  const [liked, setLiked] = useState(post.isLiked || false)
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(post.comments || [])
  const [loading, setLoading] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)

  const author = post.author || {}
  const authorName = author.fullName || 'Unknown User'
  const authorTitle = author.title || 'Member'
  const authorAvatar = author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`

 const isAuthor = String(user?._id || user?.id) === String(post.author?._id || post.author?.id)
  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`

  const formatDate = (date) => {
    try {
      if (!date) return 'recently'
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }

  // Post Like
  const handleLike = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (liked) {
        await unlikePost(post._id)
        setLikesCount(prev => prev - 1)
        setLiked(false)
      } else {
        await likePost(post._id)
        setLikesCount(prev => prev + 1)
        setLiked(true)
      }
      if (onPostUpdated) onPostUpdated()
    } catch (error) {
      console.error('Like error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Edit Post
  const handleEditPost = async () => {
    if (!editContent.trim()) return
    setLoading(true)
    try {
      const response = await updatePost(post._id, { content: editContent.trim() })
      if (response.success) {
        setIsEditing(false)
        if (onPostUpdated) onPostUpdated()
      }
    } catch (error) {
      console.error('Edit error:', error)
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  // Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    setLoading(true)
    try {
      await deletePost(post._id)
      if (onPostUpdated) onPostUpdated()
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || loading) return

    setLoading(true)
    try {
      const response = await addComment(post._id, { content: commentText.trim() })
      if (response.success) {
        setComments(prev => [...prev, response.comment])
        setCommentText('')
        if (onPostUpdated) onPostUpdated()
      }
    } catch (error) {
      console.error('Comment error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await deleteComment(post._id, commentId)
      setComments(prev => prev.filter(c => c._id !== commentId))
      if (onPostUpdated) onPostUpdated()
    } catch (error) {
      console.error('Delete comment error:', error)
    }
  }

  // Share
  const handleShare = async () => {
    const shareData = {
      title: 'Nexora Post',
      text: post.content,
      url: `${window.location.origin}/post/${post._id}`
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setShareSuccess(true)
      } else {
        await navigator.clipboard.writeText(`${post.content}\n\nShared from Nexora: ${shareData.url}`)
        setShareSuccess(true)
      }
      setTimeout(() => setShareSuccess(false), 3000)
    } catch (error) {
      if (error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(`${post.content}\n\nShared from Nexora: ${shareData.url}`)
          setShareSuccess(true)
          setTimeout(() => setShareSuccess(false), 3000)
        } catch (clipError) {
          console.error('Clipboard error:', clipError)
        }
      }
    }
    setShowMenu(false)
  }

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-header">
        <div className="post-author">
          <div className="post-avatar">
            <img src={authorAvatar} alt={authorName} />
          </div>
          <div className="post-author-info">
            <h4 className="post-author-name">{authorName}</h4>
            <p className="post-author-title">{authorTitle}</p>
            <span className="post-time">
              {formatDate(post.createdAt)}
              {post.edited && ' • Edited'}
            </span>
          </div>
        </div>
        <div className="post-actions">
          <button className="post-more-btn" onClick={() => setShowMenu(!showMenu)}>
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
          {showMenu && (
            <div className="post-menu-dropdown">
              {isAuthor && (
                <>
                  <button className="menu-item" onClick={() => { setIsEditing(true); setShowMenu(false) }}>
                    <span className="material-symbols-outlined">edit</span>
                    Edit Post
                  </button>
                  <button className="menu-item delete" onClick={handleDeletePost}>
                    <span className="material-symbols-outlined">delete</span>
                    Delete Post
                  </button>
                  <div className="menu-divider"></div>
                </>
              )}
              <button className="menu-item" onClick={handleShare}>
                <span className="material-symbols-outlined">share</span>
                Share Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="post-body">
        {isEditing ? (
          <div className="edit-post">
            <textarea
              className="edit-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
            />
            <div className="edit-actions">
              <button className="edit-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="edit-save" onClick={handleEditPost} disabled={!editContent.trim() || loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="post-content">{post.content}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="post-tag">#{tag}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="post-media">
          <img src={post.media[0]} alt="Post media" />
        </div>
      )}

      {/* Interactions */}
      <div className="post-interactions">
        <div className="interaction-buttons">
          <button className={`interaction-btn ${liked ? 'liked' : ''}`} onClick={handleLike} disabled={loading}>
            <span className={`material-symbols-outlined ${liked ? 'filled' : ''}`}>thumb_up</span>
            <span>{likesCount}</span>
          </button>
          <button className="interaction-btn" onClick={() => setShowComments(!showComments)}>
            <span className="material-symbols-outlined">chat_bubble</span>
            <span>{comments.length}</span>
          </button>
          <button className={`interaction-btn share-btn ${shareSuccess ? 'shared' : ''}`} onClick={handleShare}>
            <span className="material-symbols-outlined">share</span>
            <span>{shareSuccess ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleAddComment} className="comment-form">
            <div className="comment-input-wrapper">
              <div className="comment-avatar">
                <img src={userAvatar} alt={user?.fullName || 'User'} />
              </div>
              <input
                type="text"
                className="comment-input"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className={`comment-submit ${!commentText.trim() ? 'disabled' : ''}`} disabled={!commentText.trim() || loading}>
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                  postAuthorId={post.author?._id}
                  onCommentUpdated={onPostUpdated}
                  onDeleteComment={handleDeleteComment}
                />
              ))
            )}
          </div>
        </div>
      )}
    </article>
  )
}

export default PostCard