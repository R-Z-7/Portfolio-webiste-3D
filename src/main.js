import './style.css';
import { StudioScene } from './scene.js';
import { UIManager } from './ui.js';
import { sound } from './audio.js';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  const loaderOverlay = document.getElementById('loader-overlay');
  const loaderBarFill = document.getElementById('loader-bar-fill');
  const loaderPercent = document.getElementById('loader-percent');

  let uiManager = null;
  let studioScene = null;

  // Initialize 3D Scene
  studioScene = new StudioScene(
    container,
    // onObjectClick
    (objectId, objectTitle) => {
      sound.playClick('soft');
      if (objectId === 'monitor') {
        uiManager.openSection('work');
      } else if (objectId === 'notebook') {
        uiManager.openSection('about');
      } else if (objectId === 'rack') {
        uiManager.openSection('experience');
      } else if (objectId === 'turntable') {
        sound.toggle().then(isPlaying => {
          uiManager.updateAudioState(isPlaying);
          studioScene.toggleTurntable(isPlaying);
        });
      }
    },
    // onHoverChange
    (hoverData) => {
      if (uiManager) {
        uiManager.setHoverTooltip(hoverData);
      }
    }
  );

  // Initialize UI Manager
  uiManager = new UIManager(studioScene);

  // Deep-linking hash & query param handler
  function handleInitialNav() {
    const params = new URLSearchParams(window.location.search);
    const openParam = params.get('open');
    const hash = window.location.hash.replace('#', '').trim();
    const target = openParam || hash;
    if (['about', 'work', 'experience', 'contact'].includes(target) && uiManager) {
      if (loaderOverlay) loaderOverlay.classList.add('hidden');
      uiManager.openSection(target);
    }
  }

  handleInitialNav();
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '').trim();
    if (['about', 'work', 'experience', 'contact'].includes(hash) && uiManager) {
      uiManager.openSection(hash);
    }
  });

  // Smooth progressive loader ("Setting the scene...")
  let progress = 0;
  const updateProgress = () => {
    progress = Math.min(100, progress + 25);
    if (loaderBarFill) loaderBarFill.style.width = `${progress}%`;
    if (loaderPercent) loaderPercent.textContent = `${progress}%`;

    if (progress < 100) {
      setTimeout(updateProgress, 50);
    } else {
      setTimeout(() => {
        if (loaderOverlay) {
          loaderOverlay.classList.add('hidden');
        }
        handleHash();
      }, 120);
    }
  };
  updateProgress();
});
