const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// POST /api/applications — apply to a task
router.post('/', protect, async (req, res) => {
  try {
    const { taskId, coverNote } = req.body;

    if (!taskId || !coverNote)
      return res.status(400).json({ message: 'Task ID and cover note are required' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.postedBy.toString() === req.user._id.toString())
      return res.status(400).json({ message: "You can't apply to your own task" });

    if (task.status !== 'open')
      return res.status(400).json({ message: 'This task is no longer accepting applications' });

    const existing = await Application.findOne({ task: taskId, applicant: req.user._id });
    if (existing)
      return res.status(400).json({ message: 'You already applied to this task' });

    const application = await Application.create({
      task: taskId,
      applicant: req.user._id,
      coverNote,
    });

    await Task.findByIdAndUpdate(taskId, { $inc: { applicantsCount: 1 } });

    await application.populate([
      { path: 'task', select: 'title category' },
      { path: 'applicant', select: 'name email' },
    ]);

    res.status(201).json(application);
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: 'You already applied to this task' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/applications/my-applications
router.get('/my-applications', protect, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'task',
        select: 'title category status duration compensation',
        populate: { path: 'postedBy', select: 'name' },
      })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/applications/task/:taskId — get applicants (task owner only)
router.get('/task/:taskId', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const applications = await Application.find({ task: req.params.taskId })
      .populate('applicant', 'name email bio skills')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/applications/:id/status — accept or reject
router.put('/:id/status', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('task');
    if (!application)
      return res.status(404).json({ message: 'Application not found' });

    if (application.task.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    application.status = req.body.status;
    if (req.body.feedback) application.feedback = req.body.feedback;
    await application.save();

    if (req.body.status === 'accepted') {
      await Task.findByIdAndUpdate(application.task._id, { status: 'in-progress' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;