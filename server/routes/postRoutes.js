const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  likeComment,
  unlikeComment,
  replyToComment,
  deleteReply,
} = require('../controllers/postController')

// Post CRUD
router.route('/')
  .get(protect, getPosts)
  .post(protect, createPost)

router.route('/:id')
  .get(protect, getPost)
  .put(protect, updatePost)  // ✅ Edit post
  .delete(protect, deletePost)  // ✅ Delete post

// Post Like
router.route('/:id/like')
  .post(protect, likePost)

router.route('/:id/unlike')
  .delete(protect, unlikePost)

// Comments
router.route('/:id/comments')
  .post(protect, addComment)

router.route('/:id/comments/:commentId')
  .delete(protect, deleteComment)  // ✅ Delete comment

// Comment Like
router.route('/:id/comments/:commentId/like')
  .post(protect, likeComment)

router.route('/:id/comments/:commentId/unlike')
  .delete(protect, unlikeComment)

// Replies
router.route('/:id/comments/:commentId/replies')
  .post(protect, replyToComment)

router.route('/:id/comments/:commentId/replies/:replyId')
  .delete(protect, deleteReply)  // ✅ Delete reply

module.exports = router