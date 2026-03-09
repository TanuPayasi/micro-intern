const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    skillsRequired: {
      type: [String],
      required: [true, 'At least one skill is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Design', 'Development', 'Marketing', 'Writing', 'Data', 'Business', 'Other'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    compensation: {
      type: String,
      default: 'Unpaid / Portfolio',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'closed'],
      default: 'open',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);