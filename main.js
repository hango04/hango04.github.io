/* ============================================================
   main.js – Premium Immersive Interactions v5.0 (Flame Blue AI style)
   Ngô Mạnh Hà Portfolio
   ============================================================ */

/* ---------- 1. SUBTLE PARTICLES BACKGROUND ---------- */
function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particleCount = Math.min(65, Math.floor((w * h) / 20000));
  const particles = [];
  const colors = ['rgba(0,82,255,', 'rgba(0,194,255,', 'rgba(0,112,243,'];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * w;
      this.y = init ? Math.random() * h : h + 10;
      this.r = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.12;
      this.vy = -(Math.random() * 0.18 + 0.05);
      this.alpha = Math.random() * 0.4 + 0.15;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.life = 0;
      this.maxLife = Math.random() * 600 + 400;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10 || this.x < -10 || this.x > w + 10) {
        this.reset(false);
      }
    }
    draw() {
      const currentAlpha = this.alpha * Math.sin((this.life / this.maxLife) * Math.PI);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + currentAlpha + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) particles.push(new Particle());

  let mouse = { x: null, y: null };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function drawConnections() {
    const maxDist = 115;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 82, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      if (mouse.x !== null) {
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          const malpha = (1 - mdist / 140) * 0.09;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 194, 255, ${malpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  (function loop() {
    ctx.clearRect(0, 0, w, h);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
}

/* ---------- 2. CURTAIN TRANSITION (Flame Blue style) ---------- */
function initCurtainTransition() {
  const curtain = document.getElementById('transition-curtain');
  if (!curtain) return;

  let running = false;

  function triggerTransition(targetHref) {
    if (running) return;
    running = true;

    // Slide in curtain and scale down current content
    document.body.classList.add('page-transitioning');
    curtain.classList.add('active-in');

    setTimeout(() => {
      // Navigate to target section instantly
      if (targetHref.startsWith('#')) {
        const target = document.querySelector(targetHref);
        if (target) target.scrollIntoView({ behavior: 'instant' });
      }

      // Sweep curtain out and restore page scaling
      setTimeout(() => {
        curtain.classList.remove('active-in');
        curtain.classList.add('active-out');
        document.body.classList.remove('page-transitioning');

        setTimeout(() => {
          curtain.classList.remove('active-out');
          running = false;
        }, 600);
      }, 150);
    }, 600);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      triggerTransition(href);
    });
  });

  window._waveTransition = triggerTransition;
}

/* ---------- 3. AMBIENT CURSOR GLOW ---------- */
function initCursorGlow() {
  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  Object.assign(glow.style, {
    position: 'fixed',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,82,255,0.045) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: '0',
    transform: 'translate(-50%,-50%)',
    transition: 'left 0.07s ease, top 0.07s ease',
    mixBlendMode: 'screen',
  });
  document.body.appendChild(glow);
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

/* ---------- 4. AUDIO CLICK CHIME ---------- */
function initAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  let ctx = null;

  function playChime() {
    try {
      if (!ctx) ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  }

  document.querySelectorAll('.btn, .btn-icon, .filter-btn').forEach(el => {
    el.addEventListener('click', playChime);
  });
}

/* ---------- 5. MODAL ---------- */
function initModal() {
  const modal    = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close');
  if (!modal) return;

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ---------- 6. PREMIUM BOOT LOADER ---------- */
function initLoader() {
  const loader = document.getElementById('loader-screen');
  if (!loader) return;
  const bar = loader.querySelector('.loader-bar');
  const percent = loader.querySelector('.status-percent');
  const status = loader.querySelector('.status-text');
  if (!bar || !percent) return;

  const messages = [
    "LOADING ASSETS...",
    "RESOLVING DEPIN SERVICES...",
    "COMPILING SCRIPTS...",
    "SYSTEM ONLINE."
  ];

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      bar.style.width = '100%';
      percent.innerText = '100%';
      status.innerText = "SYSTEM ONLINE.";
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.style.display = 'none';
        }, 1200);
      }, 300);
    } else {
      bar.style.width = progress + '%';
      percent.innerText = progress + '%';
      if (progress < 25) status.innerText = messages[0];
      else if (progress < 60) status.innerText = messages[1];
      else status.innerText = messages[2];
    }
  }, 30);
}

/* ---------- 7. TYPEWRITER EFFECT ---------- */
function initTypewriter() {
  const element = document.querySelector('.typewriter-text');
  if (!element) return;
  const words = JSON.parse(element.getAttribute('data-words'));
  let wordIndex = 0;
  let txt = '';
  let isDeleting = false;

  function tick() {
    const fullTxt = words[wordIndex];
    if (isDeleting) {
      txt = fullTxt.substring(0, txt.length - 1);
    } else {
      txt = fullTxt.substring(0, txt.length + 1);
    }

    element.innerHTML = txt;

    let delta = 140 - Math.random() * 60;
    if (isDeleting) { delta /= 2; }

    if (!isDeleting && txt === fullTxt) {
      delta = 2000;
      isDeleting = true;
    } else if (isDeleting && txt === '') {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delta = 600;
    }

    setTimeout(tick, delta);
  }
  tick();
}

/* ---------- 8. CUSTOM MAGNETIC CURSOR ---------- */
function initCustomCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot = document.createElement('div');
  dot.id = 'custom-cursor-dot';
  const ring = document.createElement('div');
  ring.id = 'custom-cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  dot.style.display = 'block';
  ring.style.display = 'block';
  document.body.style.cursor = 'none';

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    const ease = 0.16;
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const updateHoverListeners = () => {
    const interactiveElements = document.querySelectorAll(
      'a, button, input, textarea, select, .project-card, .skills-card, .filter-btn, .timeline-card, .stat-item, .logo, .theme-toggle-btn'
    );
    interactiveElements.forEach(el => {
      el.removeEventListener('mouseenter', addHoverClass);
      el.removeEventListener('mouseleave', removeHoverClass);
      el.addEventListener('mouseenter', addHoverClass);
      el.addEventListener('mouseleave', removeHoverClass);
    });
  };

  function addHoverClass() { document.body.classList.add('cursor-hover'); }
  function removeHoverClass() { document.body.classList.remove('cursor-hover'); }

  updateHoverListeners();

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(updateHoverListeners, 350);
    });
  });
}

/* ---------- 9. 3D GLASS CARDS TILT & GLOW ---------- */
function initGlassCards() {
  const cards = document.querySelectorAll('.glass-card');
  const isHoverSupported = window.matchMedia('(any-hover: hover)').matches;
  if (!isHoverSupported) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -(y - centerY) / (rect.height / 12);
      const rotateY = (x - centerX) / (rect.width / 12);

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.4s ease, background-color 0.4s ease';

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
  });
}

/* ---------- BOOT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initParticles();
  initCurtainTransition();
  initCursorGlow();
  initAudio();
  initModal();
  initTypewriter();
  initCustomCursor();
  initGlassCards();
});
