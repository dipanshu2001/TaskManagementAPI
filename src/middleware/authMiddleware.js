const jwt = require('jsonwebtoken');
const { findUserById } = require('../postgresql/userModel');
const AppError = require('../utils/appError');
const asyncHandler = require('./asyncHandler');

module.exports = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Unauthorized: token missing or invalid', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await findUserById(decoded.id);

  if (!user) {
    throw new AppError('Unauthorized: user no longer exists', 401);
  }

  req.user = user;
  next();
});