/**
 * 🧬 DNA HELIX — 3D animated double helix background
 * Multiple helices scroll across screen with depth-based shading,
 * glowing strands, base pairs, and nucleotide nodes.
 */
(function () {
  'use strict';

  /* ── Canvas ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'dna-canvas';
  Object.assign(canvas.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',
    zIndex:        '-4',
  });
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  /* ── Config ── */
  const HELICES = [
    // { centerY_frac, amplitude, frequency, speed, scaleY, opacity, scrollX }
    { cy: 0.18, amp: 55,  freq: 0.032, speed: 0.28, sy: 0.85, op: 0.28, sx: 0 },
    { cy: 0.55, amp: 80,  freq: 0.026, speed: 0.20, sy: 1.00, op: 0.45, sx: W * 0.3 },
    { cy: 0.82, amp: 45,  freq: 0.038, speed: 0.35, sy: 0.70, op: 0.22, sx: W * 0.6 },
  ];

  const BASE_PAIR_GAP = 22;  // px between base pair ladders
  const NODE_R        = 3.5; // nucleotide node radius
  const STRAND_W      = 2.4; // strand line width

  /* Strand colors */
  const S1 = { h: 195, s: '100%' };   // cyan-blue
  const S2 = { h: 285, s: '100%' };   // purple

  let phase = 0;  // global rotation phase (scrolls the helix)

  /* ════════════════════════════
     DRAW ONE HELIX
  ════════════════════════════ */
  function drawHelix(cfg) {
    const CY   = H * cfg.cy;
    const AMP  = cfg.amp;
    const FREQ = cfg.freq;
    const OP   = cfg.op;

    // Number of steps across screen width
    const STEPS = Math.ceil(W / 4) + 40;

    // Build point arrays for both strands
    const s1pts = [], s2pts = [];
    for (let i = 0; i < STEPS; i++) {
      const x   = i * 4 - 20;
      const ang = x * FREQ + phase * cfg.speed;

      const y1 = CY + Math.sin(ang) * AMP;
      const y2 = CY + Math.sin(ang + Math.PI) * AMP;
      const z1 = Math.cos(ang);           // depth: -1 (back) to +1 (front)
      const z2 = Math.cos(ang + Math.PI);

      s1pts.push({ x, y: y1, z: z1 });
      s2pts.push({ x, y: y2, z: z2 });
    }

    /* ── Draw base pairs (connecting rungs) ── */
    const step = Math.round(BASE_PAIR_GAP / 4);
    for (let i = step; i < STEPS - step; i += step) {
      const p1 = s1pts[i], p2 = s2pts[i];

      // Only draw when strands are "facing" (both near mid-crossing)
      const crossFade = Math.abs(p1.z) < 0.92 ? 1 - Math.abs(p1.z) * 0.3 : 0;
      if (crossFade <= 0) continue;

      const pairAlpha = OP * crossFade * 0.7;

      // Rung line
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth   = 1.2;
      ctx.strokeStyle = `rgba(180,220,255,${pairAlpha})`;
      ctx.stroke();

      // Nucleotide nodes on each end of rung
      const colors = [
        ['rgba(0,220,255,',   'rgba(0,150,255,'],   // Adenine: cyan
        ['rgba(255,100,200,', 'rgba(200,0,200,'],   // Thymine: pink
        ['rgba(100,255,150,', 'rgba(0,200,100,'],   // Guanine: green
        ['rgba(255,200,0,',   'rgba(200,130,0,'],   // Cytosine: yellow
      ];
      const pair = colors[Math.floor(i / step) % colors.length];

      drawNode(p1.x, p1.y, p1.z, OP, pair[0], pair[1]);
      drawNode(p2.x, p2.y, p2.z, OP, pair[1], pair[0]);
    }

    /* ── Draw strands ── */
    drawStrand(s1pts, S1, OP);
    drawStrand(s2pts, S2, OP);
  }

  function drawStrand(pts, color, baseOp) {
    // Draw back segments first, front on top (painter's algorithm)
    // Split into continuous visible segments grouped by z
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      const z   = (p0.z + p1.z) / 2;
      const dep = (z + 1) / 2;           // 0 (back) → 1 (front)
      const lum = Math.round(20 + dep * 80);
      const alp = baseOp * (0.25 + dep * 0.75);
      const w   = STRAND_W * (0.4 + dep * 0.8);

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineWidth   = w;
      ctx.strokeStyle = `hsla(${color.h},${color.s},${lum}%,${alp})`;
      ctx.shadowBlur  = dep > 0.6 ? 10 : 0;
      ctx.shadowColor = `hsla(${color.h},100%,70%,${alp * 0.6})`;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  function drawNode(x, y, z, baseOp, c1, c2) {
    const dep = (z + 1) / 2;
    const r   = NODE_R * (0.4 + dep * 0.9);
    const alp = baseOp * (0.3 + dep * 0.7);

    // Outer glow
    ctx.beginPath();
    ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = c1 + alp * 0.25 + ')';
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle   = c1 + alp + ')';
    ctx.shadowBlur  = dep > 0.5 ? 12 : 0;
    ctx.shadowColor = c2 + alp + ')';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Highlight
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.3, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alp * 0.7})`;
    ctx.fill();
  }

  /* ════════════════════════════
     ANIMATION LOOP
  ════════════════════════════ */
  function animate() {
    requestAnimationFrame(animate);
    phase += 0.022;  // global scroll speed

    ctx.clearRect(0, 0, W, H);

    HELICES.forEach(cfg => drawHelix(cfg));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animate);
  } else {
    animate();
  }

})();
