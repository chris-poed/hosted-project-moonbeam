const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  artist: { type: String, required: true },
  title: { type: String, required: true },
  year: { type: Number, required: true },
  previewUrl: { type: String, required: true }
});

const Song = mongoose.model("Song", SongSchema);

module.exports = Song;