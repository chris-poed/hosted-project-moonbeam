require("../mongodb_helper")
const mongoose = require("mongoose");
const handleCreateGame = require("../../sockets/handleCreateGame")
const Game = require("../../models/game");
const Player = require("../../models/player");

describe("handleCreateGame", ()=>{

    beforeEach(()=>{
        io = {};
        socket ={
            join:jest.fn(),
        };

     callback = jest.fn()
    })

    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for(const key in collections){
            await collections[key].deleteMany({})
        }
    })

    test("player and game are created with a given display name", async ()=>{
        const payload = {
            display_name: "Bob"
        };

        await handleCreateGame(io, socket, payload, callback);
        const players = await Player.find();
        const games = await Game.find();

        

        expect(players).toHaveLength(1);
        expect(games).toHaveLength(1);

        const player = players[0];
        const game = games[0];

        expect(player.display_name).toBe("Bob");
        expect(player.is_connected).toBe(true);
        
        //need to serialise strings using toString
        expect(game.players[0].toString()).toBe(player._id.toString());
        expect(game.game_host.toString()).toBe(player._id.toString());
        expect(game.current_player.toString()).toBe(player._id.toString());
        expect(typeof game.join_code).toBe("string");
        expect(game.join_code).toHaveLength(4);
        expect(game.join_code).toMatch(/^[A-Z0-9]{4}$/)
        expect(game.songs).toEqual([]);

        //test socket is called with game code
        expect(socket.join).toHaveBeenCalledWith(`game:${game.join_code}`)
        const data = {
            ok:true,
            game_id:game._id.toString(),
            join_code:game.join_code,
            player_id: player._id.toString(),
        }
        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({
            ok:true,
            game_id:game._id.toString(),
            join_code:game.join_code,
            player_id: player._id.toString(),
            })
        )
    })

    test("returns lobby data after creating the game", async () => {
        const payload = {
            display_name: "Asta"
        };

        await handleCreateGame(io, socket, payload, callback);

        const player = await Player.findOne({display_name: "Asta"});
        const game = await Game.findOne({game_host:player._id});

        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({
            ok:true,
            lobby:{game_id:game._id.toString(),
            join_code:game.join_code,
            game_host: player._id.toString(),
            players: [
                {
                    player_id:player._id.toString(),
                    display_name: "Asta",
                    is_connected:true,
                },
             ],
             phase:game.phase,
            },
        })
    )
    })

    test("player not added to room and error is returned if display_name is missing", async ()=>{
        const payload = {};

         await handleCreateGame(io, socket, payload, callback);

        const players = await Player.find();
        const games = await Game.find();

        //player should not be added to the room sincev alidation failed
        expect(socket.join).not.toHaveBeenCalled();

        expect(callback).toHaveBeenCalledWith({
            ok:false,
            error: "Enter a display name",
        })

    })

    test("player is added to only one room and callback called once", async ()=>{
        await handleCreateGame(io, socket, {display_name: "Athina"}, callback);
         expect(socket.join).toHaveBeenCalledTimes(1);
         expect(callback).toHaveBeenCalledTimes(1);
    })

    test("returns an error if display_name contains only  white space", async ()=>{
        

         await handleCreateGame(io, socket, {display_name: "   "}, callback);

        expect(callback).toHaveBeenCalledWith({
            ok:false,
            error: "Enter a display name",
        })

    })

    test("display name is trimmed before saving", async ()=>{

         await handleCreateGame(io, socket, {display_name: "  Asta  "}, callback);

        const player = await Player.findOne();

        expect(player.display_name).toBe("Asta");

    })


    //Test response for database error - use mockvalue as error response fron DB
        test("returns an error if database error occurs", async ()=>{
             

            jest.spyOn(Player, "create").mockRejectedValueOnce( new Error("Database error"));

            await handleCreateGame(
                io,
                socket,
                {display_name:"Melchett"},
                callback
            );

            expect(callback).toHaveBeenCalledWith({
                ok:false,
                error: "Create Game failed",
            });

            expect(socket.join).not.toHaveBeenCalled();
            //remove mock from Player.create functions
            Player.create.mockRestore();

        })

    

});
