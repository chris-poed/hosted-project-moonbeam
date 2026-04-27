import { useEffect, useRef } from 'react';
import { useGameCountdown } from './useGameCountdown';
import './CountdownTimer.css';
import { socket } from '../socket.js';

const SIZE_MAP = {
  sm: { ring: 64,  stroke: 5,  fontSize: '1.1rem' },
  md: { ring: 96,  stroke: 7,  fontSize: '1.6rem' },
  lg: { ring: 128, stroke: 9,  fontSize: '2rem'   },
};

export default function CountdownTimer({ roomId, onEnd, label, size = 'md' }) {
  const { remaining, isRunning, duration } = useGameCountdown(socket, roomId);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    if (remaining === 0 && !isRunning && typeof onEndRef.current === 'function') {
      onEndRef.current();
    }
  }, [remaining, isRunning]);

  const cfg = SIZE_MAP[size] ?? SIZE_MAP.md;
  const r = (cfg.ring / 2) - cfg.stroke;
  const circumference = 2 * Math.PI * r;
  const progress = duration > 0 ? remaining / duration : 1;
  const dashOffset = circumference * (1 - progress);

  const urgency =
    remaining <= 5 ? 'urgent' :
    remaining <= 10 ? 'warning' :
    'calm';

  if (!isRunning && remaining === 0) return null;

  return (
    <div className={`countdown-timer countdown-timer--${size} countdown-timer--${urgency}`}
         role="timer"
         aria-label={`${remaining} seconds remaining`}
         aria-live="polite">

      {label && <p className="countdown-timer__label">{label}</p>}

      <div className="countdown-timer__ring-wrapper">
        <svg
          width={cfg.ring}
          height={cfg.ring}
          viewBox={`0 0 ${cfg.ring} ${cfg.ring}`}
          aria-hidden="true">

          <circle
            className="countdown-timer__track"
            cx={cfg.ring / 2}
            cy={cfg.ring / 2}
            r={r}
            fill="none"
            strokeWidth={cfg.stroke}
          />

          <circle
            className="countdown-timer__arc"
            cx={cfg.ring / 2}
            cy={cfg.ring / 2}
            r={r}
            fill="none"
            strokeWidth={cfg.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s ease' }}
            transform={`rotate(-90 ${cfg.ring / 2} ${cfg.ring / 2})`}
          />
        </svg>

        <span className="countdown-timer__number" style={{ fontSize: cfg.fontSize }}>
          {remaining}
        </span>
      </div>
    </div>
  );
}