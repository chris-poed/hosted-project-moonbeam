const Game = require("../models/game")

function createGame(req, res) {
    const game_host = req.body.game_host;
    const songs = req.body.songs;
    const players = req.body.players;
    const phase = req.body.phase;
    const current_player = req.body.current_player;
    const round_no = req.body.round_no;
    const join_code = req.body.join_code;

    const game = new Game({
        game_host,
        songs,
        players,
        phase,
        current_player,
        round_no,
        join_code,
    });

    game
        .save()
        .then((game) => {
        res.status(201).json({ message: "OK", game });
        })
        .catch((err) => {
        console.error(err);
        res.status(400).json({ message: "Something went wrong" });
        });
    }

    const GamesController = {
    createGame: createGame,
    };

module.exports = GamesController;