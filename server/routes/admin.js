const router = require('express').Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Post = require('../models/Post');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes require auth + admin
router.use(auth, admin);

router.get('/stats', async (req, res) => {
  try {
    const [users, jobs, posts, events] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Post.countDocuments(),
      Event.countDocuments(),
    ]);
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name username avatar role createdAt isVerified');
    res.json({ users, jobs, posts, events, roleStats, recentUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const users = await User.find()
      .select('-githubAccessToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments();
    res.json({ users, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      { new: true }
    ).select('-githubAccessToken');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/admin', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: req.body.isAdmin },
      { new: true }
    ).select('-githubAccessToken');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);

    // Clean up followers & following arrays of other users!
    await User.updateMany(
      {},
      {
        $pull: {
          followers: userId,
          following: userId,
        },
      }
    );

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/deactivate', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    ).select('-githubAccessToken');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
