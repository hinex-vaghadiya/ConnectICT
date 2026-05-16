const router = require('express').Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users with filters
router.get('/', async (req, res) => {
  try {
    const { role, batchYear, company, skill, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (batchYear) query.batchYear = parseInt(batchYear);
    if (company) query.currentCompany = { $regex: company, $options: 'i' };
    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { currentCompany: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    query.isActive = { $ne: false };

    const users = await User.find(query)
      .select('-githubAccessToken')
      .sort({ lastActive: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/companies
// @desc    Get users grouped by company
router.get('/companies', async (req, res) => {
  try {
    const companies = await User.aggregate([
      { $match: { currentCompany: { $exists: true, $ne: '' }, isActive: { $ne: false } } },
      {
        $group: {
          _id: '$currentCompany',
          count: { $sum: 1 },
          members: {
            $push: {
              _id: '$_id',
              name: '$name',
              username: '$username',
              avatar: '$avatar',
              role: '$role',
              currentPosition: '$currentPosition',
              batchYear: '$batchYear',
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/stats
// @desc    Get platform stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const alumni = await User.countDocuments({ role: 'Alumni' });
    const mentors = await User.countDocuments({ isMentor: true });
    const companies = await User.distinct('currentCompany', {
      currentCompany: { $ne: '', $exists: true },
    });

    res.json({
      totalUsers,
      alumni,
      mentors,
      totalCompanies: companies.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/mentors
// @desc    Get all mentors
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await User.find({ isMentor: true })
      .select('-githubAccessToken')
      .sort({ lastActive: -1 });
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-githubAccessToken');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Self-healing database sweep: prune deleted user references from followers and following arrays dynamically
    if ((user.followers && user.followers.length > 0) || (user.following && user.following.length > 0)) {
      const allAssociatedIds = [...(user.followers || []), ...(user.following || [])];
      const validUsers = await User.find({ _id: { $in: allAssociatedIds } }).select('_id');
      const validIdsSet = new Set(validUsers.map(u => u._id.toString()));

      const originalFollowersLength = user.followers ? user.followers.length : 0;
      const originalFollowingLength = user.following ? user.following.length : 0;

      user.followers = (user.followers || []).filter(id => validIdsSet.has(id.toString()));
      user.following = (user.following || []).filter(id => validIdsSet.has(id.toString()));

      if (user.followers.length !== originalFollowersLength || user.following.length !== originalFollowingLength) {
        await User.updateOne(
          { _id: user._id },
          { $set: { followers: user.followers, following: user.following } }
        );
      }
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Toggle follow/unfollow a user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUser._id);
    } else {
      // Follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);

      // Create notification
      await Notification.create({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: 'follow',
        content: 'started following you',
        link: `/profile/${currentUser._id}`,
      });
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ isFollowing: !isFollowing, followersCount: targetUser.followers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'bio',
      'role',
      'batchYear',
      'branch',
      'currentCompany',
      'currentPosition',
      'linkedinUrl',
      'skills',
      'isMentor',
      'mentorTopics',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    updates.profileCompleted = true;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-githubAccessToken');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
