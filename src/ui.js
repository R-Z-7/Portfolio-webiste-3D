import confetti from 'canvas-confetti';
import { profileData } from './data.js';
import { sound } from './audio.js';

export class UIManager {
  constructor(studioScene) {
    this.scene = studioScene;
    this.activeModal = null;
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.renderProjects('all');
    this.renderExperience();
    this.renderFaqs();
  }

  cacheDOM() {
    // Audio button
    this.audioBtn = document.getElementById('audio-toggle');
    this.audioWave = document.getElementById('audio-waves');

    // Menu buttons
    this.menuToggle = document.getElementById('menu-toggle');
    this.navMenuBox = document.getElementById('nav-menu-box');

    // Modals
    this.aboutModal = document.getElementById('modal-about');
    this.workModal = document.getElementById('modal-work');
    this.expModal = document.getElementById('modal-exp');
    this.contactModal = document.getElementById('modal-contact');

    // Tooltip
    this.hoverTooltip = document.getElementById('hover-tooltip');

    // Toast
    this.toast = document.getElementById('toast-notification');
    this.toastMsg = document.getElementById('toast-message');
  }

  bindEvents() {
    // Audio Toggle
    if (this.audioBtn) {
      this.audioBtn.addEventListener('click', async () => {
        const isPlaying = await sound.toggle();
        this.updateAudioState(isPlaying);
        this.scene.toggleTurntable(isPlaying);
      });
    }

    // Audio State sync from sound engine
    sound.onStateChange((isPlaying) => {
      this.updateAudioState(isPlaying);
    });

    // Nav Links
    document.querySelectorAll('[data-nav-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.playClick('soft');
        const target = e.currentTarget.getAttribute('data-nav-target');
        this.openSection(target);
      });
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick('soft');
        this.closeAllModals();
      });
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          sound.playClick('soft');
          this.closeAllModals();
        }
      });
    });

    // Project filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        sound.playClick('soft');
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const category = e.currentTarget.getAttribute('data-filter');
        this.renderProjects(category);
      });
    });

    // Copy buttons
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = e.currentTarget.getAttribute('data-copy');
        navigator.clipboard.writeText(text).then(() => {
          this.showToast(`Copied: ${text}`);
          sound.playClick('soft');
        });
      });
    });

    // Download CV confetti trigger
    const cvBtn = document.getElementById('download-cv-btn');
    if (cvBtn) {
      cvBtn.addEventListener('click', () => {
        sound.playClick('soft');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      });
    }

    // Contact Form submission
    const form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playClick('switch');
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
        this.showToast('Thank you! Your message has been received.');
        form.reset();
        setTimeout(() => {
          this.closeAllModals();
        }, 1500);
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      } else if (e.key === 'm' || e.key === 'M') {
        if (!e.target.matches('input, textarea')) {
          sound.toggle().then(isPlaying => {
            this.updateAudioState(isPlaying);
            this.scene.toggleTurntable(isPlaying);
          });
        }
      }
    });
  }

  updateAudioState(isPlaying) {
    if (!this.audioBtn) return;
    if (isPlaying) {
      this.audioBtn.classList.add('playing');
      this.audioBtn.title = 'Ambient Lo-Fi Audio (Playing)';
    } else {
      this.audioBtn.classList.remove('playing');
      this.audioBtn.title = 'Ambient Lo-Fi Audio (Muted)';
    }
  }

  setHoverTooltip(data) {
    if (!this.hoverTooltip) return;
    if (data) {
      this.hoverTooltip.innerHTML = `<span>●</span> <strong>${data.title}</strong> — ${data.hint}`;
      this.hoverTooltip.style.color = '#38bdf8';
    } else {
      this.hoverTooltip.innerHTML = `<span>✦</span> Drag to orbit • Click objects in studio to explore`;
      this.hoverTooltip.style.color = '#94a3b8';
    }
  }

  openSection(sectionId) {
    this.closeAllModals(false);
    try {
      history.replaceState(null, '', '#' + sectionId);
    } catch(e) {}

    if (sectionId === 'about') {
      this.scene.navigateTo('notebook');
      if (this.aboutModal) this.aboutModal.classList.add('active');
      this.activeModal = this.aboutModal;
    } else if (sectionId === 'work') {
      this.scene.navigateTo('monitor');
      if (this.workModal) this.workModal.classList.add('active');
      this.activeModal = this.workModal;
    } else if (sectionId === 'experience' || sectionId === 'rack') {
      this.scene.navigateTo('rack');
      if (this.expModal) this.expModal.classList.add('active');
      this.activeModal = this.expModal;
    } else if (sectionId === 'contact') {
      this.scene.navigateTo('overview');
      if (this.contactModal) this.contactModal.classList.add('active');
      this.activeModal = this.contactModal;
    }
  }

  closeAllModals(resetCamera = true) {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    this.activeModal = null;
    try {
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
      }
    } catch(e) {}
    if (resetCamera) {
      this.scene.resetToOverview();
    }
  }

  renderProjects(filter = 'all') {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const filtered = filter === 'all' 
      ? profileData.projects 
      : profileData.projects.filter(p => {
          if (filter === 'network') return p.category.toLowerCase().includes('network');
          if (filter === 'monitoring') return p.category.toLowerCase().includes('monitoring') || p.category.toLowerCase().includes('security');
          if (filter === 'creative') return p.category.toLowerCase().includes('web') || p.category.toLowerCase().includes('graphics');
          return true;
        });

    grid.innerHTML = filtered.map(proj => `
      <article class="project-card">
        <div>
          <span class="project-badge-tag">◈ ${proj.badge}</span>
          <h3 class="project-card-title">${proj.title}</h3>
          <p class="project-card-desc">${proj.description}</p>
          
          <div class="project-diagram-box">
            <span>[TOPOLOGY]</span> ${proj.diagram}
          </div>

          <div class="project-tech-tags">
            ${proj.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
        </div>

        <div class="project-footer-links">
          <span style="font-size: 11px; font-family: var(--font-mono); color: #34d399;">
            ✔ ${proj.metrics}
          </span>
          <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="project-link-btn">
            GitHub Repo ↗
          </a>
        </div>
      </article>
    `).join('');
  }

  renderExperience() {
    const list = document.getElementById('experience-list');
    if (!list) return;

    list.innerHTML = profileData.experience.map(exp => `
      <div class="timeline-card">
        <div class="timeline-header">
          <div>
            <h3 class="timeline-role">${exp.role}</h3>
            <span class="timeline-company">${exp.company} • ${exp.location}</span>
          </div>
          <span class="timeline-period">${exp.period}</span>
        </div>
        <p style="font-size: 0.92rem; color: #94a3b8; margin: 6px 0;">${exp.summary}</p>
        <ul class="timeline-bullets">
          ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    // Certifications list
    const certList = document.getElementById('certifications-list');
    if (certList) {
      certList.innerHTML = profileData.certifications.map(c => `
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: 8px; padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <h4 style="font-size: 14px; font-weight: 600; color: #ffffff;">${c.title}</h4>
            <span style="font-family: var(--font-mono); font-size: 11px; color: ${c.status === 'In Progress' ? '#38bdf8' : '#10b981'}; background: rgba(56, 189, 248, 0.1); padding: 2px 8px; border-radius: 4px;">
              ${c.status}
            </span>
          </div>
          <p style="font-size: 11.5px; color: #94a3b8; line-height: 1.4;">${c.description}</p>
          <span style="font-size: 11px; font-family: var(--font-mono); color: #64748b; margin-top: 6px; display: block;">
            Issuer: ${c.issuer} (${c.year})
          </span>
        </div>
      `).join('');
    }
  }

  renderFaqs() {
    const container = document.getElementById('faq-container');
    if (!container) return;

    container.innerHTML = profileData.faqs.map((faq, i) => `
      <div class="faq-item ${i === 0 ? 'open' : ''}">
        <button class="faq-question-btn" data-faq-idx="${i}">
          <span>${faq.q}</span>
          <span style="font-size: 12px; opacity: 0.6;">▼</span>
        </button>
        <div class="faq-answer">
          ${faq.a}
        </div>
      </div>
    `).join('');

    // Accordion toggle events
    container.querySelectorAll('.faq-question-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.playClick('soft');
        const parent = e.currentTarget.parentElement;
        const isOpen = parent.classList.contains('open');
        container.querySelectorAll('.faq-item').forEach(item => item.classList.remove('open'));
        if (!isOpen) {
          parent.classList.add('open');
        }
      });
    });
  }

  showToast(msg) {
    if (!this.toast) return;
    if (this.toastMsg) this.toastMsg.textContent = msg;
    this.toast.classList.add('show');
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2800);
  }
}
