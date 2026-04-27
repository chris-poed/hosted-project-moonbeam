const getGameStatePayload = require("../helpers/getGameStatePayload")
const Game = require("../models/game");

async function handleStartGame(io, socket, payload, callback){

    // server must then validate host, setup game?, set turn order, etc, then emit message to 
    // // broadcast all players to navigate to GameScreen

    
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
        if (player_id !== game.host_player_id) {
            return callback({
                ok: false,
                error: "Only the host can start the game"
            })
        }

        if (!game) {
            return callback({
                ok: false,
                error: "Game not found",
            });
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
                    phase: "listening-placement-phase",
                    round_no: 1,
                    current_player: firstPlayer.player_id,
                },
            },
        );

        // gets the updated game state after the phase change
        const gameStartPayload = await getGameStatePayload(join_code);

        // emits it to the room
        io.to(roomName).emit("game:started", gameStartPayload);
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
