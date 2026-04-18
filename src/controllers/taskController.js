const Task = require('../mongodb/taskModel');
const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');
const { scheduleReminder, cancelReminder } = require('../services/reminderService');
const { deliverWebhook } = require('../services/webhookService');

exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, status, categoryId, tags } = req.body;

  const task = await Task.create({
    title,
    description,
    dueDate,
    status,
    categoryId: categoryId || null,
    tags: tags || [],
    userId: req.user.id
  });

  scheduleReminder(task);

  const populated = await task.populate('categoryId', 'name');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: populated
  });
});

exports.getTasks = asyncHandler(async (req, res) => {
  const filter = { userId: req.user.id };

  if(req.query.category){
    filter.categoryId = req.query.category;
  }
  if(req.query.tag){
    filter.tags = { $in: [req.query.tag] };
  }
  if(req.query.status){
    filter.status = req.query.status;
  }

  const tasks = await Task.find(filter)
    .populate('categoryId', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

exports.getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('categoryId', 'name');

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
    throw new AppError('Task not found', 404);
  }
  if(task.userId !== req.user.id){
    throw new AppError('Forbidden: you do not have access to this task', 403);
  }

  const wasCompleted =
    task.status !== 'completed' && req.body.status === 'completed';

  const { title, description, dueDate, status, categoryId, tags } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (dueDate !== undefined) updates.dueDate = dueDate;
  if (status !== undefined) updates.status = status;
  if (categoryId !== undefined) updates.categoryId = categoryId;
  if (tags !== undefined) updates.tags = tags;

  const updated = await Task.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).populate('categoryId', 'name');

  if(wasCompleted){
    cancelReminder(task._id.toString());
    deliverWebhook(updated).catch(console.error);
  }
  else{
    scheduleReminder(updated);
  }

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: updated
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

  cancelReminder(task._id.toString());
  await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({ 
    success: true,
    message: 'Task deleted successfully' 
  });
});