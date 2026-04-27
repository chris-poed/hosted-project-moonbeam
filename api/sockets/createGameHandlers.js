const handleCreateGame = require("./handleCreateGame")
const handleJoinGame = require("./handleJoinGame")
const handleStartGame = require("./handleStartGame")

const registerCreateGameHandlers = (io, socket) => {
   
    socket.on("game:create", async (payload, callback) => {
        await handleCreateGame(io, socket, payload, callback);
    });
    
     socket.on("game:join", async (payload, callback) => {
        await handleJoinGame(io, socket, payload, callback);
    });

    socket.on("game:start", async (payload, callback) => {
        console.log("SERVER: inside game:start handler", payload);
        await handleStartGame(io, socket, payload, callback)
    })


    
    //Add additional handlers here
}

module.exports = registerCreateGameHandlers