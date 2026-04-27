import { useEffect } from "react";
import { socket } from "../socket";
import CountdownTimer from "../components/CountdownTimer";

export function TimerTest() {

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleStart = () => {};
    const handleTick = () => {};
    const handleEnd = () => {};

    socket.on('timer:start', handleStart);
    socket.on('timer:tick', handleTick);
    socket.on('timer:end', handleEnd);

    return () => {
      socket.off('timer:start', handleStart);
      socket.off('timer:tick', handleTick);
      socket.off('timer:end', handleEnd);
    };
  }, []);

  return (
    <div>
      <h1>Timer Test</h1>

      <CountdownTimer
        roomId="game:TEST"
        label="Test Timer"
        size="lg"
      />

      <button
        onClick={() => {
          socket.emit('timer:request_start', {
            roomId: 'game:TEST',
            phase: 'placement'
          });
        }}
      >
        Start Timer
      </button>
    </div>
  );
}