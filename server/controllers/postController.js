const Post = require('../models/Post')

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'fullName email avatar title')
      .populate('likes', 'fullName')
      .populate('comments.author', 'fullName email avatar')
      .populate('comments.likes', 'fullName')
      .populate('comments.replies.author', 'fullName email avatar')
      .populate('comments.replies.likes', 'fullName')
      .sort({ createdAt: -1 })
      .limit(50)

    const postsWithLikeStatus = posts.map(post => {
      const postObj = post.toJSON()
      postObj.isLiked = post.likes.some(like => 
        like._id.toString() === req.user._id.toString()
      )
      
      // Check like status for each comment
      postObj.comments = postObj.comments.map(comment => {
        comment.isLiked = comment.likes?.some(like => 
          like._id?.toString() === req.user._id.toString()
        ) || false
        
        // Check like status for each reply
        comment.replies = comment.replies?.map(reply => {
          reply.isLiked = reply.likes?.some(like => 
            like._id?.toString() === req.user._id.toString()
          ) || false
          return reply
        }) || []
        
        return comment
      })
      
      return postObj
    })

    res.status(200).json({
      success: true,
      count: postsWithLikeStatus.length,
      posts: postsWithLikeStatus,
    })
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Private
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'fullName email avatar title')
      .populate('likes', 'fullName')
      .populate('comments.author', 'fullName email avatar')
      .populate('comments.likes', 'fullName')
      .populate('comments.replies.author', 'fullName email avatar')
      .populate('comments.replies.likes', 'fullName')

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const postObj = post.toJSON()
    postObj.isLiked = post.likes.some(like => 
      like._id.toString() === req.user._id.toString()
    )

    res.status(200).json({
      success: true,
      post: postObj,
    })
  } catch (error) {
    console.error('Get post error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Create post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, media, tags } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide content for the post',
      })
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      media: media || [],
      tags: tags || [],
    })

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'fullName email avatar title')

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: populatedPost,
    })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      })
    }

    const { content, media, tags } = req.body
    post.content = content || post.content
    post.media = media || post.media
    post.tags = tags || post.tags
    post.edited = true

    await post.save()

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'fullName email avatar title')

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost,
    })
  } catch (error) {
    console.error('Update post error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      })
    }

    await post.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You already liked this post',
      })
    }

    post.likes.push(req.user._id)
    await post.save()

    res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      likes: post.likes.length,
    })
  } catch (error) {
    console.error('Like post error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Unlike a post
// @route   DELETE /api/posts/:id/unlike
// @access  Private
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    if (!post.likes.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have not liked this post',
      })
    }

    post.likes = post.likes.filter(
      like => like.toString() !== req.user._id.toString()
    )
    await post.save()

    res.status(200).json({
      success: true,
      message: 'Post unliked successfully',
      likes: post.likes.length,
    })
  } catch (error) {
    console.error('Unlike post error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide comment content',
      })
    }

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const comment = {
      author: req.user._id,
      content,
      likes: [],
      replies: [],
    }

    post.comments.push(comment)
    await post.save()

    const updatedPost = await Post.findById(post._id)
      .populate('comments.author', 'fullName email avatar')
      .populate('comments.likes', 'fullName')
      .populate('comments.replies.author', 'fullName email avatar')
      .populate('comments.replies.likes', 'fullName')

    const newComment = updatedPost.comments[updatedPost.comments.length - 1]
    const commentObj = newComment.toJSON()
    commentObj.isLiked = false

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: commentObj,
    })
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Delete comment from post
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const comment = post.comments.id(req.params.commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    if (
      comment.author.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      })
    }

    comment.deleteOne()
    await post.save()

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Like a comment
// @route   POST /api/posts/:id/comments/:commentId/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const comment = post.comments.id(req.params.commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    if (!comment.likes) {
      comment.likes = []
    }

    if (comment.likes.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You already liked this comment',
      })
    }

    comment.likes.push(req.user._id)
    await post.save()

    res.status(200).json({
      success: true,
      message: 'Comment liked successfully',
      likes: comment.likes.length,
    })
  } catch (error) {
    console.error('Like comment error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Unlike a comment
// @route   DELETE /api/posts/:id/comments/:commentId/unlike
// @access  Private
const unlikeComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const comment = post.comments.id(req.params.commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    if (!comment.likes || !comment.likes.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have not liked this comment',
      })
    }

    comment.likes = comment.likes.filter(
      like => like.toString() !== req.user._id.toString()
    )
    await post.save()

    res.status(200).json({
      success: true,
      message: 'Comment unliked successfully',
      likes: comment.likes.length,
    })
  } catch (error) {
    console.error('Unlike comment error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Reply to a comment
// @route   POST /api/posts/:id/comments/:commentId/replies
// @access  Private
const replyToComment = async (req, res) => {
  try {
    const { content } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reply content',
      })
    }

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const comment = post.comments.id(req.params.commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    if (!comment.replies) {
      comment.replies = []
    }

    const reply = {
      author: req.user._id,
      content,
      likes: [],
    }

    comment.replies.push(reply)
    await post.save()

    const updatedPost = await Post.findById(post._id)
      .populate('comments.author', 'fullName email avatar')
      .populate('comments.likes', 'fullName')
      .populate('comments.replies.author', 'fullName email avatar')
      .populate('comments.replies.likes', 'fullName')

    const updatedComment = updatedPost.comments.id(req.params.commentId)
    const newReply = updatedComment.replies[updatedComment.replies.length - 1]
    const replyObj = newReply.toJSON()
    replyObj.isLiked = false

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      reply: replyObj,
    })
  } catch (error) {
    console.error('Reply to comment error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

// @desc    Delete a reply
// @route   DELETE /api/posts/:id/comments/:commentId/replies/:replyId
// @access  Private
const deleteReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      })
    }

    const comment = post.comments.id(req.params.commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      })
    }

    const reply = comment.replies.id(req.params.replyId)

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found',
      })
    }

    if (
      reply.author.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reply',
      })
    }

    reply.deleteOne()
    await post.save()

    res.status(200).json({
      success: true,
      message: 'Reply deleted successfully',
    })
  } catch (error) {
    console.error('Delete reply error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}

module.exports = {
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
}