import { useEffect, useRef, useState } from "react";
import "./AudioPlayer.css";

function AudioPlayer(props) {
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const DURATION = 30;

  const [fillWidth, setFillWidth] = useState(0);
  const [elapsed, setElapsed] = useState("0:00");
  const [label, setLabel] = useState("Loading...");
  const [isPlaying, setIsPlaying] = useState(false);

  function fmt(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + s.toString().padStart(2, "0");
  }

  function end() {
    if (audioRef.current) audioRef.current.pause();
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
    setFillWidth(100);
    setElapsed("0:30");
    setLabel("Preview ended");
    setIsPlaying(false);
  }

  function tick() {
    const current = Math.min(audioRef.current ? audioRef.current.currentTime : 0, DURATION);
    setFillWidth((current / DURATION) * 100);
    setElapsed(fmt(current));
    if (current < DURATION) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      end();
    }
  }

  useEffect(() => {
    const audio = new Audio(props.previewUrl);
    audioRef.current = audio;
    audio.volume = 0.85;

    setFillWidth(0);
    setElapsed("0:00");
    setLabel("Loading...");
    setIsPlaying(false);

    audio.addEventListener("canplay", function () {
      setLabel("30s preview");
      audio.play().catch(function () {
        setLabel("Click to play");
        document.addEventListener("click", function () {
          if (audioRef.current) audioRef.current.play().catch(function () {});
        }, { once: true });
      });
    });

    audio.addEventListener("play", function () {
      setIsPlaying(true);
      timerRef.current = setTimeout(end, DURATION * 1000);
      tick();
    });

    audio.addEventListener("error", function () {
      setLabel("Preview unavailable");
    });

    return function () {
      audio.pause();
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [props.previewUrl]);

  return (
    <div className="music-player">
      <div className="music-player__track">
        <div className="music-player__fill" style={{ width: fillWidth + "%" }}></div>
      </div>
      <div className="music-player__times">
        <span>{elapsed}</span>
        <span className="music-player__label">{label}</span>
        <span>0:30</span>
      </div>
      <div className={`music-player__wave${isPlaying ? " music-player__wave--playing" : ""}`}>
        {Array.from({ length: 20 }, (_, i) => <span key={i}></span>)}
      </div>
      <div className={`equalizer${isPlaying ? " equalizer--playing" : ""}`}>
        <span></span><span></span><span></span>
      </div>
    </div>
  );
}

export default AudioPlayer;
