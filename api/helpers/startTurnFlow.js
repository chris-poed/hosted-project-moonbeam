const Game = require("../models/game");
const emitGameState = require("./emitGameState")
const { startTimer } = require("../sockets/gameTimer");

const INTRO_COUNTDOWN = 3;
const LLP_COUNTDOWN = 30;

async function startTurnFlow(io, join_code) {
  const roomName = `game:${join_code}`;

  await Game.findOneAndUpdate(
    { join_code },
    {
      $set: {
        phase: "intro-countdown",
      },
    }
  );

  await emitGameState(io, join_code);

  startTimer(io, roomName, INTRO_COUNTDOWN, async () => {
    await Game.findOneAndUpdate(
      { join_code },
      {
        $set: {
          phase: "listening-placement-phase",
        },
      }
    );

    await emitGameState(io, join_code);

    startTimer(io, roomName, LLP_COUNTDOWN, async () => {
      await Game.findOneAndUpdate(
        { join_code },
        {
          $set: {
            phase: "placement-ended",
          },
        }
      );
      

      await emitGameState(io, join_code);;
    });
  });
}

module.exports = startTurnFlow;
