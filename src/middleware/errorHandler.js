module.exports = (err, req, res, next) => {
  console.error(err);

  if(err.code === '23505'){
    return res.status(400).json({
      success: false,
      message: 'Email already exists'
    });
  }

  if(err.code === 11000){
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field];
    return res.status(400).json({
      success: false,
      message: `Duplicate value: "${value}" already exists for ${field}`
    });
  }

  if(err.name === 'JsonWebTokenError'){
    return res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
  }

  if(err.name === 'TokenExpiredError'){
    return res.status(401).json({ success: false, message: 'Unauthorized: token expired' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
  }

  if(err.name === 'ValidationError'){
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  if(err.isOperational){
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  res.status(500).json({ success: false, message: 'Internal Server Error' });
};