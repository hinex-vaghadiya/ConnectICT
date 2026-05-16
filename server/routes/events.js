const router = require('express').Router();
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { type, upcoming } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    if (upcoming === 'true') query.date = { $gte: new Date() };
    const events = await Event.find(query)
      .populate('organizer', 'name username avatar role')
      .populate('attendees', 'name username avatar')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    await event.populate('organizer', 'name username avatar role');

    // Notify followers
    const author = await User.findById(req.user._id);
    if (author && author.followers && author.followers.length > 0) {
      const notifications = author.followers.map((followerId) => ({
        recipient: followerId,
        sender: req.user._id,
        type: 'event',
        content: `created a new event: ${req.body.title}`,
        link: '/events',
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/rsvp', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const idx = event.attendees.indexOf(req.user._id);
    if (idx === -1) {
      if (event.maxAttendees > 0 && event.attendees.length >= event.maxAttendees) {
        return res.status(400).json({ message: 'Event is full' });
      }
      event.attendees.push(req.user._id);
    } else {
      event.attendees.splice(idx, 1);
    }
    await event.save();
    await event.populate('organizer', 'name username avatar role');
    await event.populate('attendees', 'name username avatar');
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
