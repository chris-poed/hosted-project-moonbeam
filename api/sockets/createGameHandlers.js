const handleCreateGame = require("./handleCreateGame");
const handleJoinGame = require("./handleJoinGame");
const handleStartGame = require("./handleStartGame");
const handleSubmitPlacement = require("./handleSubmitPlacement");
const handleDeleteGame = require("./handleDeleteGame");


const registerCreateGameHandlers = (io, socket) => {
   
    socket.on("game:create", async (payload, callback) => {
        await handleCreateGame(io, socket, payload, callback);
    });
    
     socket.on("game:join", async (payload, callback) => {
        await handleJoinGame(io, socket, payload, callback);
    });

    socket.on("game:start", async (payload, callback) => {
       await handleStartGame(io, socket, payload, callback)
    });

     socket.on("placement:submit", async (payload, callback) => {
        await handleSubmitPlacement(io, socket, payload, callback)
    })

    socket.on("game:delete", async (payload, callback)=>{
        console.log("INSIDE GAME:DELETE------>>")
        await handleDeleteGame(io, socket, payload, callback);
    })


    
}

module.exports = registerCreateGameHandlers