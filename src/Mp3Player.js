import { html, css, LitElement } from 'lit';

export class Mp3Player extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        color: var(--mp3-player-text-color, #000);
      }

      #file {
        display: none;
      }

      .container {
        height: 40px;
        width: 350px;
        background: transparent;
        border-radius: 25px;
        display: flex;
        align-items: center;
        position: relative;
        overflow: hidden;
        justify-content: space-evenly;
      }

      .container button {
        line-height: 40px;
        font-size: 20px;
        background-color: transparent;
        border-width: 0;
        padding-left: 20px;
      }

      .progress {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        border-radius: 25px;
        background: #ece8e8;
        opacity: 10%;
        pointer-events: none;
      }

      [hidden] {
        display: none !important;
      }
    `;
  }

  static get properties() {
    return {
      audio: { type: Object },
      autoPlay: { type: Boolean },
      currentIndex: { type: Number },
      currentPlaylist: { type: Array },
      defaultPlaylist: { type: Array },
      files: { type: Array },
      isPlaying: { type: Boolean },
      playPromise: { type: Object },
      progress: { type: Number },
      source: { type: String },
      timer: { type: Object },
    };
  }

  constructor() {
    super();
    this.currentIndex = 0;
    this.isPlaying = false;
    this.progress = 0;
  }

  firstUpdated() {
    this.renderRoot.getElementById('file')
      .addEventListener('change', (event) => {
      const files = [...event.target.files];
      this.__updateFileList(files);
    });

    this.audio = this.renderRoot.getElementById('audio');

    this.audio.addEventListener('ended', () => {
      this.__nextSong();
    });

    this.currentPlaylist = [...this.defaultPlaylist];

    if (this.autoPlay && this.currentPlaylist.length) {
      this.__playSong();
    }
  }

  __playSong() {
    if (this.audio.src !== this.currentPlaylist[this.currentIndex]) {
      this.__changeMusicSource(this.currentPlaylist[this.currentIndex]);
    }
    this.__startTimer();
    this.playPromise = this.audio.play();

    if (this.playPromise !== undefined) {
      this.playPromise.then(() => {
        this.isPlaying = true;
      })
      .catch(() => {
        this.__addListeners();
      });
    }
  }

  __addListeners() {
    document.addEventListener('click', () => { this.__eventFunction(); });
    document.addEventListener('focus', () => { this.__eventFunction(); });
    document.addEventListener('wheel', () => { this.__eventFunction(); });
    document.addEventListener(
      'touchstart', () => { this.__eventFunction(); },
    );
  }

  __eventFunction() {
    this.__removeListeners();
    this.__playSong();
  }

  __removeListeners() {
    document.removeEventListener('click', () => { this.__eventFunction(); });
    document.removeEventListener('focus', () => { this.__eventFunction(); });
    document.removeEventListener('wheel', () => { this.__eventFunction(); });
    document.removeEventListener(
      'touchstart', () => { this.__eventFunction(); },
    );
  }

  __pauseSong() {
    this.audio.pause();
    this.isPlaying = false;
  }

  __nextSong() {
    this.currentIndex += 1;
    if (this.currentIndex > this.currentPlaylist.length - 1) {
      this.currentIndex = 0;
    }
    this.__changeMusicSource(this.currentPlaylist[this.currentIndex]);
  }

  __previousSong() {
    this.currentIndex -= 1;
    if (this.currentIndex === -1) {
      this.currentIndex = this.currentPlaylist.length - 1;
    }
    this.__changeMusicSource(this.currentPlaylist[this.currentIndex]);
  }

  __openFileBrowser() {
    this.renderRoot.getElementById('file').click();
  }

  __changeMusicSource(source) {
    this.__clearTimer();
    this.audio.src = source;
    this.__playSong();
  }

  __updateFileList(files) {
    this.__pauseSong();
    this.currentPlaylist = [];
    this.currentIndex = 0;

    if (!files.length) {
      return;
    }
    this.__clearTimer();
    for (const file of files) {
      this.currentPlaylist.push(URL.createObjectURL(file));
    }
    if (this.autoPlay) {
      this.__playSong();
    }
  }

  __clearTimer() {
    clearInterval(this.timer);
    this.timer = {};
  }

  __startTimer() {
    this.timer = setInterval(() => { this.__updateProgress(); }, 100);
  }

  __updateProgress() {
    if (!this.audio.duration) {
      this.__clearTimer();
    }

    this.max = this.audio.duration;
    this.progress = this.audio.currentTime;
  }

  render() {
    return html`
      <audio id="audio" aria-hidden="true"></audio>
      
      <input
        type="file"
        id="file"
        aria-hidden="true"
        accept="audio/mpeg"
        multiple>
      
      <div class="container" ?hidden=${this.hidden}>
        <progress
          class="progress"
          value="${this.progress}"
          max="${this.max}">
        </progress>
        
        <button
          alt="Play music"
          ?hidden="${this.isPlaying}"
          @click=${this.__playSong}>
          &#x23F5;
        </button>
        
        <button
          alt="Pause music"
          ?hidden="${!this.isPlaying}"
          @click=${this.__pauseSong}>
          &#x23F8;
        </button>
        
        <button
          alt="Previous track"
          @click=${this.__previousSong}>
          &#x23EE;
        </button>
        
        <button 
          alt="Next track"
          @click=${this.__nextSong}>
          &#x23ED;
        </button>
        
        <button alt="Load more music"
          @click=${this.__openFileBrowser}>
          &#x23CF;
        </button>
      </div>
    `;
  }
}
