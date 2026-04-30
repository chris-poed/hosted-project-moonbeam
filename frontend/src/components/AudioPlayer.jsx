import { useEffect, useRef, useState } from "react";
import "./AudioPlayer.css";

function AudioPlayer({ previewUrl, remaining, duration }) {
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const AUDIO_DURATION = 30;

  const [fillWidth, setFillWidth] = useState(0);
  const [elapsed, setElapsed] = useState("0:00");
  const [label, setLabel] = useState("Loading...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("playerVolume");
    return saved !== null ? parseFloat(saved) : 0.75;
  });

  function fmt(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + s.toString().padStart(2, "0");
  }

  function end(audio) {
    audio.pause();
    clearTimeout(timerRef.current);
    setFillWidth(100);
    setElapsed("0:30");
    setLabel("Preview ended");
    setIsPlaying(false);
  }

  // Sync progress bar to server countdown
  useEffect(() => {
    if (!duration || remaining === undefined) return;
    const elapsedSeconds = duration - remaining;
    setFillWidth((elapsedSeconds / AUDIO_DURATION) * 100);
    setElapsed(fmt(elapsedSeconds));
  }, [remaining, duration]);

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }

  function handleVolumeChange(e) {
    const val = parseFloat(e.target.value);
    setVolume(val);
    localStorage.setItem("playerVolume", val);
    
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        audioRef.current.muted = true;
        setIsMuted(true);
      } else {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  }

  useEffect(() => {
    if (!previewUrl) return;
    const audio = new Audio(previewUrl);
    audioRef.current = audio;
    audio.volume = volume;

    setFillWidth(0);
    setElapsed("0:00");
    setLabel("Loading...");
    setIsPlaying(false);

    function onCanPlay() {
      setLabel("30s preview");
      audio.play().catch(function () {
        setLabel("Click to play");
        document.addEventListener("click", function () {
          if (audioRef.current) audioRef.current.play().catch(function () {});
        }, { once: true });
      });
    }

    function onPlay() {
      clearTimeout(timerRef.current);
      setIsPlaying(true);
      // Always cut audio at 30s regardless of server timer duration
      timerRef.current = setTimeout(() => end(audio), AUDIO_DURATION * 1000);
    }

    function onError() {
      setLabel("Preview unavailable");
    }

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("error", onError);

    return function () {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("error", onError);
      audio.pause();
      clearTimeout(timerRef.current);
    };
  }, [previewUrl]);

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
      <div className="music-player__controls">
        <button className="music-player__mute" onClick={toggleMute}>
          {isMuted ? "🔇" : "🔊"}
        </button>
        <input
          className="music-player__volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
        />
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
