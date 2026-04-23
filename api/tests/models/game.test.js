require("../mongodb_helper");
const mongoose = require("mongoose");

const Game = require("../../models/game.js");
const Player = require("../../models/player.js");
const Song = require("../../models/song.js");

describe("Game model", () => {
  beforeEach(async () => {
    await Game.deleteMany({});
    await Player.deleteMany({});
    await Song.deleteMany({});
  });

  it("lists an array of players", async () => {
    const player = await Player.create({ 
      display_name: "breenius",
      timeline: [],
      is_connected: true
    });

    const game = await Game.create({
      players: [player._id],
      game_host: player._id,
      current_player: player._id,
      phase: "listening-placement-phase",
      round_no: 1,
      join_code: "123",
      songs: [new mongoose.Types.ObjectId()]
    });

    const populated = await Game.findById(game._id).populate("players");

    expect(populated.players[0].display_name).toBe("breenius");
  });


  it("identifies the correct game host", async () => {
    const player1 = await Player.create({ 
      display_name: "breenius",
      timeline: [],
      is_connected: true
    }); 

    const player2 = await Player.create({ 
      display_name: "lisa",
      timeline: [],
      is_connected: true
    }); 

    const game = await Game.create({
      players: [player1._id, player2._id],
      game_host: player1._id,
      current_player: player2._id,
      phase: "listening-placement-phase",
      round_no: 1,
      join_code: "123",
      songs: [new mongoose.Types.ObjectId()]
    });

    const populatedPlayers = await Game.findById(game._id).populate("players");
    const populatedGameHost = await Game.findById(game._id).populate("game_host");

    expect(populatedPlayers.players.length).toBe(2);
    expect(populatedGameHost.game_host.display_name).toBe("breenius");    
  })

  it("identifies the correct current player", async () => {
    const player1 = await Player.create({ 
      display_name: "breenius",
      timeline: [],
      is_connected: true
    }); 

    const player2 = await Player.create({ 
      display_name: "lisa",
      timeline: [],
      is_connected: true
    }); 

    const game = await Game.create({
      players: [player1._id, player2._id],
      game_host: player1._id,
      current_player: player2._id,
      phase: "listening-placement-phase",
      round_no: 1,
      join_code: "123",
      songs: [new mongoose.Types.ObjectId()]
    });

    const populatedPlayers = await Game.findById(game._id).populate("players");
    const populatedCurrentPlayer = await Game.findById(game._id).populate("current_player");

    expect(populatedPlayers.players.length).toBe(2);
    expect(populatedCurrentPlayer.current_player.display_name).toBe("lisa");    
  })

  it("identifies the correct phase", async () => {
    
    const playerId = new mongoose.Types.ObjectId();

    const game = await Game.create({
      players: [playerId],
      game_host: playerId,
      current_player: playerId,
      phase: "reveal-phase",
      round_no: 1,
      join_code: "123",
      songs: [new mongoose.Types.ObjectId()]
    });

    expect(game.phase).toBe("reveal-phase");    
  })

  it("identifies the correct round number", async () => {
    const playerId = new mongoose.Types.ObjectId();

    const game = await Game.create({
      players: [playerId],
      game_host: playerId,
      current_player: playerId,
      phase: "reveal-phase",
      round_no: 1,
      join_code: "123",
      songs: [new mongoose.Types.ObjectId()]
    });

    expect(game.round_no).toBe(1);   
  });

  it("holds a join code", async () => {
    const playerId = new mongoose.Types.ObjectId();

    const game = await Game.create({
      players: [playerId],
      game_host: playerId,
      current_player: playerId,
      phase: "reveal-phase",
      round_no: 1,
      join_code: "123",
      songs: [new mongoose.Types.ObjectId()]
    });

    expect(game.join_code).toBe("123"); 
  });

  it("lists an array of songs", async () => {
    const song1 = await Song.create({ 
      artist: "Electric Callboy",
      title: "Tekkno Train",
      year: 2022,
      url: "https://test.com"
    });

    const song2 = await Song.create({ 
      artist: "Babymetal",
      title: "METALI!!",
      year: 2023,
      url: "https://test.com"
    });

    const playerId = new mongoose.Types.ObjectId();

    const game = await Game.create({
      players: [playerId],
      game_host: playerId,
      current_player: playerId,
      phase: "reveal-phase",
      round_no: 1,
      join_code: "123",
      songs: [song1, song2]
    });

    const populated = await Game.findById(game._id).populate("songs");

    expect(populated.songs.length).toBe(2);
    expect(populated.songs[0].title).toBe("Tekkno Train");
  });

  it("fails when game host is missing", async () => { // doesn't work for arrays as simple removal is treated as empty array which works for required true
    const objectId = new mongoose.Types.ObjectId();

    const game = new Game({
      players: [objectId],
      current_player: objectId,
      phase: "reveal-phase",
      round_no: 1,
      join_code: "123",
      songs: [objectId]
    });

    try {
      await game.save();
      throw new Error("Test should have failed");
      console.log(game);
    } catch (err) {
      expect(err.name).toBe("ValidationError");
      expect(err.errors.game_host).toBeDefined();
      expect(err.errors.game_host.kind).toBe("required");
    }
  })
});