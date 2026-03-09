const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');

// GET /api/tasks — browse all open tasks
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'open' };

    if (category && category !== 'All') query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillsRequired: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tasks/user/my-tasks — MUST be before /:id
router.get('/user/my-tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      'postedBy', 'name email bio skills'
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/tasks — create task
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, skillsRequired, category, duration, compensation } = req.body;

    if (!title || !description || !category || !duration || !skillsRequired?.length)
      return res.status(400).json({ message: 'All fields are required' });

    const task = await Task.create({
      title,
      description,
      skillsRequired,
      category,
      duration,
      compensation: compensation || 'Unpaid / Portfolio',
      postedBy: req.user._id,
    });

    await task.populate('postedBy', 'name email');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/tasks/:id — update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await task.deleteOne();
    await Application.deleteMany({ task: req.params.id });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;