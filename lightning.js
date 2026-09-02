/**
 * ⚡ Lightning Strike Effect v2 — Hango Portfolio
 * Multi-layer glow, impact flash, particle sparks
 */
(function () {
  'use strict';

  const settings = {
    maxStrikes:    4,
    spawnRate:     0.022,
    stepSpeed:     0.06,
    branchChance:  0.35,
    maxDepth:      3,
    segMin:        8,
    segMax:        18,
    jaggedness:    0.45,
    fadeSpeed:     0.03,
  };

  /* ── Canvas ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'lightning-canvas';
  Object.assign(canvas.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',
    zIndex:        '2',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  /* ── Helpers ── */
  function buildPath(x1, y1, x2, y2, segs, jag) {
    const pts = [{ x: x1, y: y1 }];
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      const mx = x1 + dx * t, my = y1 + dy * t;
      const px = -dy / len, py = dx / len;
      const off = (Math.random() - 0.5) * 2 * jag * len / segs;
      pts.push({ x: mx + px * off, y: my + py * off });
    }
    pts.push({ x: x2, y: y2 });
    return pts;
  }

  function makeBranches(pts, depth) {
    if (depth <= 0 || pts.length < 3) return [];
    const out = [];
    for (let i = 1; i < pts.length - 1; i++) {
      if (Math.random() < settings.branchChance / depth) {
        const o = pts[i], e = pts[pts.length - 1];
        const bx = o.x + (e.x - o.x) * (0.2 + Math.random() * 0.5) + (Math.random() - 0.5) * 150;
        const by = o.y + (e.y - o.y) * (0.2 + Math.random() * 0.5) + (Math.random() - 0.5) * 150;
        const seg = Math.max(3, Math.floor(Math.random() * 5) + 3);
        const bpts = buildPath(o.x, o.y, bx, by, seg, settings.jaggedness * 0.6);
        out.push({ pts: bpts, progress: 0, depth, children: makeBranches(bpts, depth - 1) });
      }
    }
    return out;
  }

  function spawnBolt() {
    let x1, y1, x2, y2;
    if (Math.random() < 0.8) {
      x1 = W * (0.05 + Math.random() * 0.9);
      y1 = 0;
      x2 = x1 + (Math.random() - 0.5) * W * 0.5;
      y2 = H * (0.25 + Math.random() * 0.65);
    } else {
      const left = Math.random() < 0.5;
      x1 = left ? 0 : W;
      y1 = H * Math.random() * 0.6;
      x2 = W * (0.25 + Math.random() * 0.5);
      y2 = H * (0.3 + Math.random() * 0.6);
    }
    const segs = settings.segMin + Math.floor(Math.random() * (settings.segMax - settings.segMin));
    const pts = buildPath(x1, y1, x2, y2, segs, settings.jaggedness);
    return {
      pts,
      progress: 0,
      fade: 1,
      done: false,
      branches: makeBranches(pts, settings.maxDepth),
      sparks: [],
      flashed: false,
    };
  }

  /* ── Draw one stroke with multi-layer glow ── */
  function drawPath(pts, progress, alpha, width, color) {
    if (pts.length < 2) return;
    const total = pts.length - 1;
    const upTo = Math.floor(progress * total);
    const frac = progress * total - upTo;

    function trace() {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i <= upTo && i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      if (upTo < pts.length - 1 && frac > 0) {
        const a = pts[upTo], b = pts[upTo + 1];
        ctx.lineTo(a.x + (b.x - a.x) * frac, a.y + (b.y - a.y) * frac);
      }
      ctx.stroke();
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Layer 1 — wide outer glow (electric blue-purple)
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = 60;
    ctx.shadowColor = 'rgba(80, 160, 255, 1)';
    ctx.strokeStyle = 'rgba(40, 100, 255, 0.3)';
    ctx.lineWidth = width * 6;
    trace();

    // Layer 2 — mid glow (cyan)
    ctx.shadowBlur = 30;
    ctx.shadowColor = 'rgba(150, 230, 255, 1)';
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
    ctx.lineWidth = width * 2.5;
    trace();

    // Layer 3 — bright white-blue core
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(255,255,255,1)';
    ctx.strokeStyle = 'rgba(220, 240, 255, 1)';
    ctx.lineWidth = width * 0.7;
    trace();

    ctx.restore();
  }

  /* ── Impact glow at endpoint ── */
  function drawImpact(x, y, alpha) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const r = ctx.createRadialGradient(x, y, 0, x, y, 80);
    r.addColorStop(0, `rgba(200, 230, 255, ${alpha * 0.9})`);
    r.addColorStop(0.3, `rgba(80, 160, 255, ${alpha * 0.5})`);
    r.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = r;
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ── Sparks ── */
  function spawnSparks(x, y) {
    const sparks = [];
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        size: 1 + Math.random() * 2.5,
      });
    }
    return sparks;
  }

  function updateDrawSparks(sparks, alpha) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const s of sparks) {
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.12; // gravity
      s.life -= 0.045;
      if (s.life <= 0) continue;
      const a = s.life * alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 220, 255, ${a})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(100,180,255,1)';
      ctx.fill();
    }
    ctx.restore();
    return sparks.filter(s => s.life > 0);
  }

  /* ── Advance bolt ── */
  function advance(bolt) {
    if (!bolt.done) {
      bolt.progress = Math.min(1, bolt.progress + settings.stepSpeed);
      if (bolt.progress >= 1 && !bolt.flashed) {
        bolt.flashed = true;
        const end = bolt.pts[bolt.pts.length - 1];
        bolt.sparks = spawnSparks(end.x, end.y);
        // brief screen flash
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(100, 160, 255, 0.07)';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
      if (bolt.progress >= 1) bolt.done = true;
    } else {
      bolt.fade = Math.max(0, bolt.fade - settings.fadeSpeed);
    }
    for (const br of bolt.branches) {
      if (bolt.progress > 0.15) br.progress = Math.min(1, br.progress + settings.stepSpeed * 0.8);
      for (const ch of br.children || []) {
        if (br.progress > 0.2) ch.progress = Math.min(1, ch.progress + settings.stepSpeed * 0.65);
      }
    }
  }

  function drawBranches(branches, parentAlpha) {
    for (const br of branches) {
      const w = Math.max(0.5, 1.8 / br.depth);
      drawPath(br.pts, br.progress, parentAlpha * 0.65, w, null);
      if (br.children) drawBranches(br.children, parentAlpha * 0.5);
    }
  }

  /* ── Main loop ── */
  let bolts = [];

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);

    if (bolts.length < settings.maxStrikes && Math.random() < settings.spawnRate) {
      bolts.push(spawnBolt());
    }

    bolts = bolts.filter(b => b.fade > 0);
    for (const bolt of bolts) {
      advance(bolt);
      drawPath(bolt.pts, bolt.progress, bolt.fade, 2.5, null);
      drawBranches(bolt.branches, bolt.fade);
      if (bolt.done) {
        const end = bolt.pts[bolt.pts.length - 1];
        drawImpact(end.x, end.y, bolt.fade * 0.8);
        bolt.sparks = updateDrawSparks(bolt.sparks, bolt.fade);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animate);
  } else {
    animate();
  }
})();
