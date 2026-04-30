const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  display_name: {
    type: String,
    required: true,
  },

  timeline: {
    type: [
      new mongoose.Schema(
        {
          song_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
            required: true,
          },
          year: {
            type: Number,
            required: true,
          },
        },
        { _id: false }
      ),
    ],
    default: [],
  },

  is_connected: {
    type: Boolean,
    required: true,
  },
});

const Player = mongoose.model("Player", PlayerSchema);

module.exports = Player;