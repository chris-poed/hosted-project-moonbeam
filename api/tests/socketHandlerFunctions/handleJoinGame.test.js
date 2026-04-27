require("../mongodb_helper")
const mongoose = require("mongoose");
const handleJoinGame = require("../../sockets/handleJoinGame")
const Game = require("../../models/game");
const Player = require("../../models/player");


describe("handleJoinGame", ()=>{
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

        test("returns an error if the players diplays name is missing", async ()=>{
            await handleJoinGame(io, socket, {join_code: "ABCD"}, callback);

            expect(callback).toHaveBeenCalledWith({
                ok:false,
                error:"Enter a display name",
            });
        });
        test("returns an error if the game join code is missing", async ()=>{
            await handleJoinGame(io, socket, {display_name: "Bob"}, callback);

            expect(callback).toHaveBeenCalledWith({
                ok:false,
                error:"Enter a game pin",
            });
        });

        test("returns an error if game not found", async ()=>{
            await handleJoinGame(
                io,
                socket,
                {display_name:"BlackAdder", join_code:"XOXO"},
                callback
            );
            expect(callback).toHaveBeenCalledWith({
                 ok:false,
                error:"Game not found",
            })
        })

        test("returns an error if game has already started", async ()=>{
            const hostPlayer = await Player.create({display_name:"Queenie", is_connected:true})
            
            await Game.create(
                {
                    players:[hostPlayer._id],
                    game_host:hostPlayer._id,
                    current_player: hostPlayer._id,
                    join_code:"XYXY",
                    phase:"listening-placement-phase"
                });
                

            await handleJoinGame(
                io,
                socket,
                {display_name:"Baldrick", join_code:"XYXY"},
                callback
            );

            expect(callback).toHaveBeenCalledWith({
                 ok:false,
                error:"This game has already started",
            })
        })

        test("returns an error if maximum number of players reached during lobby phase", async ()=> {
            //create 4 players
            const players =[];

            for(let i = 0; i < 4; i++){
                players.push(await Player.create({display_name:`Player ${i+1}`, is_connected:true}));
            }
            await Game.create({
                players:players.map((player) => player._id),
                game_host:players[0]._id,
                current_player:players[0]._id,
                join_code:"ZOZO"
            })

             await handleJoinGame(
                io,
                socket,
                {display_name:"Baldrick", join_code:"ZOZO"},
                callback
            );

            expect(callback).toHaveBeenCalledWith({
                 ok:false,
                error:"This game is full",
            })

            const maxPlayers = await Player.find();
            expect(maxPlayers).toHaveLength(4);
        })

        test("adds a player to an exisiting game in lobby phase", async ()=>{
            const hostPlayer = await Player.create({display_name:"Nursie", is_connected:true})
            
            const game = await Game.create(
                {
                    players:[hostPlayer._id],
                    game_host:hostPlayer._id,
                    current_player: hostPlayer._id,
                    join_code:"XYXY",
                    
                });
                
            await handleJoinGame(
                io,
                socket,
                {display_name:"Flashheart", join_code:"XYXY"},
                callback
            );

            const updatedGame = await Game.findById(game._id).populate("players");

            expect(updatedGame.players).toHaveLength(2);

            //check player details are correct

            const joinedPlayer = updatedGame.players.find(
                (player) => player.display_name === "Flashheart"
            )

            expect(joinedPlayer).toBeDefined();
            expect(joinedPlayer.is_connected).toBe(true)

             expect(socket.join).toHaveBeenCalledWith("game:XYXY")

            //test socket io callback to player
            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({
                    ok:true,
                    player_id: joinedPlayer._id.toString(),
                    lobby: expect.objectContaining({
                        game_id:game._id.toString(),
                        join_code:"XYXY",
                        game_host:hostPlayer._id.toString(),
                        phase:"lobby",
                    }),
                })
            );
        });


        //broadcast to lobby after player joins
        test("update broadcast to players in the lobby with new player details", async()=>{
             const hostPlayer = await Player.create({display_name:"Percy", is_connected:true})
            
            const game = await Game.create(
                {
                    players:[hostPlayer._id],
                    game_host:hostPlayer._id,
                    current_player: hostPlayer._id,
                    join_code:"ZYZY",
                    
                });
                
            await handleJoinGame(
                io,
                socket,
                {display_name:"Melchett", join_code:"ZYZY"},
                callback
            );

            expect(io.to).toHaveBeenCalledWith("game:ZYZY")

            expect(io.emit).toHaveBeenCalledWith(
                "lobby:updated",
                expect.objectContaining({
                game_id: game._id.toString(),
                join_code: "ZYZY",
                game_host: hostPlayer._id.toString(),
                phase: "lobby",
                players: expect.arrayContaining([
                    expect.objectContaining({
                    display_name: "Percy",
                    is_connected: true,
                    }),
                    expect.objectContaining({
                    display_name: "Melchett",
                    is_connected: true,
                    }),
                ]),
                })
            );


        })

        //Test response for database error - use mockvalue as error response fron DB
        test("returns an error if database error occurs", async ()=>{
             const hostPlayer = await Player.create({display_name:"Edmund", is_connected:true})
            
            await Game.create(
            {
                players:[hostPlayer._id],
                game_host:hostPlayer._id,
                current_player: hostPlayer._id,
                join_code:"ABCD",
                
            });

            jest.spyOn(Player, "create").mockRejectedValueOnce( new Error("Database error"));

            await handleJoinGame(
                io,
                socket,
                {display_name:"Melchett", join_code:"ABCD"},
                callback
            );

            expect(callback).toHaveBeenCalledWith({
                ok:false,
                error: "Join Game failed",
            });

            expect(socket.join).not.toHaveBeenCalled();
            expect(io.emit).not.toHaveBeenCalled();
            //remove mock from Player.create functions
            Player.create.mockRestore();

        })


})