const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title:{
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 1,
      maxlength: 100
    },
    description:{
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    dueDate:{
      type: Date,
      required: [true, 'Due date is required']
    },
    status:{
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    userId:{
      type: Number,
      required: true,
      index: true
    },
    categoryId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    tags:{
      type: [String],
      default: [],
      validate:{
        validator: (arr) => arr.length <= 10,
        message: 'A task can have at most 10 tags'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);