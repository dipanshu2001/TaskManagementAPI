const Task = require('../mongodb/taskModel');
const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler.js');

exports.createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({
    ...req.body,
    userId: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: {
      id: task._id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }
  });
});

exports.getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

exports.getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

exports.updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new AppError('Task not found or access denied', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

  if (!task) {
    throw new AppError('Task not found or access denied', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
});