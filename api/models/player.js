const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  display_name: { type: String, required: true },
  timeline: { type: Array, required: true, default: []},
  is_connected: { type: Boolean, required: true }
});

const Player = mongoose.model("Player", PlayerSchema);

module.exports = Player;