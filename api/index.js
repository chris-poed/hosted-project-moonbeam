const express = require("express");
const { createServer } = require('node:http'); 
require("dotenv").config();
const cors = require("cors");
const { Server } = require("socket.io");
const { connectToDatabase } = require("./db/db.js");
const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

const registerCreateGameHandlers = require("./sockets/createGameHandlers.js")

const onConnection = (socket) => {
  console.log(socket.id, '<---socket.id')
  registerCreateGameHandlers(io, socket)
}

io.on("connection", onConnection);

function listenForRequests() {
  const port = process.env.PORT || 3000;

  httpServer.listen(port, "0.0.0.0", () => {
    console.log("Now listening on port", port);
  });
}

connectToDatabase().then(() => {
  listenForRequests();
});
