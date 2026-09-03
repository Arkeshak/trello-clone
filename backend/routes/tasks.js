const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/tasks
// @desc    Get tasks. Admins see all. Users see their own + unassigned.
router.get('/', protect, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find().populate('creator', 'username').populate('assignee', 'username');
    } else {
      tasks = await Task.find({
        $or: [{ assignee: req.user._id }, { assignee: null }]
      }).populate('creator', 'username').populate('assignee', 'username');
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task (any logged in user)
router.post('/', protect, async (req, res) => {
  const { title, description, status } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      creator: req.user._id,
      assignee: null
    });

    const populated = await task.populate('creator', 'username');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task (status or assignee)
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Normal users can only:
    // 1. Assign an unassigned task to themselves
    // 2. Update the status of their own assigned tasks
    if (req.user.role !== 'admin') {
      const isAssignedToUser = task.assignee && task.assignee.toString() === req.user._id.toString();
      const isUnassigned = !task.assignee;

      // If trying to assign
      if (req.body.assignee !== undefined) {
        if (!isUnassigned) {
          return res.status(403).json({ message: 'Task is already assigned to someone' });
        }
        if (req.body.assignee !== req.user._id.toString()) {
          return res.status(403).json({ message: 'You can only assign tasks to yourself' });
        }
      }

      // If trying to update status, must be assigned to them
      if (req.body.status !== undefined && !isAssignedToUser) {
        return res.status(403).json({ message: 'You can only update status of tasks assigned to you' });
      }
    }

    const { title, description, status, assignee } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (assignee !== undefined) task.assignee = assignee || null;

    const updated = await task.save();
    await updated.populate('creator', 'username');
    await updated.populate('assignee', 'username');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
