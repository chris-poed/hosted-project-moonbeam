const Player = require("../models/player");
 const Game = require("../models/game");
 const Song = require("../models/song")

 async function handleJoinGame(io, socket, payload, callback){

    try{
        const {display_name, join_code} = payload;
        
        if(!display_name || !display_name.trim()){
            return callback({
            ok:false,
            error: "Enter a display name"
             })
        }

        if(!join_code){
            return callback({
            ok:false,
            error: "Enter a game pin"
             })
        }

        //Ensure join code format matches exactly
        const JoinCodeChecked = join_code.trim().toUpperCase();

        //check whether game exists 
        const game = await Game.findOne({ join_code: JoinCodeChecked}).populate(
            "players"
        );

        if(!game){
            return callback({
                ok:false,
                error: "Game not found",
            });
        }

        if(game.phase !=="lobby") {
            return callback({
                ok:false,
                error: "This game has already started",

            })
        }

        if(game.players.length >=4){
            return callback({
                ok:false,
                error:"This game is full",
            })
        }

        //new code for intialising timeline with one song
        //ensure the intial song is removed from the game array

        //check that songs exit in the Gane
        if(!game.songs || game.songs.length === 0){
            return callback({
                ok:false,
                error: "No songs available",
            });
        }

        //select first song for timeline
        const randomIndex = Math.floor(Math.random() * game.songs.length);

        const initialSong = game.songs[randomIndex];

         const startingSong = await Song.findById(initialSong)

         console.log("INITIAL SONG ID Joining Player------>", startingSong);

        const player = await Player.create({
            display_name:display_name.trim(),
            timeline:[
                {
                    song_id:startingSong._id,
                    year: startingSong.year,
                }
            ],
            is_connected:true,
        });

        game.players.push(player._id);
        
        //remove intial song from games song array
        game.songs.pull(startingSong._id);
        await game.save();

        const updatedGame = await Game.findById(game._id).populate("players");

        const roomName = `game:${updatedGame.join_code}`;

        //Add player to the game room
        socket.join(roomName);

        const lobbyPayload = {
            game_id: updatedGame._id.toString(),
            join_code: updatedGame.join_code,
            game_host: updatedGame.game_host.toString(),
            players: updatedGame.players.map((player) => ({
            player_id: player._id.toString(),
            display_name: player.display_name,
            is_connected: player.is_connected,
            })),
            phase: updatedGame.phase,
        };

        //This is sent back to the player
        //data is needed for transitioninto lobby
        callback({
        ok:true,
        player_id: player._id.toString(),
        lobby: lobbyPayload,

        })

        //This is broadcast to all the players in the lobby
        //data is needed for live updates - server syncs players state
        io.to(roomName).emit("lobby:updated", lobbyPayload);


    } catch(error) {
        
        callback({
            ok:false,
            error: "Join Game failed"

        })
    }
 }

 module.exports = handleJoinGame;