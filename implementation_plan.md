# Goal: Add background music playback with a visible toggle button.

## User Review Required
> [!IMPORTANT]
> This will add an `<audio>` element that plays a looping background music file (e.g., `assets/bg_music.mp3`). Autoplay is restricted; the user must click the music button to start playback. Please confirm if you have a specific music file or a placeholder is okay.

## Open Questions
- Do you have a specific background music file (MP3/OGG) to use, or should we add a placeholder `assets/bg_music.mp3`?
- Should the music start automatically after the first user interaction (click the button), or require an explicit Play/Pause toggle each time?
- Do you want the existing music-player button to be repurposed, or add a new button (e.g., `#bg-music-btn`) with different styling?

## Proposed Changes
---
### index.html
- Add an `<audio id="bg-music" src="assets/bg_music.mp3" loop preload="metadata"></audio>` element before the closing `</body>` tag.
- Add a new button `<div id="bg-music-btn" aria-label="Nhạc nền" title="Nhạc nền" role="button" tabindex="0"><svg ...>...</svg></div>` inside the header (or as a fixed overlay) to toggle Play/Pause.

### style.css
- Style `#bg-music-btn` with a gradient background, hover pulse animation, and high `z-index: 1002` to ensure it appears above other elements.
- Make the button responsive for mobile screens (size adjusts, positioned in the top‑right corner).

### main.js
- Implement `initBgMusic()` that attaches a click listener to `#bg-music-btn`:
```js
const musicBtn = document.getElementById('bg-music-btn');
const bgAudio = document.getElementById('bg-music');
let playing = false;
musicBtn.addEventListener('click', () => {
  if (!playing) {
    bgAudio.play();
    musicBtn.classList.add('playing');
  } else {
    bgAudio.pause();
    musicBtn.classList.remove('playing');
  }
  playing = !playing;
  localStorage.setItem('bg_music_playing', playing);
});
// On page load, restore state
window.addEventListener('load', () => {
  const saved = localStorage.getItem('bg_music_playing') === 'true';
  if (saved) {
    bgAudio.volume = 0.3; // default volume
    bgAudio.play();
    musicBtn.classList.add('playing');
    playing = true;
  }
});
```
- Remove or disable the previous synth‑based music logic if not needed, or keep it separate.

### assets
- Add a placeholder silent track `assets/bg_music.mp3` (1‑second silent MP3) so the site loads without errors. The user can replace it later.

### Version Bump
- Update query strings in HTML for CSS and JS (e.g., `style.css?v=9.2`, `main.js?v=9.2`).

## Verification Plan
- Load the page, click the new music button; the audio should start and loop.
- Verify the button changes visual state (e.g., adds `.playing` class) to indicate playback.
- Refresh the page; the button should reflect the persisted state.
- Test on mobile to ensure the button is not obscured.

## Automated Tests
- None (manual UI verification).

## Manual Verification
- Open the site in a browser, interact with the button, ensure audio plays, and that the UI is responsive.
