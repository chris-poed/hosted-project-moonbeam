
require("./mongodb_helper")
const mongoose = require("mongoose");
const handleDeleteGame = require("../sockets/handleDeleteGame");
const Game = require("../models/game");
const Player = require("../models/player");

describe("handleDeleteGame", ()=>{
    let io;
        let socket;
        let callback
    
    
    beforeEach(()=>{
            socket = {
                join:jest.fn(),
            };
            io = {
                to:jest.fn().mockReturnThis(),
                emit:jest.fn(),
            };
    
            callback = jest.fn()
        })
    
    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for(const key in collections){
            await collections[key].deleteMany({})
        }
    })
    
    test("returns ok true if the game is already deleted or not found", async ()=>{
            await handleDeleteGame(
                io,
                socket,
                {join_code:"XOXO"},
                callback
            );
            expect(callback).toHaveBeenCalledWith({
                 ok:true,
               
            })
        })

    test("returns an error if the join_code is missing", async ()=>{
        await handleDeleteGame(
            io,
            socket,
            {},
            callback
        );
        expect(callback).toHaveBeenCalledWith({
                ok:false,
                error:"Game code missing"
            
        })
        expect(Game.find()).resolves.toHaveLength(0)
        expect(io.to).not.toHaveBeenCalled();
        expect(io.emit).not.toHaveBeenCalled();
    })
    
    test("deleted the game and players when game has ended", async ()=> {
        //create players
        const hostPlayer = await Player.create({display_name: "Batman", is_connected:true});
        const player1 = await Player.create({display_name: "Robin", is_connected:true});

        const game = await Game.create(
                {
                    players:[hostPlayer._id, player1._id],
                    game_host:hostPlayer._id,
                    current_player: hostPlayer._id,
                    join_code:"XYXY",
                    phase:"game-ended",
                    
                });

        await handleDeleteGame(
            io,
            socket,
            {join_code:"XYXY"},
            callback,
        )

        const deletedGame = await Game.findById(game._id)

       
        const remainingPlayers = await Player.find({
            _id:{ $in: game.players.map((player)=>player._id)}
        })

         expect(deletedGame).toBeNull();
         expect(remainingPlayers).toHaveLength(0);

        expect(io.emit).toHaveBeenCalledWith("game:closed", {
            message: "This game room has been closed",
        });
        expect(io.to).toHaveBeenCalledWith("game:XYXY");

        expect(callback).toHaveBeenCalledWith({ok:true})

    })
     test("does not delete gam if the game has not ended", async ()=>{
        const hostPlayer = await Player.create({display_name: "Batman", is_connected:true});
        

        const game = await Game.create(
                {
                    players:[hostPlayer._id],
                    game_host:hostPlayer._id,
                    current_player: hostPlayer._id,
                    join_code:"PDYE",
                    phase:"lobby",
                    
                });

        await handleDeleteGame(
            io,
            socket,
            {join_code:"PDYE"},
            callback,
        )

        const exisitingGame = await Game.findById(game._id);
        const exisitingPlayer = await Player.findById(hostPlayer._id);

        expect(exisitingGame).not.toBeNull();
        expect(exisitingPlayer).not.toBeNull();
         expect(callback).toHaveBeenCalledWith({
            ok:false,
            error:"Game is still in play",
         })

         expect(io.to).not.toHaveBeenCalled();
          expect(io.to).not.toHaveBeenCalled();



     })


})
