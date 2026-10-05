// Web Audio API Procedural Ambient Sound Engine & Vinyl Simulator
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = true;
    this.gainNode = null;
    this.vinylGain = null;
    this.listeners = [];
    this.chordTimer = null;
    this.currentChordIndex = 0;

    // Ambient chords (frequencies in Hz)
    // Fmaj7, Am7, Dm7, Cmaj7
    this.chords = [
      [174.61, 220.00, 261.63, 329.63], // F3, A3, C4, E4
      [220.00, 261.63, 329.63, 392.00], // A3, C4, E4, G4
      [146.83, 220.00, 261.63, 349.23], // D3, A3, C4, F4
      [130.81, 196.00, 261.63, 329.63]  // C3, G3, C4, E4
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    
    // Master Gain
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    // Master Lowpass Filter for warmth
    this.masterFilter = this.ctx.createBiquadFilter();
    this.masterFilter.type = 'lowpass';
    this.masterFilter.frequency.setValueAtTime(650, this.ctx.currentTime);
    this.masterFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);
    this.masterFilter.connect(this.gainNode);

    // Initialize Vinyl Crackle generator
    this.initVinylCrackle();
  }

  initVinylCrackle() {
    if (!this.ctx) return;
    
    // 2-second buffer of subtle crackle and dust noise
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Subtle background hiss
      let sample = (Math.random() * 2 - 1) * 0.015;
      // Occasional needle pop / dust tick
      if (Math.random() < 0.0018) {
        sample += (Math.random() * 2 - 1) * 0.18;
      }
      data[i] = sample;
    }

    this.vinylBuffer = buffer;
  }

  startVinylLoop() {
    if (!this.ctx || !this.vinylBuffer) return;
    
    this.vinylSource = this.ctx.createBufferSource();
    this.vinylSource.buffer = this.vinylBuffer;
    this.vinylSource.loop = true;

    this.vinylGain = this.ctx.createGain();
    this.vinylGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.vinylGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 1.5);

    // Filter crackle to stay warm and not harsh
    const vinylFilter = this.ctx.createBiquadFilter();
    vinylFilter.type = 'bandpass';
    vinylFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    vinylFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    this.vinylSource.connect(vinylFilter);
    vinylFilter.connect(this.vinylGain);
    this.vinylGain.connect(this.ctx.destination);

    this.vinylSource.start();
  }

  stopVinylLoop() {
    if (this.vinylGain && this.ctx) {
      try {
        this.vinylGain.gain.setValueAtTime(this.vinylGain.gain.value, this.ctx.currentTime);
        this.vinylGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
        setTimeout(() => {
          if (this.vinylSource) {
            try { this.vinylSource.stop(); } catch(e){}
            this.vinylSource = null;
          }
        }, 850);
      } catch(e) {}
    }
  }

  playChord(frequencies) {
    if (!this.ctx || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    const duration = 5.5; // seconds per chord progression step

    frequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      // Warm analog blend: sine and gentle triangle
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Micro detune for lush chorus warmth
      const detune = (idx - 1.5) * 4;
      osc.detune.setValueAtTime(detune, now);

      // Soft envelope (slow attack, mellow sustain, gentle release)
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.08 / frequencies.length, now + 1.2);
      noteGain.gain.exponentialRampToValueAtTime(0.05 / frequencies.length, now + duration - 0.8);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(noteGain);
      noteGain.connect(this.masterFilter);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    });

    // Schedule next chord in cycle
    this.chordTimer = setTimeout(() => {
      if (this.isPlaying) {
        this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
        this.playChord(this.chords[this.currentChordIndex]);
      }
    }, (duration - 0.5) * 1000);
  }

  async toggle() {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      // Fade in master
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.7, this.ctx.currentTime + 1.2);

      this.startVinylLoop();
      this.currentChordIndex = 0;
      this.playChord(this.chords[this.currentChordIndex]);
    } else {
      // Fade out
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);

      this.stopVinylLoop();
      if (this.chordTimer) clearTimeout(this.chordTimer);
    }

    this.notify();
    return this.isPlaying;
  }

  // Micro haptic interaction sound
  playClick(type = 'soft') {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (!this.ctx || this.ctx.state === 'suspended') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'switch') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  onStateChange(cb) {
    this.listeners.push(cb);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.isPlaying));
  }
}

export const sound = new SoundEngine();
