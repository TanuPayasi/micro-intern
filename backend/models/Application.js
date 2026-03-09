const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverNote: {
      type: String,
      required: [true, 'Cover note is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevents same user applying to same task twice
applicationSchema.index({ task: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);