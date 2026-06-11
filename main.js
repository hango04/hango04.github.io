/* ============================================================
   main.js – Premium Immersive Effects v3.0
   Ngô Mạnh Hà Portfolio
   - Nebula / Starfield background
   - Neon rain particles
   - Ocean wave (bottom)
   - Lightning strikes
   - Floating light orbs
   - Cursor trail + glow
   - Ripple page transition
   - Audio chime
   - Modal
   ============================================================ */

/* ---------- UTILITY ---------- */
const $ = id => document.getElementById(id);
const rand = (a, b) => Math.random() * (b - a) + a;
const randInt = (a, b) => Math.floor(rand(a, b + 1));

/* ============================================================
   1. NEBULA STARFIELD (bg-canvas)
   ============================================================ */
function initNebula() {
  const canvas = $('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* -- Stars -- */
  const STAR_COUNT = 220;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: rand(0, 1), y: rand(0, 1),
    r: rand(0.3, 1.6),
    alpha: rand(0.2, 0.9),
    flicker: rand(0.003, 0.012),
    phase: rand(0, Math.PI * 2),
  }));

  /* -- Nebula blobs -- */
  const blobs = [
    { cx: 0.15, cy: 0.20, rx: 0.30, ry: 0.22, color: 'rgba(0,200,255,', base: 0.06 },
    { cx: 0.75, cy: 0.65, rx: 0.28, ry: 0.20, color: 'rgba(180,0,255,', base: 0.05 },
    { cx: 0.50, cy: 0.40, rx: 0.40, ry: 0.28, color: 'rgba(30,0,80,',   base: 0.08 },
    { cx: 0.85, cy: 0.10, rx: 0.22, ry: 0.18, color: 'rgba(0,255,140,', base: 0.04 },
  ];

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Nebula blobs */
    blobs.forEach(b => {
      const pulse = b.base + Math.sin(t * 0.0006 + b.cx * 5) * 0.02;
      const grd = ctx.createRadialGradient(
        b.cx * W, b.cy * H, 0,
        b.cx * W, b.cy * H, b.rx * W
      );
      grd.addColorStop(0, b.color + (pulse * 2.2) + ')');
      grd.addColorStop(0.5, b.color + pulse + ')');
      grd.addColorStop(1, b.color + '0)');
      ctx.save();
      ctx.scale(1, b.ry / b.rx);
      ctx.beginPath();
      ctx.arc(b.cx * W, (b.cy * H) * (b.rx / b.ry), b.rx * W, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    });

    /* Stars */
    stars.forEach(s => {
      const a = s.alpha * (0.6 + 0.4 * Math.sin(t * s.flicker + s.phase));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,230,255,${a})`;
      ctx.fill();
    });

    t++;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ============================================================
   2. NEON RAIN (rain-canvas)
   ============================================================ */
function initRain() {
  const canvas = $('rain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const RAIN_COLORS = [
    'rgba(0,240,255,',
    'rgba(189,0,255,',
    'rgba(0,240,255,',
    'rgba(100,200,255,',
  ];

  const COUNT = Math.min(Math.floor(window.innerWidth / 14), 90);
  const drops = Array.from({ length: COUNT }, () => ({
    x: rand(0, window.innerWidth),
    y: rand(-window.innerHeight, 0),
    len: rand(18, 80),
    speed: rand(8, 22),
    alpha: rand(0.05, 0.35),
    color: RAIN_COLORS[randInt(0, RAIN_COLORS.length - 1)],
    width: rand(0.5, 1.8),
  }));

  function drawRain() {
    ctx.clearRect(0, 0, W, H);
    drops.forEach(d => {
      const grad = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.len);
      grad.addColorStop(0, d.color + '0)');
      grad.addColorStop(0.6, d.color + d.alpha + ')');
      grad.addColorStop(1, d.color + (d.alpha * 1.5) + ')');
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x, d.y + d.len);
      ctx.strokeStyle = grad;
      ctx.lineWidth = d.width;
      ctx.shadowColor = d.color + '0.8)';
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;

      d.y += d.speed;
      if (d.y > H + d.len) {
        d.y = rand(-200, -50);
        d.x = rand(0, W);
      }
    });
    requestAnimationFrame(drawRain);
  }
  drawRain();
}

/* ============================================================
   3. OCEAN WAVES (wave-bottom-canvas)
   ============================================================ */
function initOceanWaves() {
  const canvas = $('ocean-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = 220;
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;

  const WAVE_LAYERS = [
    { amp: 28, freq: 1.8, speed: 0.018, color: 'rgba(0,240,255,0.07)', yOffset: 0.40 },
    { amp: 20, freq: 2.6, speed: 0.024, color: 'rgba(0,180,255,0.09)', yOffset: 0.55 },
    { amp: 14, freq: 3.4, speed: 0.030, color: 'rgba(189,0,255,0.06)', yOffset: 0.68 },
    { amp: 10, freq: 4.2, speed: 0.038, color: 'rgba(0,240,255,0.12)', yOffset: 0.80 },
  ];

  function drawOcean() {
    ctx.clearRect(0, 0, W, H);

    WAVE_LAYERS.forEach(layer => {
      const baseY = H * layer.yOffset;
      ctx.beginPath();
      ctx.moveTo(0, H);

      for (let x = 0; x <= W; x += 3) {
        const y = baseY + Math.sin(x * layer.freq / W * Math.PI * 2 + t * layer.speed * 60) * layer.amp
                        + Math.sin(x * layer.freq * 1.7 / W * Math.PI * 2 - t * layer.speed * 40) * (layer.amp * 0.4);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(W, H);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, baseY - layer.amp, 0, H);
      grad.addColorStop(0, layer.color.replace(/[\d.]+\)$/, '0)'));
      grad.addColorStop(0.3, layer.color);
      grad.addColorStop(1, layer.color.replace(/[\d.]+\)$/, '0.18)'));
      ctx.fillStyle = grad;
      ctx.fill();

      /* Glowing crest line */
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const y = baseY + Math.sin(x * layer.freq / W * Math.PI * 2 + t * layer.speed * 60) * layer.amp
                        + Math.sin(x * layer.freq * 1.7 / W * Math.PI * 2 - t * layer.speed * 40) * (layer.amp * 0.4);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = layer.color.replace(/[\d.]+\)$/, '0.6)');
      ctx.lineWidth = 1.5;
      ctx.shadowColor = layer.color.replace(/[\d.]+\)$/, '1)');
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    t++;
    requestAnimationFrame(drawOcean);
  }
  drawOcean();
}

/* ============================================================
   4. LIGHTNING STRIKES
   ============================================================ */
function initLightning() {
  const canvas = $('lightning-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let bolts = [];
  let nextStrike = Date.now() + rand(4000, 12000);

  function createBolt(sx, sy) {
    const pts = [{ x: sx, y: sy }];
    let cx = sx, cy = sy;
    const segments = randInt(12, 24);
    for (let i = 0; i < segments; i++) {
      cx += rand(-60, 60);
      cy += rand(30, 70);
      pts.push({ x: cx, y: cy });
      /* branches */
      if (Math.random() < 0.35) {
        pts.push({ x: cx + rand(-80, 80), y: cy + rand(20, 60) });
        pts.push({ x: cx, y: cy }); /* return to trunk */
      }
    }
    return { pts, alpha: 1.0, life: 0, maxLife: randInt(6, 12) };
  }

  function drawBolt(b) {
    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.beginPath();
    ctx.moveTo(b.pts[0].x, b.pts[0].y);
    b.pts.forEach(p => ctx.lineTo(p.x, p.y));

    /* Outer glow */
    ctx.strokeStyle = 'rgba(180,220,255,0.4)';
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(100,180,255,1)';
    ctx.shadowBlur = 30;
    ctx.stroke();

    /* Core */
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    const now = Date.now();

    /* Trigger new bolt */
    if (now >= nextStrike) {
      const sx = rand(W * 0.1, W * 0.9);
      bolts.push(createBolt(sx, 0));
      nextStrike = now + rand(5000, 18000);

      /* Flash screen */
      const flash = document.getElementById('lightning-flash');
      if (flash) {
        flash.style.opacity = '0.12';
        setTimeout(() => flash.style.opacity = '0', 80);
        setTimeout(() => { flash.style.opacity = '0.07'; setTimeout(() => flash.style.opacity = '0', 50); }, 120);
      }
    }

    bolts = bolts.filter(b => b.life < b.maxLife);
    bolts.forEach(b => {
      b.life++;
      b.alpha = 1 - b.life / b.maxLife;
      drawBolt(b);
    });

    requestAnimationFrame(loop);
  }
  loop();
}

/* ============================================================
   5. FLOATING LIGHT ORBS
   ============================================================ */
function initOrbs() {
  const container = document.getElementById('orbs-container');
  if (!container) return;

  const ORB_CONFIG = [
    { size: 320, color: 'rgba(0,240,255,0.055)', duration: 18, delay: 0 },
    { size: 260, color: 'rgba(189,0,255,0.05)',  duration: 22, delay: 3 },
    { size: 200, color: 'rgba(0,255,140,0.04)',  duration: 15, delay: 7 },
    { size: 180, color: 'rgba(0,180,255,0.045)', duration: 26, delay: 1 },
    { size: 140, color: 'rgba(255,100,200,0.04)',duration: 20, delay: 5 },
  ];

  ORB_CONFIG.forEach(cfg => {
    const orb = document.createElement('div');
    orb.className = 'floating-orb';
    const startX = rand(5, 90);
    const startY = rand(5, 85);
    Object.assign(orb.style, {
      width: cfg.size + 'px',
      height: cfg.size + 'px',
      background: `radial-gradient(circle, ${cfg.color} 0%, transparent 70%)`,
      left: startX + '%',
      top: startY + '%',
      animationDuration: cfg.duration + 's',
      animationDelay: '-' + cfg.delay + 's',
    });
    container.appendChild(orb);
  });
}

/* ============================================================
   6. CURSOR TRAIL + GLOW
   ============================================================ */
function initCursorTrail() {
  /* Glow blob that follows cursor */
  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  Object.assign(glow.style, {
    position: 'fixed',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,240,255,0.065) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: '1',
    transform: 'translate(-50%,-50%)',
    transition: 'left 0.1s ease, top 0.1s ease',
    mixBlendMode: 'screen',
  });
  document.body.appendChild(glow);

  /* Trail dots */
  const TRAIL_LEN = 20;
  const trail = [];
  for (let i = 0; i < TRAIL_LEN; i++) {
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position: 'fixed',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '1',
      transform: 'translate(-50%,-50%)',
      opacity: '0',
      transition: 'none',
      mixBlendMode: 'screen',
    });
    document.body.appendChild(dot);
    trail.push({ el: dot, x: 0, y: 0 });
  }

  let mouseX = 0, mouseY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.left = mouseX + 'px';
    glow.style.top  = mouseY + 'px';
  });

  let trailPoints = Array(TRAIL_LEN).fill({ x: 0, y: 0 });

  function animateTrail() {
    trailPoints = [{ x: mouseX, y: mouseY }, ...trailPoints.slice(0, -1)];
    trail.forEach((t, i) => {
      const pt = trailPoints[i];
      const ratio = 1 - i / TRAIL_LEN;
      const size = ratio * 10 + 2;
      Object.assign(t.el.style, {
        left: pt.x + 'px',
        top: pt.y + 'px',
        width: size + 'px',
        height: size + 'px',
        opacity: (ratio * 0.7).toString(),
        background: i < TRAIL_LEN / 2
          ? `rgba(0,240,255,${ratio * 0.8})`
          : `rgba(189,0,255,${ratio * 0.5})`,
        boxShadow: `0 0 ${size * 2}px rgba(0,240,255,${ratio * 0.5})`,
      });
    });
    requestAnimationFrame(animateTrail);
  }
  animateTrail();
}

/* ============================================================
   7. RIPPLE TRANSITION (replaces wave overlay)
   ============================================================ */
function initRippleTransition() {
  const canvas = $('wave-canvas');
  if (!canvas) return;

  /* Keep wave overlay for DOM compat but use ripple instead */
  const overlay = $('wave-overlay');
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let running = false;

  function rippleTransition(targetHref, originX, originY) {
    if (running) return;
    running = true;
    overlay.classList.add('active');

    const maxR = Math.sqrt(Math.pow(Math.max(originX, W - originX), 2) + Math.pow(Math.max(originY, H - originY), 2));
    let r = 0;
    let phase = 'expand';

    function drawRipple() {
      ctx.clearRect(0, 0, W, H);

      if (phase === 'expand') {
        /* Dark circle expanding from click point */
        ctx.save();
        ctx.beginPath();
        ctx.arc(originX, originY, r, 0, Math.PI * 2);

        const grd = ctx.createRadialGradient(originX, originY, 0, originX, originY, r);
        grd.addColorStop(0, 'rgba(0,8,24,0.98)');
        grd.addColorStop(0.7, 'rgba(0,30,60,0.96)');
        grd.addColorStop(0.9, 'rgba(0,60,120,0.85)');
        grd.addColorStop(1, 'rgba(0,200,255,0.0)');
        ctx.fillStyle = grd;
        ctx.fill();

        /* Neon ring at edge */
        ctx.beginPath();
        ctx.arc(originX, originY, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,240,255,${0.9 * (1 - r / maxR) + 0.1})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(0,240,255,1)';
        ctx.shadowBlur = 24;
        ctx.stroke();
        ctx.restore();

        r += maxR / 28;
        if (r >= maxR) {
          phase = 'hold';
          /* Scroll */
          if (targetHref && targetHref.startsWith('#')) {
            const target = document.querySelector(targetHref);
            if (target) target.scrollIntoView({ behavior: 'instant' });
          }
          setTimeout(() => { phase = 'contract'; r = maxR; }, 80);
        }
      } else if (phase === 'contract') {
        ctx.fillStyle = 'rgba(0,8,24,0.98)';
        ctx.fillRect(0, 0, W, H);

        /* Contracting reveal ring */
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(originX, originY, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();
        ctx.restore();

        /* Ring glow */
        ctx.save();
        ctx.beginPath();
        ctx.arc(originX, originY, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,240,255,${r / maxR * 0.8})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(0,240,255,1)';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.restore();

        r -= maxR / 22;
        if (r <= 0) {
          ctx.clearRect(0, 0, W, H);
          overlay.classList.remove('active');
          overlay.style.opacity = '0';
          running = false;
          return;
        }
      }

      requestAnimationFrame(drawRipple);
    }

    overlay.style.opacity = '1';
    requestAnimationFrame(drawRipple);
  }

  /* Intercept nav links */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const rect = a.getBoundingClientRect();
      const ox = rect.left + rect.width / 2;
      const oy = rect.top + rect.height / 2;
      rippleTransition(href, ox, oy);
    });
  });

  window._rippleTransition = rippleTransition;
}

/* ============================================================
   8. AUDIO CHIME
   ============================================================ */
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
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch(e) {}
  }

  document.querySelectorAll('.btn, .btn-icon, .filter-btn').forEach(el => {
    el.addEventListener('click', playChime);
  });
}

/* ============================================================
   9. MODAL
   ============================================================ */
function initModal() {
  const modal   = $('project-modal');
  const closeBtn = $('modal-close');
  if (!modal) return;

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNebula();
  initRain();
  initOceanWaves();
  initLightning();
  initOrbs();
  initCursorTrail();
  initRippleTransition();
  initAudio();
  initModal();
});
