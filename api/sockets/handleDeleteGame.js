const Game = require("../models/game");
const Player = require("../models/player")

async function handleDeleteGame(io, socket, payload, callback){
try{

    const { join_code } = payload;
    
    //check join code exists
    const game = await Game.findOne({ join_code });

    if(!game){
        console.log("Game has already been deleted");
        return callback({ok:true})
    }

    //check current phase is game-ended --> don't  delete if not
    if(game.phase !== "game-ended"){
        return callback({
            ok:false,
            error: "Game is still in play",
        });
    }
    //delete players
    await Player.deleteMany({
        _id: {$in: game.players}
    });

    //delete game
    await Game.deleteOne({_id:game._id});

    //broadcast to room --> need to move any remaining players
    io.to(`game:${join_code}`).emit("game:closed", {
       message: "This game room has been closed",
    });

    return callback({ok:true});
    } catch(error){
    
        return callback({
            ok:false,
            error: "Game delete failed"
        })
    }
}

module.exports = handleDeleteGame;