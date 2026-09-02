/**
 * 🐉 BONE DRAGON Cursor — Canvas version
 * Full skeleton dragon that follows your cursor.
 * Head with horns + eye sockets, vertebrae with ribs, wing bones, spiked tail.
 */
(function () {
  'use strict';

  /* ── Canvas ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'dragon-canvas';
  Object.assign(canvas.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',
    zIndex:        '99999',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  /* ── Config ── */
  const N         = 28;      // segments
  const SPEED     = 0.18;    // follow speed
  const WAVE_SPD  = 0.09;    // body wave speed
  const BONE_CLR  = '#D4C99A'; // ivory bone
  const BONE_DIM  = '#A89060'; // darker bone outline
  const GLOW_CLR  = 'rgba(220,200,130,0.35)'; // warm glow

  // Segments with RIBS (vertebra + rib bones)
  const WING_IDX  = [7, 14];  // large wing-like fin spines
  const RIB_EVERY = 2;        // draw ribs every N segments

  /* ── Physics ── */
  const pts  = [];   // { x, y }
  const prev = [];   // previous frame pos for angle smoothing
  let   wave = 0;

  const mouse = { x: -300, y: -300 };
  for (let i = 0; i < N; i++) pts[i] = { x: W / 2, y: H / 2 };
  for (let i = 0; i < N; i++) prev[i] = { x: W / 2, y: H / 2 };

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener('touchmove', e => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }, { passive: true });

  /* ── Helpers ── */
  function setGlow(blur, color) {
    ctx.shadowBlur  = blur;
    ctx.shadowColor = color;
  }
  function clearGlow() { ctx.shadowBlur = 0; }

  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ════════════════════════════
     DRAW FUNCTIONS
  ════════════════════════════ */

  /* HEAD — dragon skull */
  function drawHead(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    setGlow(18, 'rgba(255,230,150,0.7)');

    /* ── Jaw (lower) ── */
    ctx.beginPath();
    ctx.ellipse(2, 8, 13, 5, 0.15, 0, Math.PI * 2);
    ctx.fillStyle   = BONE_CLR;
    ctx.strokeStyle = BONE_DIM;
    ctx.lineWidth   = 0.9;
    ctx.fill(); ctx.stroke();

    // Teeth on jaw
    for (let t = -1; t <= 1; t++) {
      ctx.beginPath();
      ctx.moveTo(t * 6, 11);
      ctx.lineTo(t * 6 - 1.5, 16);
      ctx.lineTo(t * 6 + 1.5, 16);
      ctx.closePath();
      ctx.fillStyle = '#E8DDB0';
      ctx.fill(); ctx.stroke();
    }

    /* ── Skull (upper) ── */
    ctx.beginPath();
    ctx.ellipse(0, -2, 14, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle   = BONE_CLR;
    ctx.strokeStyle = BONE_DIM;
    ctx.lineWidth   = 1;
    ctx.fill(); ctx.stroke();

    /* ── Snout ── */
    ctx.beginPath();
    ctx.ellipse(0, 6, 8, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = BONE_CLR;
    ctx.fill(); ctx.stroke();

    // Top teeth
    for (let t = -1; t <= 1; t++) {
      ctx.beginPath();
      ctx.moveTo(t * 4, 9.5);
      ctx.lineTo(t * 4 - 1.2, 14.5);
      ctx.lineTo(t * 4 + 1.2, 14.5);
      ctx.closePath();
      ctx.fillStyle = '#EDE4BE';
      ctx.fill(); ctx.stroke();
    }

    /* ── Eye sockets ── */
    [-5.5, 5.5].forEach(ex => {
      // socket hole
      ctx.beginPath();
      ctx.ellipse(ex, -3, 4.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fill();
      ctx.strokeStyle = BONE_DIM;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // glowing red pupils
      ctx.beginPath();
      ctx.arc(ex, -3, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220,50,50,0.9)';
      setGlow(10, 'rgba(255,0,0,0.8)');
      ctx.fill();
      clearGlow();
      setGlow(18, 'rgba(255,230,150,0.7)');
    });

    /* ── Horns ── */
    [[-9, -9, -15, -24], [9, -9, 15, -24]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(x1 * 1.6, y1 - 6, x2, y2);
      ctx.lineWidth   = 3.5;
      ctx.strokeStyle = BONE_CLR;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(x1 * 1.6, y1 - 6, x2, y2);
      ctx.lineWidth   = 1.5;
      ctx.strokeStyle = BONE_DIM;
      ctx.stroke();
      // horn tip spike
      ctx.beginPath();
      ctx.arc(x2, y2, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#C8B070';
      ctx.fill();
    });

    /* ── Small crest spikes ── */
    for (let s = -1; s <= 1; s++) {
      ctx.beginPath();
      ctx.moveTo(s * 5, -11);
      ctx.lineTo(s * 5 - 1.5, -18 - Math.abs(s) * 2);
      ctx.lineTo(s * 5 + 1.5, -18 - Math.abs(s) * 2);
      ctx.closePath();
      ctx.fillStyle   = BONE_CLR;
      ctx.strokeStyle = BONE_DIM;
      ctx.lineWidth   = 0.7;
      ctx.fill(); ctx.stroke();
    }

    clearGlow();
    ctx.restore();
  }

  /* VERTEBRA — spine bone with ribs */
  function drawVert(x, y, angle, t, drawRibs) {
    const scale = lerp(1, 0.32, t);   // taper toward tail
    const hw    = 9 * scale;           // half-width of vertebra
    const hh    = 5 * scale;           // half-height

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    setGlow(8, GLOW_CLR);

    /* ── Vertebra body (diamond-ish) ── */
    ctx.beginPath();
    ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
    ctx.fillStyle   = BONE_CLR;
    ctx.strokeStyle = BONE_DIM;
    ctx.lineWidth   = 0.7;
    ctx.fill(); ctx.stroke();

    // Central dot
    ctx.beginPath();
    ctx.arc(0, 0, hh * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = BONE_DIM;
    ctx.fill();

    /* ── Ribs ── */
    if (drawRibs && t < 0.82) {
      const ribLen  = lerp(28, 6, t);
      const ribCurv = lerp(10, 3, t);

      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        // curve outward then downward
        ctx.bezierCurveTo(
          side * ribLen * 0.35, -ribCurv * 0.5,
          side * ribLen * 0.85, ribCurv,
          side * ribLen,        ribCurv * 1.5
        );
        ctx.lineWidth   = lerp(2.2, 0.8, t);
        ctx.strokeStyle = BONE_CLR;
        setGlow(6, GLOW_CLR);
        ctx.stroke();

        // rib tip knob
        ctx.beginPath();
        ctx.arc(side * ribLen, ribCurv * 1.5, lerp(2.5, 1, t), 0, Math.PI * 2);
        ctx.fillStyle = BONE_CLR;
        ctx.fill();
        clearGlow();
        setGlow(8, GLOW_CLR);
      });
    }

    clearGlow();
    ctx.restore();
  }

  /* WING BONE — large fan of spines at shoulder/hip */
  function drawWing(x, y, angle, t) {
    const scale = lerp(1, 0.55, t);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    setGlow(14, 'rgba(220,190,100,0.5)');

    const SPINES = [
      { angle: -0.5, len: 44 * scale },
      { angle: -0.9, len: 60 * scale },
      { angle: -1.3, len: 50 * scale },
      { angle: -1.7, len: 36 * scale },
    ];

    [-1, 1].forEach(side => {
      SPINES.forEach(sp => {
        const a   = sp.angle * side;
        const ex  = Math.cos(a) * sp.len;
        const ey  = Math.sin(a) * sp.len;

        // main spine bone
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ex, ey);
        ctx.lineWidth   = 2.8 * scale;
        ctx.strokeStyle = BONE_CLR;
        ctx.stroke();
        ctx.lineWidth   = 1;
        ctx.strokeStyle = BONE_DIM;
        ctx.stroke();

        // knob at tip
        ctx.beginPath();
        ctx.arc(ex, ey, 2 * scale, 0, Math.PI * 2);
        ctx.fillStyle = BONE_DIM;
        ctx.fill();

        // membrane connectors (thin lines between spines)
        if (sp !== SPINES[SPINES.length - 1]) {
          const nextSp = SPINES[SPINES.indexOf(sp) + 1];
          const na  = nextSp.angle * side;
          const nex = Math.cos(na) * nextSp.len;
          const ney = Math.sin(na) * nextSp.len;
          ctx.beginPath();
          ctx.moveTo(ex * 0.7, ey * 0.7);
          ctx.lineTo(nex * 0.7, ney * 0.7);
          ctx.lineWidth   = 0.6;
          ctx.strokeStyle = `rgba(180,160,90,0.4)`;
          ctx.stroke();
        }
      });
    });

    clearGlow();
    ctx.restore();
  }

  /* TAIL TIP — cluster of spikes */
  function drawTail(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    setGlow(10, GLOW_CLR);

    const spikes = [
      [0, -14, 0], [-5, -10, -0.3], [5, -10, 0.3],
      [-8, -5, -0.6], [8, -5, 0.6],
    ];
    spikes.forEach(([sx, sy, rot]) => {
      ctx.save();
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(sx - 2, sy + 6);
      ctx.lineTo(sx,     sy - 2);
      ctx.lineTo(sx + 2, sy + 6);
      ctx.closePath();
      ctx.fillStyle   = BONE_CLR;
      ctx.strokeStyle = BONE_DIM;
      ctx.lineWidth   = 0.6;
      ctx.fill(); ctx.stroke();
      ctx.restore();
    });

    clearGlow();
    ctx.restore();
  }

  /* ── Main loop ── */
  function animate() {
    requestAnimationFrame(animate);
    wave += WAVE_SPD;

    ctx.clearRect(0, 0, W, H);

    /* Physics: segment 0 chases mouse */
    pts[0].x += (mouse.x - pts[0].x) * 0.36;
    pts[0].y += (mouse.y - pts[0].y) * 0.36;

    for (let i = 1; i < N; i++) {
      /* sine wave grows toward tail */
      const waveOff = Math.sin(wave - i * 0.4) * (i * 0.7);
      pts[i].x += (pts[i - 1].x - pts[i].x) * SPEED;
      pts[i].y += (pts[i - 1].y - pts[i].y) * SPEED + waveOff * 0.04;
    }

    /* Render back → front so head is on top */
    for (let i = N - 1; i >= 0; i--) {
      const p     = pts[i];
      const t     = i / (N - 1);
      const refPt = i > 0 ? pts[i - 1] : { x: p.x + 1, y: p.y };
      const dx    = refPt.x - p.x;
      const dy    = refPt.y - p.y;
      const angle = Math.atan2(dy, dx);

      if (i === 0) {
        drawHead(p.x, p.y, angle);
      } else if (i === N - 1) {
        drawTail(p.x, p.y, angle);
      } else if (WING_IDX.includes(i)) {
        drawWing(p.x, p.y, angle, t);
        drawVert(p.x, p.y, angle, t, true);
      } else {
        drawVert(p.x, p.y, angle, t, i % RIB_EVERY === 0);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animate);
  } else {
    animate();
  }

})();
