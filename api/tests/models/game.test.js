require("../mongodb_helper");

const Game = require("../../models/game.js");

describe("Game model", async () => {
  beforeEach(async () => {
    await Game.deleteMany({});
  });

  it("lists an array of players", () => {
    
  })
});