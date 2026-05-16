const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    location: {
      type: String,
      default: 'Online',
    },
    type: {
      type: String,
      enum: ['meetup', 'webinar', 'hackathon', 'workshop', 'reunion', 'other'],
      default: 'meetup',
    },
    link: {
      type: String,
      default: '',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxAttendees: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
