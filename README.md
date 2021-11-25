# \<mp3-player>

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.
I had a need to play music with the game I am developing with my son.
So I created a web component that leveraged the audio component, it needed to be
able to play as a hidden stand alone player or enable users to choose their own
music from their computer.

## Installation

```bash
npm install git+ssh://git@github.com:DanielTurner/mp3-player.git
```

## Usage

```html
<script type="module">
  import 'mp3-player/mp3-player.js';
</script>

<!-- no options mp3 player -->
<mp3-player></mp3-player>


<!-- all options, see demo for details -->
<mp3-player
   .defaultPlaylist=${defaultPlaylist}
   autoPlay
   hidden
>

</mp3-player>
```

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
