const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['message', 'comment', 'job', 'event', 'follow'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 30 * 24 * 60 * 60, // Automatically deletes document after 30 days
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
