const Game = require("../models/game");
const Player = require("../models/player");
const getGameStatePayload = require("../helpers/getGameStatePayload");
const startTurnFlow = require("../helpers/startTurnFlow");
const emitGameState = require("../helpers/emitGameState");
const { startTimer } = require("./gameTimer");

const REVEAL_CNTDOWN = 5;
const MAX_ROUNDS = 2;


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

    //store song before it gets popped from deck

    const gameBeforePop = await Game.findOne({join_code}).populate({
      path: "songs",
      select: "title artist year previewUrl"
    })

    const revealedSong = gameBeforePop?.songs?.[0]
    ?{
      id:         gameBeforePop.songs[0]._id.toString(),
          previewUrl: gameBeforePop.songs[0].previewUrl,
          title:      gameBeforePop.songs[0].title,
          artist:     gameBeforePop.songs[0].artist,
          year:       gameBeforePop.songs[0].year,
        }
    : null

    await Game.findOneAndUpdate(
      { join_code },
      {$pop: { songs: -1}}
    )


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
      revealed_song: revealedSong,
      reveal_message: "Reveal phase started. Result display coming next.",
    };

    const roomName = `game:${join_code}`;

    console.log("SERVER:emitting game:reveal", revealPayload);
    io.to(roomName).emit("game:reveal", revealPayload);

     startTimer(io, roomName, REVEAL_CNTDOWN, async () => {
      const latestGame = await Game.findOne({ join_code });

      if (!latestGame) return;
      if (latestGame.phase !== "reveal-phase") return;

      const nextTurnIndex =
        (latestGame.turn_index + 1) % latestGame.turn_order.length;

      const nextRoundNo =
        nextTurnIndex === 0
          ? latestGame.round_no + 1
          : latestGame.round_no;

      if (nextRoundNo > MAX_ROUNDS) {
        await Game.findOneAndUpdate(
          { join_code },
          {
            $set: {
              phase: "game-ended",
            },
          }
        );

        await emitGameState(io, join_code);
        return;
      }

      const nextPlayerId = latestGame.turn_order[nextTurnIndex];

      await Game.findOneAndUpdate(
        { join_code },
        {
          $set: {
            turn_index: nextTurnIndex,
            current_player: nextPlayerId,
            round_no: nextRoundNo,
          },
        }
      );

      await startTurnFlow(io, join_code);
    });


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
