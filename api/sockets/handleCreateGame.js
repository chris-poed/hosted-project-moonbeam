 const Player = require("../models/player");
 const Game = require("../models/game");

 function generateJoinCode(){
        return Math.random().toString(36).substring(2, 6).toUpperCase();

    }

 async function generateUniqueCode(){
        let joinCode = generateJoinCode();
       //let existingGame;
        
        while(await Game.findOne({join_code:joinCode})){
            joinCode = generateJoinCode();
           
            
        }
        console.log("JOINCODE----->>>>",joinCode);
        return joinCode;
    }

 async function handleCreateGame(io, socket, payload, callback){

    console.log("create game handler")
    console.log(payload)
    // generate room code function
   

    
    

    try{
        const { display_name } = payload;

        if(!display_name){
            return callback({
            ok:false,
            message: "enter a display name"
             })
        }

        //create player
        const player = await Player.create({
            display_name:display_name,
            is_connected:true
        })

        const joinCode = await generateUniqueCode();

        console.log(joinCode)
        //create game
        const game = await Game.create({
            players:[player._id],
            game_host:player._id,
            current_player: player._id,
            join_code:joinCode,
            songs:[]
        })

        console.log(game)

        const roomName = `game:${game.join_code}`;
        socket.join(roomName);

        const lobbyPayload = {
            game_id: game._id,
            join_code:game.join_code,
            game_host:player._id.toString(),
            players: [
                {
                    player_id: player._id.toString(),
                    display_name:player.display_name,
                    is_connected:player.is_connected,
                }
            ],
            phase:game.phase
        };


         callback({
        ok:true,
        game_id: game._id,
        join_code:game.join_code,
        player_id: player.id.toString(),
        lobby: lobbyPayload,

        })

        io.to(roomName).emit("lobby:updated", lobbyPayload);


       

    } catch(error){
        console.log(error);


    }



    //create player


    //create game --> mondo DB interaction


   
}
module.exports = handleCreateGame