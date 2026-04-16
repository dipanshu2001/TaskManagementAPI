const mongoose = require('mongoose');

const connectMongo = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
};

module.exports = connectMongo;