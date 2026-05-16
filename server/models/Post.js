const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'placements', 'dsa', 'projects', 'college-life', 'career-advice', 'resources'],
      default: 'general',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Post', postSchema);
