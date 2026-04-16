const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail } = require('../postgresql/userModel');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await createUser(email, hashedPassword);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: user
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({ id: user.id, email: user.email });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token
  });
});

exports.getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});