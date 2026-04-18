const Category = require('../mongodb/categoryModel');
const Task = require('../mongodb/taskModel');
const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');

exports.createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const category = await Category.create({ name, userId: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

exports.getCategories = asyncHandler(async (req, res)=> {
  const categories = await Category.find({ userId: req.user.id }).sort({
    name: 1
  });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

exports.getCategoryById = asyncHandler(async (req, res)=> {
  const category = await Category.findById(req.params.id);

  if(!category){
    throw new AppError('Category not found', 404);
  }
  if(category.userId !== req.user.id){
    throw new AppError('Forbidden: you do not have access to this category', 403);
  }

  res.status(200).json({ success: true, data: category });
});

exports.updateCategory = asyncHandler(async (req, res)=> {
  const category = await Category.findById(req.params.id);

  if(!category){
    throw new AppError('Category not found', 404);
  }
  if(category.userId !== req.user.id){
    throw new AppError('Forbidden: you do not have access to this category', 403);
  }

  const { name } = req.body;
  if(name !== undefined) category.name = name;
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category
  });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if(!category){
    throw new AppError('Category not found', 404);
  }
  if(category.userId !== req.user.id){
    throw new AppError('Forbidden: you do not have access to this category', 403);
  }

  await Task.updateMany(
    { categoryId: category._id, userId: req.user.id },
    { $set: { categoryId: null } }
  );

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted and detached from tasks successfully'
  });
});