const mongoose = require('mongoose');

const connectMongo = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  mongoose.connection.on('disconnected', () => {
    console.error('MongoDB disconnected');
  });
 
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });
};

module.exports = connectMongo;