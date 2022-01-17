import { html, css, LitElement } from 'lit';

/**
 *
 */
export class Mp3Player extends LitElement {
  static styles = css`
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

  static properties = {
    autoPlay: { type: Boolean },
    defaultPlaylist: { type: Array },
    progress: { type: Number },
  };

  /**
   */
  constructor() {
    super();
    this._audio = {};
    this._currentIndex = 0;
    this._currentPlaylist = [];
    this._isPlaying = false;
    this._playPromise = {};
    this.progress = 0;
    this._timer = {};
  }

  /**
   */
  firstUpdated() {
    this.renderRoot.getElementById('file').addEventListener('change', event => {
      const files = [...event.target.files];
      this.__updateFileList(files);
    });

    this._audio = this.renderRoot.getElementById('audio');

    this._audio.addEventListener('ended', () => {
      this.__nextSong();
    });

    this._currentPlaylist = this.defaultPlaylist
      ? [...this.defaultPlaylist]
      : [];

    if (this.autoPlay && this._currentPlaylist.length) {
      this.__playSong();
    }
  }

  /**
   */
  __playSong() {
    if (this._audio.src !== this._currentPlaylist[this._currentIndex]) {
      this.__changeMusicSource(this._currentPlaylist[this._currentIndex]);
    }
    this.__startTimer();
    this._playPromise = this._audio.play();

    if (this._playPromise !== undefined) {
      this._playPromise
        .then(() => {
          this._isPlaying = true;
        })
        .catch(() => {
          this.__addListeners();
        });
    }
  }

  /**
   */
  __addListeners() {
    document.addEventListener('click', () => {
      this.__eventFunction();
    });
    document.addEventListener('focus', () => {
      this.__eventFunction();
    });
    document.addEventListener('wheel', () => {
      this.__eventFunction();
    });
    document.addEventListener('touchstart', () => {
      this.__eventFunction();
    });
  }

  /**
   */
  __eventFunction() {
    this.__removeListeners();
    this.__playSong();
  }

  /**
   */
  __removeListeners() {
    document.removeEventListener('click', () => {
      this.__eventFunction();
    });
    document.removeEventListener('focus', () => {
      this.__eventFunction();
    });
    document.removeEventListener('wheel', () => {
      this.__eventFunction();
    });
    document.removeEventListener('touchstart', () => {
      this.__eventFunction();
    });
  }

  /**
   */
  __pauseSong() {
    this._audio.pause();
    this._isPlaying = false;
  }

  /**
   */
  __nextSong() {
    this._currentIndex += 1;
    if (this._currentIndex > this._currentPlaylist.length - 1) {
      this._currentIndex = 0;
    }
    this.__changeMusicSource(this._currentPlaylist[this._currentIndex]);
  }

  /**
   */
  __previousSong() {
    this._currentIndex -= 1;
    if (this._currentIndex === -1) {
      this._currentIndex = this._currentPlaylist.length - 1;
    }
    this.__changeMusicSource(this._currentPlaylist[this._currentIndex]);
  }

  /**
   */
  __openFileBrowser() {
    this.renderRoot.getElementById('file').click();
  }

  /**
   * @param {Object} source
   */
  __changeMusicSource(source) {
    this.__clearTimer();
    this._audio.src = source;
    this.__playSong();
  }

  /**
   * @param {Array} files
   * @returns
   */
  __updateFileList(files) {
    this.__pauseSong();
    this._currentPlaylist = [];
    this._currentIndex = 0;

    if (!files.length) {
      return;
    }

    this.__clearTimer();
    for (const file of files) {
      this._currentPlaylist.push(URL.createObjectURL(file));
    }

    if (this.autoPlay) {
      this.__playSong();
    }
  }

  /**
   */
  __clearTimer() {
    clearInterval(this._timer);
    this._timer = {};
  }

  /**
   */
  __startTimer() {
    this._timer = setInterval(() => {
      this.__updateProgress();
    }, 100);
  }

  /**
   */
  __updateProgress() {
    if (!this._audio.duration) {
      this.__clearTimer();
    }

    this.max = this._audio.duration;
    this.progress = this._audio.currentTime;
  }

  /**
   * @returns
   */
  render() {
    return html`
      <audio id="audio" aria-hidden="true"></audio>

      <input
        type="file"
        id="file"
        aria-hidden="true"
        accept="audio/mpeg"
        multiple
      />

      <div class="container" ?hidden=${this.hidden}>
        <progress
          class="progress"
          value="${this.progress}"
          max="${this.max}"
        ></progress>

        <button
          alt="Play music"
          ?hidden="${this._isPlaying}"
          @click=${this.__playSong}
        >
          &#x23F5;
        </button>

        <button
          alt="Pause music"
          ?hidden="${!this._isPlaying}"
          @click=${this.__pauseSong}
        >
          &#x23F8;
        </button>

        <button alt="Previous track" @click=${this.__previousSong}>
          &#x23EE;
        </button>

        <button alt="Next track" @click=${this.__nextSong}>&#x23ED;</button>

        <button alt="Load more music" @click=${this.__openFileBrowser}>
          &#x23CF;
        </button>
      </div>
    `;
  }
}
