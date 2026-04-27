const timerService = require('../sockets/gameTimer');

const PHASE_DURATIONS = {
  countdown: 3,
  listening: 30,
};

function registerTimerEvents(io, socket) {
  socket.on('timer:request_start', ({ roomId, phase, duration }) => {
    if (!roomId) return;

    socket.join(roomId);

    const seconds = duration ?? PHASE_DURATIONS[phase] ?? 30;

    const onExpire = (io, roomId) => {
      io.to(roomId).emit('game:phase_expired', { roomId, phase });
    };

    timerService.startTimer(io, roomId, seconds, onExpire);
  });

  socket.on('timer:request_stop', ({ roomId }) => {
    if (!roomId) return;
    timerService.stopTimer(roomId, io);
  });
}

module.exports = { registerTimerEvents, PHASE_DURATIONS };