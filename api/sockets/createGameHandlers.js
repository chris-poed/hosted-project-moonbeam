const handleCreateGame = require("./handleCreateGame")
const handleJoinGame = require("./handleJoinGame")

const registerCreateGameHandlers = (io, socket) => {
    console.log('registerCreateGameHandlers')
    socket.on("game:create", async (payload, callback) => {
        await handleCreateGame(io, socket, payload, callback);
    });
    console.log("GAME:JOIN HANDLERS");
     socket.on("game:join", async (payload, callback) => {
        console.log("GAME:JOIN HANDLERS2");
        await handleJoinGame(io, socket, payload, callback);
    });


    
    //Add additional handlers here
}

module.exports = registerCreateGameHandlers