const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxLength: 500,
    },
    role: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Alumni'],
      default: '1st Year',
    },
    batchYear: {
      type: Number,
      min: 2000,
      max: 2040,
    },
    branch: {
      type: String,
      default: 'IT',
    },
    currentCompany: {
      type: String,
      default: '',
    },
    currentPosition: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isMentor: {
      type: Boolean,
      default: false,
    },
    mentorTopics: [
      {
        type: String,
        trim: true,
      },
    ],
    githubAccessToken: {
      type: String,
      select: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
userSchema.index({ name: 'text', username: 'text', currentCompany: 'text', skills: 'text' });
userSchema.index({ role: 1, batchYear: 1 });
userSchema.index({ currentCompany: 1 });

module.exports = mongoose.model('User', userSchema);
