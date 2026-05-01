import { useEffect, useRef, useState } from "react";
import "./AudioPlayer.css";

function AudioPlayer({ previewUrl, remaining, duration }) {
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const rafRef   = useRef(null);

  const AUDIO_DURATION = 30;

  const [fillWidth, setFillWidth] = useState(0);
  const [elapsed,   setElapsed]   = useState("0:00");
  const [label,     setLabel]     = useState("Loading...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted,   setIsMuted]   = useState(false);
  const [needsTap,  setNeedsTap]  = useState(false);
  const [volume,    setVolume]    = useState(() => {
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
    cancelAnimationFrame(rafRef.current);
    setFillWidth(100);
    setElapsed("0:30");
    setLabel("Preview ended");
    setIsPlaying(false);
  }

  // ── Sync progress bar to server countdown ─────────────────────────────────

  useEffect(() => {
    if (!duration || remaining === undefined) return;
    const elapsedSeconds = duration - remaining;
    setFillWidth((elapsedSeconds / AUDIO_DURATION) * 100);
    setElapsed(fmt(elapsedSeconds));
  }, [remaining, duration]);

  // ── Volume and mute controls ───────────────────────────────────────────────

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

  // ── Tap to play — called directly from user gesture for iOS ───────────────

  function handleTap() {
    const audio = audioRef.current;
    if (!audio) return;
    setNeedsTap(false);
    audio.play().catch(() => {});
  }

  // ── Set playsinline on DOM element after mount ────────────────────────────
  //
  // Prevents iOS from intercepting audio playback at the system level.
  // Set via setAttribute to avoid React's lint restriction on audio elements.

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.setAttribute("playsinline", "");
  }, []);

  // ── Reset state when previewUrl changes ───────────────────────────────────

  useEffect(() => {
    setFillWidth(0);
    setElapsed("0:00");
    setLabel("Loading...");
    setIsPlaying(false);
    setNeedsTap(false);
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
  }, [previewUrl]);

  // ── Attach event listeners and load audio ─────────────────────────────────

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !previewUrl) return;

    audio.volume = volume;

    function onCanPlay() {
      setLabel("30s preview");
      audio.play().catch(() => {
        setNeedsTap(true);
        setLabel("Tap to play");
      });
    }

    function onPlay() {
      clearTimeout(timerRef.current);
      setIsPlaying(true);
      setNeedsTap(false);
      timerRef.current = setTimeout(() => end(audio), AUDIO_DURATION * 1000);
    }

    function onError() {
      setLabel("Preview unavailable");
    }

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("play",    onPlay);
    audio.addEventListener("error",   onError);
    audio.load();

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("play",    onPlay);
      audio.removeEventListener("error",   onError);
      audio.pause();
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [previewUrl]);

  return (
    <div className="music-player">

      {/* DOM audio element — required for iOS Safari compatibility */}
      <audio
        ref={audioRef}
        src={previewUrl}
        preload="auto"
        style={{ display: "none" }}
      />

      {/* Tap to play — only shown when autoplay is blocked on mobile */}
      {needsTap && (
        <button
          onClick={handleTap}
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "10px",
            width:          "100%",
            padding:        "14px",
            marginBottom:   "12px",
            background:     "linear-gradient(135deg, #e84393, #c084fc)",
            border:         "none",
            borderRadius:   "12px",
            color:          "#fff",
            fontSize:       "15px",
            fontWeight:     "600",
            cursor:         "pointer",
            fontFamily:     "inherit",
          }}
        >
          ▶ Tap to play preview
        </button>
      )}

      <div className="music-player__track">
        <div className="music-player__fill" style={{ width: fillWidth + "%" }}></div>
      </div>

      <div className="music-player__times">
        <span>{elapsed}</span>
        <span className="music-player__label">{label}</span>
        <span>0:30</span>
      </div>

      {/* Volume controls — restored from original */}
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