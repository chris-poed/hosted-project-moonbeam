/**
 * MusicPreviewPlayer
 *
 * Autoplays a 30-second song preview.
 * Players cannot pause or stop the audio.
 *
 * Usage:
 *   const player = new MusicPreviewPlayer('#container', {
 *     previewUrl: song.url,
 *     title:      song.title,
 *     artist:     song.artist,
 *   });
 *   player.mount();
 */

class MusicPreviewPlayer {
  constructor(selector, { previewUrl, title = 'Unknown Track', artist = 'Unknown Artist' } = {}) {
    this.container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    this.previewUrl = previewUrl;
    this.title = title;
    this.artist = artist;

    this.DURATION = 30;
    this.audio = null;
    this._raf = null;
    this._timer = null;
  }

  mount() {
    this._render();
    this._initAudio();
  }

  destroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    cancelAnimationFrame(this._raf);
    clearTimeout(this._timer);
    if (this.container) this.container.innerHTML = '';
  }

  _render() {
    this.container.innerHTML = `
      <div class="mp-player">
        <style>
          .mp-player {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 16px;
            padding: 16px 20px;
            width: 340px;
            box-sizing: border-box;
            user-select: none;
          }
          .mp-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }
          .mp-art {
            width: 52px;
            height: 52px;
            border-radius: 10px;
            background: #f2f2f2;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .mp-info {
            flex: 1;
            min-width: 0;
          }
          .mp-title {
            margin: 0;
            font-size: 15px;
            font-weight: 600;
            color: #111;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .mp-artist {
            margin: 3px 0 0;
            font-size: 13px;
            color: #888;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .mp-eq {
            display: flex;
            align-items: flex-end;
            gap: 2px;
            height: 16px;
            flex-shrink: 0;
          }
          .mp-eq span {
            display: block;
            width: 3px;
            height: 4px;
            background: #111;
            border-radius: 2px;
          }
          .mp-eq.playing span:nth-child(1) { animation: mpBar 0.9s ease-in-out infinite 0s; }
          .mp-eq.playing span:nth-child(2) { animation: mpBar 0.9s ease-in-out infinite 0.2s; }
          .mp-eq.playing span:nth-child(3) { animation: mpBar 0.9s ease-in-out infinite 0.4s; }
          @keyframes mpBar {
            0%, 100% { height: 4px; }
            50%       { height: 14px; }
          }
          .mp-track {
            height: 4px;
            background: #f0f0f0;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 8px;
          }
          .mp-fill {
            height: 100%;
            width: 0%;
            background: #111;
            border-radius: 2px;
            transition: width 0.5s linear;
          }
          .mp-times {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .mp-time {
            font-size: 12px;
            color: #aaa;
            min-width: 28px;
          }
          .mp-label {
            font-size: 12px;
            color: #aaa;
            text-align: center;
          }
          .mp-wave {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2px;
            margin-top: 14px;
            height: 24px;
          }
          .mp-wave span {
            display: block;
            width: 3px;
            height: 20px;
            background: #e0e0e0;
            border-radius: 2px;
            transform-origin: center;
            transform: scaleY(0.3);
          }
          .mp-wave.playing span { animation: mpWave 1s ease-in-out infinite; }
          .mp-wave.playing span:nth-child(odd)  { animation-delay: 0s; }
          .mp-wave.playing span:nth-child(even) { animation-delay: 0.15s; }
          @keyframes mpWave {
            0%, 100% { transform: scaleY(0.3); }
            50%       { transform: scaleY(1); }
          }
        </style>

        <div class="mp-row">
          <div class="mp-art">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#bbb" stroke-width="1.5"/>
              <circle cx="12" cy="12" r="3" fill="#bbb"/>
              <line x1="12" y1="2"  x2="12" y2="5"  stroke="#bbb" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke="#bbb" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="2"  y1="12" x2="5"  y2="12" stroke="#bbb" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="19" y1="12" x2="22" y2="12" stroke="#bbb" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="mp-info">
            <p class="mp-title">${this._esc(this.title)}</p>
            <p class="mp-artist">${this._esc(this.artist)}</p>
          </div>
          <div class="mp-eq" id="mp-eq">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div class="mp-track">
          <div class="mp-fill" id="mp-fill"></div>
        </div>

        <div class="mp-times">
          <span class="mp-time" id="mp-elapsed">0:00</span>
          <span class="mp-label" id="mp-label">Loading…</span>
          <span class="mp-time">0:30</span>
        </div>

        <div class="mp-wave" id="mp-wave">
          ${Array.from({ length: 20 }, () => '<span></span>').join('')}
        </div>
      </div>
    `;

    this._els = {
      fill:    this.container.querySelector('#mp-fill'),
      elapsed: this.container.querySelector('#mp-elapsed'),
      label:   this.container.querySelector('#mp-label'),
      eq:      this.container.querySelector('#mp-eq'),
      wave:    this.container.querySelector('#mp-wave'),
    };
  }

  _initAudio() {
    const audio = new Audio(this.previewUrl);
    this.audio = audio;
    audio.volume = 0.85;

    audio.addEventListener('canplay', () => {
      this._setLabel('30s preview');
      audio.play().catch(() => {
        this._setLabel('Click to play');
        document.addEventListener('click', () => {
          if (this.audio) audio.play().catch(() => {});
        }, { once: true });
      });
    });

    audio.addEventListener('play', () => {
      this._els.eq.classList.add('playing');
      this._els.wave.classList.add('playing');
      this._tick();
    });

    audio.addEventListener('error', () => {
      this._setLabel('Preview unavailable');
    });

    // Hard stop at 30 s regardless of actual audio length
    this._timer = setTimeout(() => this._end(), this.DURATION * 1000);
  }

  _tick() {
    const current = Math.min(this.audio ? this.audio.currentTime : 0, this.DURATION);
    const pct = (current / this.DURATION) * 100;

    this._els.fill.style.width = pct + '%';
    this._els.elapsed.textContent = this._fmt(current);

    if (current < this.DURATION) {
      this._raf = requestAnimationFrame(() => this._tick());
    } else {
      this._end();
    }
  }

  _end() {
    if (this.audio) this.audio.pause();
    cancelAnimationFrame(this._raf);
    clearTimeout(this._timer);

    this._els.fill.style.width = '100%';
    this._els.elapsed.textContent = '0:30';
    this._setLabel('Preview ended');
    this._els.eq.classList.remove('playing');
    this._els.wave.classList.remove('playing');
  }

  _setLabel(text) {
    this._els.label.textContent = text;
  }

  _fmt(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

// CommonJS export for use in Node/Express views
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MusicPreviewPlayer;
}