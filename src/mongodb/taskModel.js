const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 1,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    userId: {
      type: Number,
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);