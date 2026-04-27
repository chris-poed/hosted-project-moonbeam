const activeTimers = new Map();

function startTimer(io, roomId, durationSeconds, onExpire) {
  stopTimer(roomId);

  let remaining = durationSeconds;
  const startedAt = Date.now();
  const endsAt = startedAt + durationSeconds * 1000;

  io.to(roomId).emit('timer:start', {
    roomId,
    duration: durationSeconds,
    remaining,
    endsAt,
  });

  const interval = setInterval(() => {
    remaining -= 1;

    if (remaining <= 0) {
      clearInterval(interval);
      activeTimers.delete(roomId);
      io.to(roomId).emit('timer:end', { roomId });
      if (typeof onExpire === 'function') {
        onExpire(io, roomId);
      }
      return;
    }

    io.to(roomId).emit('timer:tick', { roomId, remaining, endsAt });
  }, 1000);

  activeTimers.set(roomId, interval);
}

function stopTimer(roomId, io) {
  const interval = activeTimers.get(roomId);
  if (interval) {
    clearInterval(interval);
    activeTimers.delete(roomId);
  }
  if (io) {
    io.to(roomId).emit('timer:stop', { roomId });
  }
}

function isRunning(roomId) {
  return activeTimers.has(roomId);
}

function activeCount() {
  return activeTimers.size;
}

module.exports = { startTimer, stopTimer, isRunning, activeCount };