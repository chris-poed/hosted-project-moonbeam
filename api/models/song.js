const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  artist: { type: String, required: true },
  title: { type: String, required: true },
  year: { type: Number, required: true },
  url: { 
    type: String, 
    required: true, 
    validate: function(url) {
      try {
        new URL(url);
        return true;
      } catch (err) {
        return false;
      }
    },
    message: props => `${props.value} is not a valid URL`
  }
});

const Song = mongoose.model("Song", SongSchema);

module.exports = Song;