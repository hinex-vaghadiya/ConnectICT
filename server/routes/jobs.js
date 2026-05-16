const router = require('express').Router();
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all active jobs
router.get('/', async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name username avatar role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/jobs
// @desc    Create a job post
router.post('/', auth, async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
    });
    await job.populate('postedBy', 'name username avatar role');

    // Notify followers
    const author = await User.findById(req.user._id);
    if (author && author.followers && author.followers.length > 0) {
      const notifications = author.followers.map((followerId) => ({
        recipient: followerId,
        sender: req.user._id,
        type: 'job',
        content: `posted a new job: ${req.body.title}`,
        link: '/jobs',
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job post
router.put('/:id', auth, async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('postedBy', 'name username avatar role');

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job post
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
