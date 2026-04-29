const Game = require("../models/game");
const getGameStatePayload = require("../helpers/getGameStatePayload");
const  shuffleGamePlayers  = require("../helpers/shuffleGamePlayers");
const startTurnFlow = require("../helpers/startTurnFlow")
const Song = require("../models/song")
const {shuffleDeck} = require("../gameLogic")

async function handleStartGame(io, socket, payload, callback){
    
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
       
        
        //randomly shuffle players to create turn array
        const shuffledPlayers = shuffleGamePlayers(game.players);
        const firstPlayer = shuffledPlayers[0].player_id;
        
        //creates a randomly shuffled "deck" of songs

        const allSongs = await Song.find ({previewUrl: {$ne: ""}})

        if (allSongs.length === 0 ){
            return callback({ok: false, error: "No songs available to play"})
        }

        const deck = shuffleDeck(allSongs).map((song) => song._id)


        // updates the Game in the db to the next phase and sets the round to 1
        const updatedGame = await Game.findOneAndUpdate(
            { join_code: join_code },
            {
                $set: {
                    phase: "intro-countdown",   
                    round_no: 1,  //this will be updated after reveal phase
                    turn_order: shuffledPlayers.map((player)=>player.player_id),
                    turn_index:0,  //this will be updated after reveal phase
                    current_player: firstPlayer,
                    songs: deck,
                },
            },
        );

        // gets the updated game state after the phase change
        const gameStartPayload = await getGameStatePayload(join_code);

        // emits it to the room
        io.to(roomName).emit("game:started", gameStartPayload);

        
        await startTurnFlow(io, join_code);
        

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
