function createMusicPreviewPlayer(selector, options) {
  const container = typeof selector === 'string' ? document.querySelector(selector) : selector;
  const previewUrl = options.previewUrl;
  const title = options.title || 'Unknown Track';
  const artist = options.artist || 'Unknown Artist';
  const DURATION = 30;

  let audio = null;
  let raf = null;
  let timer = null;

  function fmt(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + s.toString().padStart(2, '0');
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setLabel(text) {
    container.querySelector('.music-player__label').textContent = text;
  }

  function end() {
    if (audio) audio.pause();
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    container.querySelector('.music-player__fill').style.width = '100%';
    container.querySelector('.music-player__elapsed').textContent = '0:30';
    setLabel('Preview ended');
    container.querySelector('.equalizer').classList.remove('equalizer--playing');
    container.querySelector('.music-player__wave').classList.remove('music-player__wave--playing');
  }

  function tick() {
    const current = Math.min(audio ? audio.currentTime : 0, DURATION);
    container.querySelector('.music-player__fill').style.width = (current / DURATION) * 100 + '%';
    container.querySelector('.music-player__elapsed').textContent = fmt(current);
    if (current < DURATION) {
      raf = requestAnimationFrame(tick);
    } else {
      end();
    }
  }

  function render() {
    container.innerHTML = `
      <div class="music-player">
        <div class="music-player__row">
          <div class="music-player__art">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#bbb" stroke-width="1.5"/>
              <circle cx="12" cy="12" r="3" fill="#bbb"/>
            </svg>
          </div>
          <div class="music-player__info">
            <p class="music-player__title">${esc(title)}</p>
            <p class="music-player__artist">${esc(artist)}</p>
          </div>
          <div class="equalizer">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="music-player__track">
          <div class="music-player__fill"></div>
        </div>
        <div class="music-player__times">
          <span class="music-player__elapsed">0:00</span>
          <span class="music-player__label">Loading...</span>
          <span>0:30</span>
        </div>
        <div class="music-player__wave">
          ${Array.from({ length: 20 }, () => '<span></span>').join('')}
        </div>
      </div>
    `;
  }

  function initAudio() {
    audio = new Audio(previewUrl);
    audio.volume = 0.85;

    audio.addEventListener('canplay', function() {
      setLabel('30s preview');
      audio.play().catch(function() {
        setLabel('Click to play');
        document.addEventListener('click', function() {
          if (audio) audio.play().catch(function() {});
        }, { once: true });
      });
    });

    audio.addEventListener('play', function() {
      container.querySelector('.equalizer').classList.add('equalizer--playing');
      container.querySelector('.music-player__wave').classList.add('music-player__wave--playing');
      tick();
    });

    audio.addEventListener('error', function() {
      setLabel('Preview unavailable');
    });

    timer = setTimeout(end, DURATION * 1000);
  }

  function mount() {
    render();
    initAudio();
  }

  function destroy() {
    if (audio) { audio.pause(); audio = null; }
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    if (container) container.innerHTML = '';
  }

  return { mount, destroy };
}

module.exports = createMusicPreviewPlayer;
