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

  // Simulate smooth progressive load ("Setting the scene...")
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 18) + 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);

      if (loaderBarFill) loaderBarFill.style.width = '100%';
      if (loaderPercent) loaderPercent.textContent = '100%';

      setTimeout(() => {
        if (loaderOverlay) {
          loaderOverlay.classList.add('hidden');
        }
      }, 400);
    } else {
      if (loaderBarFill) loaderBarFill.style.width = `${progress}%`;
      if (loaderPercent) loaderPercent.textContent = `${progress}%`;
    }
  }, 90);

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
});
