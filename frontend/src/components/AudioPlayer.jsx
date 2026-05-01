import { useEffect, useRef, useState } from "react";
import "./AudioPlayer.css";
function AudioPlayer(props) {
  const audioRef  = useRef(null);
  const rafRef    = useRef(null);
  const timerRef  = useRef(null);
  const DURATION  = 30;
  const [fillWidth, setFillWidth] = useState(0);
  const [elapsed,   setElapsed]   = useState("0:00");
  const [label,     setLabel]     = useState("Loading...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsTap,  setNeedsTap]  = useState(false);
  function fmt(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + s.toString().padStart(2, "0");
  }
  function end() {
    const audio = audioRef.current
    if (audio) audio.pause()
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
    setFillWidth(100);
    setElapsed("0:30");
    setLabel("Preview ended");
    setIsPlaying(false);
  }
  function tick() {
    const audio = audioRef.current
    if (!audio) return
    const current = Math.min(audio.currentTime, DURATION);
    setFillWidth((current / DURATION) * 100);
    setElapsed(fmt(current));
    if (current < DURATION) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      end();
    }
  }
  function handleTap() {
    const audio = audioRef.current
    if (!audio) return
    setNeedsTap(false)
    audio.play().catch(() => {})
  }
  // Reset state when previewUrl changes
  useEffect(() => {
    setFillWidth(0);
    setElapsed("0:00");
    setLabel("Loading...");
    setIsPlaying(false);
    setNeedsTap(false);
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
  }, [props.previewUrl]);
  // Set up event listeners on the DOM audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !props.previewUrl) return
    function onCanPlay() {
      setLabel("30s preview");
      audio.play().catch(() => {
        setNeedsTap(true);
        setLabel("Tap to play");
      });
    }
    function onPlay() {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
      setIsPlaying(true);
      setNeedsTap(false);
      timerRef.current = setTimeout(end, DURATION * 1000);
      tick();
    }
    function onError() {
      setLabel("Preview unavailable");
    }
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("play",    onPlay);
    audio.addEventListener("error",   onError);
    // Set volume and load
    audio.volume = 0.85
    audio.load()
    return () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("play",    onPlay);
      audio.removeEventListener("error",   onError);
      audio.pause()
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [props.previewUrl]);
  return (
    <div className="music-player">
      {/* DOM audio element — attached to the page for iOS compatibility */}
      <audio
        ref={audioRef}
        src={props.previewUrl}
        preload="auto"
        playsInline          // critical for iOS — prevents fullscreen takeover
        style={{ display: 'none' }}
      />
      {needsTap && (
        <button
          onClick={handleTap}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '10px',
            width:          '100%',
            padding:        '14px',
            marginBottom:   '12px',
            background:     'linear-gradient(135deg, #E84393, #C084FC)',
            border:         'none',
            borderRadius:   '12px',
            color:          '#fff',
            fontSize:       '15px',
            fontWeight:     '600',
            cursor:         'pointer',
            fontFamily:     'inherit',
          }}
        >
          
 Tap to play preview
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