import { useEffect, useRef } from "react";
import "./MusicPreviewPlayer.css";

function MusicPreviewPlayer(props) {
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const fillRef = useRef(null);
  const elapsedRef = useRef(null);
  const labelRef = useRef(null);
  const eqRef = useRef(null);
  const waveRef = useRef(null);
  const DURATION = 30;

  function fmt(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + s.toString().padStart(2, "0");
  }

  function setLabel(text) {
    if (labelRef.current) labelRef.current.textContent = text;
  }

  function end() {
    if (audioRef.current) audioRef.current.pause();
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
    if (fillRef.current) fillRef.current.style.width = "100%";
    if (elapsedRef.current) elapsedRef.current.textContent = "0:30";
    setLabel("Preview ended");
    if (eqRef.current) eqRef.current.classList.remove("equalizer--playing");
    if (waveRef.current) waveRef.current.classList.remove("music-player__wave--playing");
  }

  function tick() {
    const current = Math.min(audioRef.current ? audioRef.current.currentTime : 0, DURATION);
    if (fillRef.current) fillRef.current.style.width = (current / DURATION) * 100 + "%";
    if (elapsedRef.current) elapsedRef.current.textContent = fmt(current);
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
      if (eqRef.current) eqRef.current.classList.add("equalizer--playing");
      if (waveRef.current) waveRef.current.classList.add("music-player__wave--playing");
      tick();
    });

    audio.addEventListener("error", function () {
      setLabel("Preview unavailable");
    });

    timerRef.current = setTimeout(end, DURATION * 1000);

    return function () {
      audio.pause();
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="music-player">
      <div className="music-player__track">
        <div className="music-player__fill" ref={fillRef}></div>
      </div>
      <div className="music-player__times">
        <span ref={elapsedRef}>0:00</span>
        <span className="music-player__label" ref={labelRef}>Loading...</span>
        <span>0:30</span>
      </div>
      <div className="music-player__wave" ref={waveRef}>
        {Array.from({ length: 20 }, (_, i) => <span key={i}></span>)}
      </div>
      <div className="equalizer" ref={eqRef}>
        <span></span><span></span><span></span>
      </div>
    </div>
  );
}

export default MusicPreviewPlayer;
