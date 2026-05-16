const router = require('express').Router();
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// @route   GET /api/posts
// @desc    Get all forum posts
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'name username avatar role')
      .populate('comments.author', 'name username avatar role')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name username avatar role')
      .populate('comments.author', 'name username avatar role');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts
// @desc    Create a forum post
router.post('/', auth, async (req, res) => {
  try {
    const post = await Post.create({
      ...req.body,
      author: req.user._id,
    });
    await post.populate('author', 'name username avatar role');
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Toggle like on a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      content: req.body.content,
      author: req.user._id,
    });

    await post.save();
    await post.populate('author', 'name username avatar role');
    await post.populate('comments.author', 'name username avatar role');

    // Notify author if the commenter is not the author
    if (post.author._id.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author._id,
        sender: req.user._id,
        type: 'comment',
        content: `commented on your post: "${post.title.substring(0, 40)}${post.title.length > 40 ? '...' : ''}"`,
        link: `/forum/${post._id}`,
      });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
