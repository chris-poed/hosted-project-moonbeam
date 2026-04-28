const getGameStatePayload = require("../helpers/getGameStatePayload")
const { startTimer } = require("./gameTimer")
const Game = require("../models/game");

async function handleStartGame(io, socket, payload, callback){

    // server must then validate host, setup game?, set turn order, etc, then emit message to 
    // // broadcast all players to navigate to GameScreen

    //constants used to set timer values    
    const INTRO_CNTDOWN = 3;
    const LLP_CNTDOWN = 30;

    //required for updating game phase chnages to trigger state events in the frontend
    async function emitUpdatedGameState(io,join_code, roomName){
        const updatedPayload = await getGameStatePayload(join_code);
        io.to(roomName).emit("game:phase_changed", updatedPayload);
        return updatedPayload;
    }
    
    try {

        const  { player_id, join_code } = payload

        if (!join_code) {
            return callback({
                ok: false,
                error: "Game not found"
            })
        }

        const roomName = `game:${join_code}`;
        const game = await getGameStatePayload(join_code)

        if (!game) {
            return callback({
                ok: false,
                error: "Game not found",
            });
        }

        if (player_id !== game.host_player_id) {
            return callback({
                ok: false,
                error: "Only the host can start the game"
            })
        }

        if (game.players.length <= 1) {
            return callback({
                ok: false,
                error: "2 players or more are needed to start the game"
            })
        }

        if (game.phase !== "lobby") {
            return callback({
                ok: false,
                error: "Game has already started",
            });
        }

        // validating that the game code exists
        // validating the game phase isn't lobby when the game starts
        // choosing a random player as the first player to start

        // set a random player to start
        const randomIndex = Math.floor(Math.random() * game.players.length);
        const firstPlayer = game.players[randomIndex];

        // updates the Game in the db to the next phase and sets the round to 1
        const updatedGame = await Game.findOneAndUpdate(
            { join_code: join_code },
            {
                $set: {
                    phase: "intro-countdown",   
                    round_no: 1,  ///this will nedd to be updated per round e.g. round_no: round_no +1
                    current_player: firstPlayer.player_id,
                },
            },
        );

        // gets the updated game state after the phase change
        const gameStartPayload = await getGameStatePayload(join_code);

        // emits it to the room
        io.to(roomName).emit("game:started", gameStartPayload);

        ///!!!!call start intro timer here

        startTimer(io, roomName, INTRO_CNTDOWN, async ()=>{
            await Game.findOneAndUpdate(
                { join_code },
                {
                    $set:{
                        phase:"listening-placement-phase",
                    },
                }
            )

            await emitUpdatedGameState(io, join_code, roomName);

            ///!!!emitUpdatedGameState broadcast - set phase to LPP
             startTimer(io, roomName, LLP_CNTDOWN, async ()=>{
                await Game.findOneAndUpdate(
                    { join_code },
                    {
                        $set:{
                            phase:"placement-ended",
                        },
                    }
                )

            await emitUpdatedGameState(io, join_code, roomName);

            });
         });

        

        return callback({
            ok:true,
        })
        

    } catch (error) {
        console.log(error);
        return callback({
            ok: false,
            error: "Start Game failed",
        });
    }
}

module.exports = handleStartGame
