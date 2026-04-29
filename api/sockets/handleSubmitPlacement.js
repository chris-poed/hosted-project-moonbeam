const Game = require("../models/game");
const Player = require("../models/player");
const getGameStatePayload = require("../helpers/getGameStatePayload");
const startTurnFlow = require("../helpers/startTurnFlow");
const emitGameState = require("../helpers/emitGameState");
const { startTimer } = require("./gameTimer");
const { isValidPlacement } = require("../gameLogic")

const REVEAL_CNTDOWN = 5;
const MAX_ROUNDS = 2;


async function handleSubmitPlacement(io, socket, payload, callback) {
  try {
   
    const { join_code, player_id, song_id, position } = payload;

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

    const game = await Game.findOne({ join_code })

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

    const currentSong = gameBeforePop?.songs?.[0];

    if (!currentSong) {
      return callback({
        ok: false,
        error: "No current song found",
      });
    }

    const currentSongId = currentSong._id.toString();

    if (song_id && song_id !== currentSongId) {
      return callback({
        ok: false,
        error: "Submitted song does not match current song",
      });
    }

    const player = await Player.findById(player_id).lean();

    if (!player) {
      return callback({
        ok: false,
        error: "Player not found",
      });
    }

    const currentTimeline = player.timeline || [];

    const revealedSong = {
    id: currentSongId,
    song_id: currentSongId,
    previewUrl: currentSong.previewUrl,
    title: currentSong.title,
    artist: currentSong.artist,
    year: currentSong.year,
  };

  const noPlacementMade = position === null || position === undefined;

  let wasCorrect = false;
  let placementPosition = null;

  if (!noPlacementMade) {
    placementPosition = Number(position);

    if (
      !Number.isInteger(placementPosition) ||
      placementPosition < 0 ||
      placementPosition > currentTimeline.length
    ) {
      return callback({
        ok: false,
        error: "Invalid placement position",
      });
    }

    wasCorrect = isValidPlacement(
      currentTimeline,
      {
        song_id: currentSong._id,
        year: currentSong.year,
      },
      placementPosition
    );

    if (wasCorrect) {
      const timelineSong = {
        song_id: currentSong._id,
        year: currentSong.year,
      };

      const nextTimeline = [
        ...currentTimeline.slice(0, placementPosition),
        timelineSong,
        ...currentTimeline.slice(placementPosition),
      ];

      await Player.findByIdAndUpdate(player_id, {
        $set: {
          timeline: nextTimeline,
        },
      });
    }
  }

    await Game.findOneAndUpdate(
      { join_code },
      {
        $pop: { songs: -1 },
        $set: {
          phase: "reveal-phase",
        },
      }
    );

    const updatedPayload = await getGameStatePayload(join_code);

    const revealPayload = {
      ...updatedPayload,
      revealed_song: revealedSong,
      was_correct: wasCorrect,
      attempted_position: placementPosition,
      reveal_message: wasCorrect
        ? "Correct placement!"
        : "Incorrect placement.",
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
