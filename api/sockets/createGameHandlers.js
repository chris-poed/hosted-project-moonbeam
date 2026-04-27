const handleCreateGame = require("./handleCreateGame")
const handleJoinGame = require("./handleJoinGame")

const registerCreateGameHandlers = (io, socket) => {
   
    socket.on("game:create", async (payload, callback) => {
        await handleCreateGame(io, socket, payload, callback);
    });
    
     socket.on("game:join", async (payload, callback) => {
        await handleJoinGame(io, socket, payload, callback);
    });


    
    //Add additional handlers here
}

module.exports = registerCreateGameHandlers