const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Pinterest')

// Define Post Schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tags: {
    type: Array,
    default: [],
  },
  likes: {
    type: Array,
    default: [],
  },
  comments: {
    type: Array,
    default: [{
      commenttext: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
      }
    }],
  },
  postimage: {
    type: String,
  },
});

// Create Post Model
const Post = mongoose.model('Post', postSchema);

// Export Post Model
module.exports = Post;