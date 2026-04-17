const Task = require('../mongodb/taskModel');
const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler.js');

exports.createTask = asyncHandler(async(req, res) => {
  const task = await Task.create({
    title,
    description,
    dueDate,
    status,
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
  if(!task){
    throw new AppError('Task not found', 404);
  }
  if(task.userId !== req.user.id){
    throw new AppError('Forbidden: you do not have access to this task', 403);
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

exports.updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if(!task){
    throw new AppError('Task not found or access denied', 404);
  }
  if(task.userId !== req.user.id){
    throw new AppError('Forbidden: you do not have access to this task', 403);
  }
  const{title, description, dueDate, status} = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (dueDate !== undefined) updates.dueDate = dueDate;
  if (status !== undefined) updates.status = status;
 
  const updated = await Task.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if(!task){
    throw new AppError('Task not found', 404);
  }
  if(task.userId !== req.user.id){
    throw new AppError('Forbidden: you do not have access to this task', 403);
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
});