const mongoose = require('mongoose');
// const validator = require('validator');

// must explicity create a Schema to use Schema options such as timestamp
const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
    // timestamps defaults to false
    timestamps: true
  });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;