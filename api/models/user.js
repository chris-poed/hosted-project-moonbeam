const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  account: {
    email:    { type: String, required: true },
    password: { type: String, required: true },
  },
  profile: {
    first_name:   { type: String, required: true },
    last_name:    { type: String, required: true },
    display_name: { type: String, required: false },
    profile_pic:  { type: String, required: false },
  },
  social: {
    friends_list:    { type: Array, required: true },
    friend_requests: { type: Array, required: true },
  },
});

module.exports = mongoose.model('User', UserSchema);
