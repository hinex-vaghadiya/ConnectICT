const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'freelance', 'contract'],
      required: true,
    },
    location: {
      type: String,
      default: 'Remote',
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [String],
    salary: {
      type: String,
      default: '',
    },
    applyLink: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ title: 'text', company: 'text', tags: 'text' });

module.exports = mongoose.model('Job', jobSchema);
