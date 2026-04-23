const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player", validate: v => v.length > 0, required: true }], // all players in the particular game
  game_host: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  current_player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true }, // player who's turn it is at the moment
  phase: { type: String, enum: [ "listening-placement-phase", "reveal-phase" ], required: true },
  round_no: { type: Number, required: true }, // which round the game is currently on
  join_code: { type: String, required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true }]
});

const Game = mongoose.model("Game", GameSchema);

module.exports = Game;