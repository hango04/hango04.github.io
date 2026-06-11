/* ================================================
   main.js – Particles + Wave Transition + Effects
   ================================================ */

/* ---------- 1. PARTICLE BACKGROUND ---------- */
function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = 90;
  const particles = [];
  const COLORS = ['rgba(0,240,255,', 'rgba(189,0,255,', 'rgba(57,255,20,'];

  class Particle {
    constructor() { this.reset(true); }
    reset(random) {
      this.x     = Math.random() * canvas.width;
      this.y     = random ? Math.random() * canvas.height : canvas.height + 10;
      this.r     = Math.random() * 1.6 + 0.4;
      this.vy    = -(Math.random() * 0.4 + 0.15);
      this.vx    = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.55 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.life  = 0;
      this.maxLife = Math.random() * 400 + 200;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life > this.maxLife || this.y < -5) this.reset(false);
    }
    draw() {
      const a = this.alpha * Math.sin((this.life / this.maxLife) * Math.PI);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + a + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  const MAX_DIST = 120;
  function drawLinks() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,240,255,${(1 - d / MAX_DIST) * 0.1})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLinks();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
}

/* ---------- 2. WAVE TRANSITION ---------- */
function initWaveTransition() {
  const overlay    = document.getElementById('wave-overlay');
  const waveCanvas = document.getElementById('wave-canvas');
  if (!overlay || !waveCanvas) return;
  const ctx = waveCanvas.getContext('2d');

  let animId    = null;
  let progress  = 0;       // 0 → 1 covering, 1 → 0 uncovering
  let direction = 'in';    // 'in' | 'out'
  let pendingFn = null;
  let running   = false;

  function resize() {
    waveCanvas.width  = window.innerWidth;
    waveCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* Draw a wavy fill from top, progress 0=empty 1=full */
  function drawWave(prog) {
    const W = waveCanvas.width;
    const H = waveCanvas.height;
    ctx.clearRect(0, 0, W, H);

    // How far down the wave trough reaches
    const fillY = prog * (H + 120) - 120;

    ctx.beginPath();
    ctx.moveTo(0, H);

    // Multiple overlapping waves for richness
    const WAVES = [
      { amp: 38, freq: 2.2, phase: Date.now() * 0.0012 },
      { amp: 22, freq: 3.5, phase: Date.now() * 0.0018 + 1 },
      { amp: 14, freq: 5.0, phase: Date.now() * 0.002  + 2.5 },
    ];

    for (let x = 0; x <= W; x += 2) {
      let y = fillY;
      WAVES.forEach(w => {
        y += Math.sin((x / W) * Math.PI * w.freq + w.phase) * w.amp;
      });
      if (x === 0) ctx.lineTo(0, y);
      else         ctx.lineTo(x, y);
    }

    ctx.lineTo(W, H);
    ctx.closePath();

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   'rgba(0,8,24,0.97)');
    grad.addColorStop(0.4, 'rgba(0,40,80,0.95)');
    grad.addColorStop(0.7, 'rgba(20,0,60,0.95)');
    grad.addColorStop(1,   'rgba(0,8,24,0.97)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Glowing wave edge
    ctx.beginPath();
    ctx.moveTo(0, fillY);
    for (let x = 0; x <= W; x += 2) {
      let y = fillY;
      WAVES.forEach(w => {
        y += Math.sin((x / W) * Math.PI * w.freq + w.phase) * w.amp;
      });
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(0,240,255,0.7)';
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = 'rgba(0,240,255,1)';
    ctx.shadowBlur  = 16;
    ctx.stroke();
    ctx.shadowBlur  = 0;
  }

  const DURATION = 620; // ms per phase

  function animate(startTime, fromProg, toProg, onDone) {
    function frame(now) {
      const t   = Math.min((now - startTime) / DURATION, 1);
      const ease = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; // easeInOut
      progress = fromProg + (toProg - fromProg) * ease;
      drawWave(progress);
      if (t < 1) { animId = requestAnimationFrame(frame); }
      else       { if (onDone) onDone(); }
    }
    animId = requestAnimationFrame(frame);
  }

  /* Public API – intercept nav link clicks */
  function triggerTransition(targetHref) {
    if (running) return;
    running = true;
    overlay.classList.add('active');
    overlay.style.opacity = '1';

    // Phase 1: wave sweeps IN (covers screen)
    animate(performance.now(), 0, 1, () => {
      // Navigate / scroll to target
      if (targetHref.startsWith('#')) {
        const target = document.querySelector(targetHref);
        if (target) target.scrollIntoView({ behavior: 'instant' });
      }
      // Phase 2: wave sweeps OUT (reveals screen)
      setTimeout(() => {
        animate(performance.now(), 1, 0, () => {
          overlay.style.opacity = '0';
          overlay.classList.remove('active');
          running = false;
        });
      }, 80);
    });
  }

  /* Intercept all internal anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      triggerTransition(href);
    });
  });

  /* Also intercept filter buttons & nav section jumps */
  window._waveTransition = triggerTransition;
}

/* ---------- 3. CURSOR GLOW ---------- */
function initCursorGlow() {
  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  Object.assign(glow.style, {
    position: 'fixed',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,240,255,0.055) 0%, transparent 70%)',
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

/* ---------- 6. SUN / MOON ---------- */
function initCelestial() {
  /* Create a small fixed canvas in the top-right corner */
  const SIZE = 160;
  const canvas = document.createElement('canvas');
  canvas.id = 'celestial-canvas';
  canvas.width  = SIZE;
  canvas.height = SIZE;
  Object.assign(canvas.style, {
    position:      'fixed',
    top:           '72px',
    right:         '24px',
    width:         SIZE + 'px',
    height:        SIZE + 'px',
    zIndex:        '5',
    pointerEvents: 'none',
    opacity:       '0',
    transition:    'opacity 1.8s ease',
  });
  document.body.appendChild(canvas);

  /* Fade in after a short delay */
  setTimeout(() => canvas.style.opacity = '1', 600);

  const ctx   = canvas.getContext('2d');
  const cx    = SIZE / 2;
  const cy    = SIZE / 2;
  const hour  = new Date().getHours();
  const isDay = hour >= 6 && hour < 19;

  let t = 0;

  /* ---- SUN ---- */
  function drawSun() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    const pulse = 1 + 0.025 * Math.sin(t * 0.04);
    const R     = 28 * pulse;

    /* Outer haze */
    const haze = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 3.2);
    haze.addColorStop(0,   'rgba(255,220,60,0.18)');
    haze.addColorStop(0.4, 'rgba(255,160,20,0.09)');
    haze.addColorStop(1,   'rgba(255,100,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, R * 3.2, 0, Math.PI * 2);
    ctx.fillStyle = haze;
    ctx.fill();

    /* Corona glow */
    const corona = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.9);
    corona.addColorStop(0,   'rgba(255,240,120,0.55)');
    corona.addColorStop(0.5, 'rgba(255,180,40,0.25)');
    corona.addColorStop(1,   'rgba(255,120,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.9, 0, Math.PI * 2);
    ctx.fillStyle = corona;
    ctx.fill();

    /* Sun rays */
    const rayCount = 12;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.008);
    for (let i = 0; i < rayCount; i++) {
      const angle  = (i / rayCount) * Math.PI * 2;
      const inner  = R * 1.35;
      const outer  = R * 1.85 + (i % 2 === 0 ? 8 : 0);
      const rayAlpha = 0.3 + 0.15 * Math.sin(t * 0.05 + i);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.strokeStyle = `rgba(255,220,80,${rayAlpha})`;
      ctx.lineWidth   = 2.5;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }
    ctx.restore();

    /* Sun disc */
    const disc = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, 0, cx, cy, R);
    disc.addColorStop(0,   '#fff9c4');
    disc.addColorStop(0.4, '#ffe066');
    disc.addColorStop(0.8, '#ffb300');
    disc.addColorStop(1,   '#ff8c00');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = disc;
    ctx.shadowColor = 'rgba(255,200,0,0.9)';
    ctx.shadowBlur  = 28;
    ctx.fill();
    ctx.shadowBlur  = 0;
  }

  /* ---- MOON ---- */
  function drawMoon() {
    ctx.clearRect(0, 0, SIZE, SIZE);

    const pulse = 1 + 0.015 * Math.sin(t * 0.03);
    const R     = 26 * pulse;

    /* Soft outer glow */
    const glow = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 3.0);
    glow.addColorStop(0,   'rgba(160,200,255,0.15)');
    glow.addColorStop(0.5, 'rgba(100,160,255,0.07)');
    glow.addColorStop(1,   'rgba(80,120,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, R * 3.0, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    /* Crescent: draw full circle then subtract offset circle */
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    const moonGrad = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, 0, cx, cy, R);
    moonGrad.addColorStop(0,   '#e8f4ff');
    moonGrad.addColorStop(0.4, '#c8dfff');
    moonGrad.addColorStop(0.8, '#8aaee0');
    moonGrad.addColorStop(1,   '#6080b8');
    ctx.fillStyle = moonGrad;
    ctx.shadowColor = 'rgba(140,200,255,0.9)';
    ctx.shadowBlur  = 24;
    ctx.fill();
    ctx.shadowBlur  = 0;

    /* Carve crescent shadow */
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx + R * 0.55, cy - R * 0.08, R * 0.82, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
    ctx.restore();

    /* Small stars near moon */
    const starPositions = [
      { x: cx + R * 1.8, y: cy - R * 1.2, r: 1.5 },
      { x: cx + R * 2.4, y: cy + R * 0.4, r: 1.0 },
      { x: cx + R * 1.3, y: cy + R * 1.8, r: 1.2 },
      { x: cx - R * 0.5, y: cy - R * 2.2, r: 0.8 },
      { x: cx + R * 2.8, y: cy - R * 0.8, r: 0.7 },
    ];
    starPositions.forEach((s, i) => {
      const a = 0.5 + 0.5 * Math.sin(t * 0.04 + i * 1.3);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * a, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,230,255,${a * 0.9})`;
      ctx.shadowColor = 'rgba(200,230,255,0.8)';
      ctx.shadowBlur  = 6;
      ctx.fill();
      ctx.shadowBlur  = 0;
    });
  }

  /* Animation loop */
  function loop() {
    if (isDay) drawSun();
    else       drawMoon();
    t++;
    requestAnimationFrame(loop);
  }
  loop();
}

/* ---------- BOOT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initWaveTransition();
  initCursorGlow();
  initAudio();
  initModal();
  initCelestial();
});

