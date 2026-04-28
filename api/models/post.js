const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  message: { type: String },
  author: {
    authorID:   { type: Number },
    authorName: { type: String },
  },
  image:      { type: String },
  likeCount:  { type: Number },
  likedBy:    { type: Array },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
