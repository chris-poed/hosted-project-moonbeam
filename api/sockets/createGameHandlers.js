const handleCreateGame = require("./handleCreateGame")

const registerCreateGameHandlers = (io, socket) => {
    console.log('registerCreateGameHandlers')
    socket.on("game:create", async (payload, callback) => {
        await handleCreateGame(io, socket, payload, callback);
    });


    
    //Add additionally handlers here
}

module.exports = registerCreateGameHandlers