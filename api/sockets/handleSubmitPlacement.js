const Game = require("../models/game");
const Player = require("../models/player");
const getGameStatePayload = require("../helpers/getGameStatePayload");

async function handleSubmitPlacement(io, socket, payload, callback) {
  try {
    const { join_code, player_id, timeline } = payload;

    if (!join_code) {
      return callback({
        ok: false,
        error: "Game not found",
      });
    }

    if (!player_id) {
      return callback({
        ok: false,
        error: "Player not found",
      });
    }

    const game = await Game.findOne({ join_code });

    if (!game) {
      return callback({
        ok: false,
        error: "Game not found",
      });
    }

    if (game.phase !== "placement-ended") {
      return callback({
        ok: false,
        error: "Placement cannot be submitted at this time",
      });
    }

    if (game.current_player.toString() !== player_id) {
      return callback({
        ok: false,
        error: "Only the current player can submit placement",
      });
    }

    await Player.findByIdAndUpdate(player_id, {
      $set: {
        timeline: timeline || [],
      },
    });

    await Game.findOneAndUpdate(
      { join_code },
      {
        $set: {
          phase: "reveal-phase",
        },
      }
    );

    const updatedPayload = await getGameStatePayload(join_code);

    const revealPayload = {
      ...updatedPayload,
      reveal_message: "Reveal phase started. Result display coming next.",
    };

    const roomName = `game:${join_code}`;

    io.to(roomName).emit("game:reveal", revealPayload);

    return callback({
      ok: true,
    });
  } catch (error) {
    console.log(error);

    return callback({
      ok: false,
      error: "Submit placement failed",
    });
  }
}

module.exports = handleSubmitPlacement;
