const Game = require("../models/game")
const mongoose = require("mongoose");

// this helper should be used as the payload in socket.emit to update players on the current state of the game.



// Phases during which song details must be hidden from client
// Players can hear the preview but must not see title, artist or year
// until the reveal phase.
const HIDING_PHASES = [
  "intro-countdown",
  "listening-placement-phase",
  "placement-ended",
]


async function getGameStatePayload(join_code) {
    try {
        if (!join_code) {
        throw new Error("join_code is required");
        }

        const game = await Game.findOne({ join_code })
        .populate({
            path: "players",
            select: "display_name timeline is_connected",
        })
        .populate({
            path: "current_player",
            select: "display_name",
        })
        .populate({
            path: "songs",
            select: "title artist year previewUrl"
        })
        .lean(); // .lean sends a js object rather than mongoose object - which is ok for a payload being sent through socket.io but will mean you can't perform the same mongoose methods on it like .save etc

        if (!game) {
        return null;
        }


        const currentSong = game.songs?.[0] ?? null
        let current_song = null

        if (currentSong){
            const shouldHide = HIDING_PHASES.includes(game.phase)

            current_song = shouldHide ? {
                id: currentSong._id.toString(),
                previewUrl: currentSong.previewUrl,
            }
           :{
            id: currentSong._id.toString(),
            previewUrl: currentSong.previewUrl,
            title: currentSong.title,
            artist: currentSong.artist,
            year: currentSong.year,
           } 
        
        }

        console.log('[getGameStatePayload] phase:', game.phase, '| current_song:', current_song)
        return {
            id: game._id.toString(),
            join_code: game.join_code,
            host_player_id: game.game_host.toString(),
            phase: game.phase,
            current_player: {
                player_id: game.current_player._id.toString(),
                display_name: game.current_player.display_name,
            },
            round_no: game.round_no,
            current_song,
            players: game.players.map((player) => ({
                player_id: player._id.toString(),
                display_name: player.display_name,
                is_connected: player.is_connected,
                timeline: player.timeline || [],
        })),
        };
    } catch (error) {
        console.log(error, "error getting game state payload");
        throw error;
    }
}

module.exports = getGameStatePayload;
