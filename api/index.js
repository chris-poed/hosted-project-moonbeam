const express = require("express");
const { createServer } = require('node:http'); 
require("dotenv").config();
const cors = require("cors");
const { Server } = require("socket.io");
const { connectToDatabase } = require("./db/db.js");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const registerCreateGameHandlers = require("./sockets/createGameHandlers.js")

const onConnection = (socket) => {
  console.log(socket.id, '<---socket.id')
  registerCreateGameHandlers(io, socket)
}

io.on("connection", onConnection);

function listenForRequests() {
  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log("Now listening on port", port);
  });
}

connectToDatabase().then(() => {
  listenForRequests();
});
