require("../mongodb_helper");

const Player = require("../../models/player.js");

describe("Player model", () => {
  beforeEach(async () => {
    await Player.deleteMany({});
  });

  it("has a display_name", () => {
    const player = new Player({
      display_name: "breenius",
      timeline: ["one", "two"],
      is_connected: false
    });
    expect(player.display_name).toEqual("breenius");
  });

  it("can have an empty timeline array", async () => {
    const player = new Player({
      display_name: "breenius",
      timeline: [],
      is_connected: false
    });
    expect(player.timeline).toEqual([]);
  });

  it("can have a timeline array with one item", async () => {
    const player = new Player({
      display_name: "breenius",
      timeline: ["one"],
      is_connected: false
    });
    expect(player.timeline).toEqual(["one"]);
  });

  it("can have a timeline array with more than one item", async () => {
    const player = new Player({
      display_name: "breenius",
      timeline: ["one", "two", "three"],
      is_connected: false
    });
    expect(player.timeline).toEqual(["one", "two", "three"]);
  });

  it("contains information whether the player is connected", async () => {
    const player1 = new Player({
      display_name: "breenius",
      timeline: ["one", "two", "three"],
      is_connected: false
    });

    expect(player1.is_connected).toEqual(false);
  });
});