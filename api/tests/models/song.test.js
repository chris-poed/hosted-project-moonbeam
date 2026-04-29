require("../mongodb_helper");

const Song = require("../../models/song.js");

describe("Song model", () => {
  beforeEach(async () => {
    await Song.deleteMany({});
  });

  it("has a valid artist", () => {
    const song = new Song({
      artist: "Smash Mouth",
      title: "All Star",
      year: 1999,
      previewUrl: "https://music.apple.com"
    });
    expect(song.artist).toEqual("Smash Mouth");
  });

  it("has a valid title", () => {
    const song = new Song({
      artist: "Smash Mouth",
      title: "All Star",
      year: 1999,
      previewUrl: "https://music.apple.com"
    });
    expect(song.title).toEqual("All Star");
  });

  it("has a valid year", () => {
    const song = new Song({
      artist: "Smash Mouth",
      title: "All Star",
      year: 1999,
      previewUrl: "https://music.apple.com"
    });
    expect(song.year).toEqual(1999);
  });

  it("has a valid url", () => {
    const song = new Song({
      artist: "Smash Mouth",
      title: "All Star",
      year: 1999,
      previewUrl: "https://music.apple.com"
    });
    expect(song.previewUrl).toContain("https://");
  });
});
