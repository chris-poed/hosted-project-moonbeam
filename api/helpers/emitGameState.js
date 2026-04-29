const getGameStatePayload = require("./getGameStatePayload");

async function emitGameState(io, join_code) {
  const updatedPayload = await getGameStatePayload(join_code);
  const roomName = `game:${join_code}`;

 const room = io.sockets.adapter.rooms.get(roomName);


  io.to(roomName).emit("game:phase_changed", updatedPayload);
  return updatedPayload;
}

module.exports = emitGameState;