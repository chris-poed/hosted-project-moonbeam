require("../mongodb_helper");
const mongoose = require("mongoose");
const handleStartGame = require("../../sockets/handleStartGame");
const Game = require("../../models/game");
const Player = require("../../models/player");

describe("handleStartGame", () => {
    let io;
    let socket;
    let callback;

    beforeEach(() => {
        socket = {};

        io = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        };

        callback = jest.fn();
    });

    afterEach(async () => {
        jest.restoreAllMocks();

        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    });

    test("returns an error if the game join code is missing", async () => {
        await handleStartGame(
            io,
            socket,
            { player_id: "some-player-id" },
            callback
        );

        expect(callback).toHaveBeenCalledWith({
            ok: false,
            error: "Game not found",
        });

        expect(io.to).not.toHaveBeenCalled();
        expect(io.emit).not.toHaveBeenCalled();
    });

    test("returns an error if game is not found", async () => {
        await handleStartGame(
            io,
            socket,
            {
                player_id: new mongoose.Types.ObjectId().toString(),
                join_code: "XXXX",
            },
            callback
        );

        expect(callback).toHaveBeenCalledWith({
            ok: false,
            error: "Game not found",
        });

        expect(io.to).not.toHaveBeenCalled();
        expect(io.emit).not.toHaveBeenCalled();
    });

    test("returns an error if the player is not the host", async () => {
        const hostPlayer = await Player.create({
            display_name: "Edmund",
            is_connected: true,
        });

        const secondPlayer = await Player.create({
            display_name: "Baldrick",
            is_connected: true,
        });

        await Game.create({
            players: [hostPlayer._id, secondPlayer._id],
            game_host: hostPlayer._id,
            current_player: hostPlayer._id,
            join_code: "ABCD",
            phase: "lobby",
        });

        await handleStartGame(
            io,
            socket,
            {
                player_id: secondPlayer._id.toString(),
                join_code: "ABCD",
            },
            callback
        );

        expect(callback).toHaveBeenCalledWith({
            ok: false,
            error: "Only the host can start the game",
        });

        expect(io.to).not.toHaveBeenCalled();
        expect(io.emit).not.toHaveBeenCalled();
    });

    test("returns an error if there is only one player in the game", async () => {
        const hostPlayer = await Player.create({
            display_name: "Queenie",
            is_connected: true,
        });

        await Game.create({
            players: [hostPlayer._id],
            game_host: hostPlayer._id,
            current_player: hostPlayer._id,
            join_code: "ONE1",
            phase: "lobby",
        });

        await handleStartGame(
            io,
            socket,
            {
                player_id: hostPlayer._id.toString(),
                join_code: "ONE1",
            },
            callback
        );

        expect(callback).toHaveBeenCalledWith({
            ok: false,
            error: "2 players or more are needed to start the game",
        });

        expect(io.to).not.toHaveBeenCalled();
        expect(io.emit).not.toHaveBeenCalled();
    });

    test("returns an error if the game has already started", async () => {
        const hostPlayer = await Player.create({
            display_name: "Melchett",
            is_connected: true,
        });

        const secondPlayer = await Player.create({
            display_name: "Flashheart",
            is_connected: true,
        });

        await Game.create({
            players: [hostPlayer._id, secondPlayer._id],
            game_host: hostPlayer._id,
            current_player: hostPlayer._id,
            join_code: "STRT",
            phase: "listening-placement-phase",
        });

        await handleStartGame(
            io,
            socket,
            {
                player_id: hostPlayer._id.toString(),
                join_code: "STRT",
            },
            callback
        );

        expect(callback).toHaveBeenCalledWith({
            ok: false,
            error: "Game has already started",
        });

        expect(io.to).not.toHaveBeenCalled();
        expect(io.emit).not.toHaveBeenCalled();
    });

    test("updates the game phase, round number and current player when host starts the game", async () => {
        const hostPlayer = await Player.create({
            display_name: "Nursie",
            is_connected: true,
        });

        const secondPlayer = await Player.create({
            display_name: "Percy",
            is_connected: true,
        });

        const game = await Game.create({
            players: [hostPlayer._id, secondPlayer._id],
            game_host: hostPlayer._id,
            current_player: hostPlayer._id,
            join_code: "GAME",
            phase: "lobby",
        });

        jest.spyOn(Math, "random").mockReturnValue(0.99);

        await handleStartGame(
            io,
            socket,
            {
                player_id: hostPlayer._id.toString(),
                join_code: "GAME",
            },
            callback
        );

        const updatedGame = await Game.findById(game._id);

        expect(updatedGame.phase).toBe("listening-placement-phase");
        expect(updatedGame.round_no).toBe(1);
        expect(updatedGame.current_player.toString()).toBe(secondPlayer._id.toString());

        expect(callback).toHaveBeenCalledWith({
            ok: true,
        });
    });

    test("emits game:started to all players in the socket room with the updated game state", async () => {
        const hostPlayer = await Player.create({
            display_name: "Blackadder",
            is_connected: true,
        });

        const secondPlayer = await Player.create({
            display_name: "Baldrick",
            is_connected: true,
        });

        const game = await Game.create({
            players: [hostPlayer._id, secondPlayer._id],
            game_host: hostPlayer._id,
            current_player: hostPlayer._id,
            join_code: "ROOM",
            phase: "lobby",
        });

        jest.spyOn(Math, "random").mockReturnValue(0);

        await handleStartGame(
            io,
            socket,
            {
                player_id: hostPlayer._id.toString(),
                join_code: "ROOM",
            },
            callback
        );

        expect(io.to).toHaveBeenCalledWith("game:ROOM");

        expect(io.emit).toHaveBeenCalledWith(
            "game:started",
            expect.objectContaining({
                id: game._id.toString(),
                join_code: "ROOM",
                host_player_id: hostPlayer._id.toString(),
                phase: "listening-placement-phase",
                round_no: 1,
                players: expect.arrayContaining([
                    expect.objectContaining({
                        player_id: hostPlayer._id.toString(),
                        display_name: "Blackadder",
                        is_connected: true,
                    }),
                    expect.objectContaining({
                        player_id: secondPlayer._id.toString(),
                        display_name: "Baldrick",
                        is_connected: true,
                    }),
                ]),
            })
        );

        expect(callback).toHaveBeenCalledWith({
            ok: true,
        });
    });

    test("returns an error if a database error occurs", async () => {
        const hostPlayer = await Player.create({
            display_name: "George",
            is_connected: true,
        });

        const secondPlayer = await Player.create({
            display_name: "Bob",
            is_connected: true,
        });

        await Game.create({
            players: [hostPlayer._id, secondPlayer._id],
            game_host: hostPlayer._id,
            current_player: hostPlayer._id,
            join_code: "FAIL",
            phase: "lobby",
        });

        jest.spyOn(Game, "findOneAndUpdate").mockRejectedValueOnce(
            new Error("Database error")
        );

        await handleStartGame(
            io,
            socket,
            {
                player_id: hostPlayer._id.toString(),
                join_code: "FAIL",
            },
            callback
        );

        expect(callback).toHaveBeenCalledWith({
            ok: false,
            error: "Start Game failed",
        });

        expect(io.emit).not.toHaveBeenCalled();
    });
});