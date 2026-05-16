const router = require('express').Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get distinct users the current user has messaged with
    const sentTo = await Message.distinct('receiver', { sender: userId });
    const receivedFrom = await Message.distinct('sender', { receiver: userId });

    const contactIds = [...new Set([...sentTo.map(String), ...receivedFrom.map(String)])];

    const conversations = await Promise.all(
      contactIds.map(async (contactId) => {
        const contact = await User.findById(contactId).select('name username avatar role');
        if (!contact) return null; // Filter out deleted/inactive users
        
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: contactId },
            { sender: contactId, receiver: userId },
          ],
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          sender: contactId,
          receiver: userId,
          read: false,
        });

        return {
          contact,
          lastMessage,
          unreadCount,
        };
      })
    );

    const filteredConversations = conversations.filter(c => c !== null);
    filteredConversations.sort((a, b) => new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt));

    res.json(filteredConversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/:userId
// @desc    Get messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/messages
// @desc    Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, content } = req.body;

    if (receiver === req.user._id.toString()) {
      return res.status(400).json({ message: "Can't message yourself" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
    });

    // Create notification if no unread message alert from this sender already exists
    const existingAlert = await Notification.findOne({
      recipient: receiver,
      sender: req.user._id,
      type: 'message',
      read: false,
    });

    if (!existingAlert) {
      await Notification.create({
        recipient: receiver,
        sender: req.user._id,
        type: 'message',
        content: 'sent you a message',
        link: '/messages',
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/unread/count
// @desc    Get unread messages count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
