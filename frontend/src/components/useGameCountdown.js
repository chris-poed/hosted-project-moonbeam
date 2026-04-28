import { useState, useEffect, useRef } from 'react';

export function useGameCountdown(socket, roomId) {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [endsAt, setEndsAt] = useState(null);
  const endsAtRef = useRef(null);

 //onstart payload from gametimer.js called inside handleStartGame.js (Backend)

  useEffect(() => {
    if (!socket || !roomId) return;

    function onTimerStart({ remaining: r, duration: d, endsAt: e }) {
      setRemaining(r);
      setDuration(d);
      setEndsAt(e);
      setIsRunning(true);
      endsAtRef.current = e;
    }

    function onTimerTick({ remaining: r, endsAt: e }) {
      const clientCalc = Math.max(0, Math.round((e - Date.now()) / 1000));
      const corrected = Math.abs(r - clientCalc) > 1 ? clientCalc : r;
      setRemaining(corrected);
    }

    function resetTimer() {
      setRemaining(0);
      setIsRunning(false);
      setEndsAt(null);
      endsAtRef.current = null;
    }

    socket.on('timer:start', onTimerStart);
    socket.on('timer:tick', onTimerTick);
    socket.on('timer:end', resetTimer);
    socket.on('timer:stop', resetTimer);

    return () => {
      socket.off('timer:start', onTimerStart);
      socket.off('timer:tick', onTimerTick);
      socket.off('timer:end', resetTimer);
      socket.off('timer:stop', resetTimer);
    };
  }, [socket, roomId]);

  return { remaining, isRunning, duration, endsAt };
}