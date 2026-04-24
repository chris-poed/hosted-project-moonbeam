const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true }], // all players in the particular game
  game_host: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  current_player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true}, // player who's turn it is at the moment
  phase: { type: String, enum: [ "lobby", "listening-placement-phase", "reveal-phase" ], required: true, default: 'lobby' },
  round_no: { type: Number, required: true, default: 0 }, // which round the game is currently on
  join_code: { type: String, required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true }]
});

const Game = mongoose.model("Game", GameSchema);

module.exports = Game;