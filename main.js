/* ============================================================
   main.js – Premium Immersive Interactions v8.0 (Flame Blue AI style)
   Ngô Mạnh Hà Portfolio
   ============================================================ */

// Global config for interactive tweaks from Secret Admin Panel
window._particleConfig = {
  count: 35,
  speed: 1.0,
  grassOnline: true,
  dawnOnline: true
};

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

  // Get colors dynamically from CSS variables to support color themes
  function getThemeColors() {
    const styles = getComputedStyle(document.body);
    const primaryRGB = (styles.getPropertyValue('--color-primary-rgb') || '0, 82, 255').trim();
    const secondaryRGB = (styles.getPropertyValue('--color-secondary-rgb') || '0, 194, 255').trim();
    return {
      particleColors: [
        `rgba(${primaryRGB},`,
        `rgba(${secondaryRGB},`,
        `rgba(${primaryRGB},`
      ],
      connectionColor: `rgba(${primaryRGB},`,
      mouseConnectionColor: `rgba(${secondaryRGB},`
    };
  }

  let themeColors = getThemeColors();

  // Observe theme changes to update particle colors instantly
  const themeObserver = new MutationObserver(() => {
    themeColors = getThemeColors();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * w;
      this.y = init ? Math.random() * h : h + 10;
      this.r = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.12 * window._particleConfig.speed;
      this.vy = -(Math.random() * 0.18 + 0.05) * window._particleConfig.speed;
      this.alpha = Math.random() * 0.4 + 0.15;
      this.colorIndex = Math.floor(Math.random() * 3);
      this.life = 0;
      this.maxLife = Math.random() * 600 + 400;
    }
    update() {
      // Apply live speed multiplier
      this.x += this.vx * window._particleConfig.speed;
      this.y += this.vy * window._particleConfig.speed;
      this.life++;
      if (this.life > this.maxLife || this.y < -10 || this.x < -10 || this.x > w + 10) {
        this.reset(false);
      }
    }
    draw() {
      const currentAlpha = this.alpha * Math.sin((this.life / this.maxLife) * Math.PI);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = themeColors.particleColors[this.colorIndex] + currentAlpha + ')';
      ctx.fill();
    }
  }

  // Initial load
  for (let i = 0; i < window._particleConfig.count; i++) particles.push(new Particle());

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
    const maxDist = 95;
    const maxDistSq = maxDist * maxDist;
    const mouseMaxDist = 125;
    const mouseMaxDistSq = mouseMaxDist * mouseMaxDist;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const alpha = (1 - dist / maxDist) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = themeColors.connectionColor + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      if (mouse.x !== null) {
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mdistSq = mdx * mdx + mdy * mdy;
        if (mdistSq < mouseMaxDistSq) {
          const mdist = Math.sqrt(mdistSq);
          const malpha = (1 - mdist / mouseMaxDist) * 0.09;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = themeColors.mouseConnectionColor + malpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  (function loop() {
    // Dynamic particle count adjustments via Admin Panel
    if (particles.length < window._particleConfig.count) {
      for (let i = particles.length; i < window._particleConfig.count; i++) particles.push(new Particle());
    } else if (particles.length > window._particleConfig.count) {
      particles.splice(window._particleConfig.count);
    }

    ctx.clearRect(0, 0, w, h);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
}

/* ---------- 2. SLEEK PAGE TRANSITION (Top Progress Bar + Crossfade) ---------- */
function initPageTransition() {
  let bar = document.getElementById('top-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'top-progress-bar';
    document.body.appendChild(bar);
  }

  let running = false;

  function triggerTransition(targetHref) {
    if (running) return;
    running = true;

    bar.classList.add('active');
    bar.style.width = '30%';
    document.body.classList.add('page-transitioning');

    setTimeout(() => {
      bar.style.width = '70%';

      setTimeout(() => {
        bar.style.width = '100%';

        if (targetHref.startsWith('#')) {
          const target = document.querySelector(targetHref);
          if (target) target.scrollIntoView({ behavior: 'instant' });
        }

        document.body.classList.remove('page-transitioning');

        setTimeout(() => {
          bar.classList.remove('active');
          bar.style.width = '0%';
          running = false;
        }, 300);
      }, 150);
    }, 150);
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
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch(e) {}
  }

  document.body.addEventListener('click', e => {
    if (e.target.closest('.btn, .btn-icon, .filter-btn, .choice-btn, #chatbot-toggle, .theme-btn, #monitor-toggle')) {
      playChime();
    }
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
    
    if (window._matlabSimId) {
      cancelAnimationFrame(window._matlabSimId);
      window._matlabSimId = null;
    }
    if (window._terminalInterval) {
      clearInterval(window._terminalInterval);
      window._terminalInterval = null;
    }
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
      'a, button, input, textarea, select, .project-card, .travel-card, .skills-card, .filter-btn, .timeline-card, .stat-item, .logo, .theme-toggle-btn, .choice-btn, #chatbot-toggle, .theme-btn, #monitor-toggle'
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

  document.body.addEventListener('click', () => {
    setTimeout(updateHoverListeners, 100);
  });
}

/* ---------- 9. 3D GLASS CARDS TILT & GLOW ---------- */
function initGlassCards() {
  const cards = document.querySelectorAll('.glass-card');
  const isHoverSupported = window.matchMedia('(any-hover: hover)').matches;
  if (!isHoverSupported) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      if (card.id === 'chatbot-window' || card.id === 'depin-monitor-widget') return;
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
      if (card.id === 'chatbot-window' || card.id === 'depin-monitor-widget') return;
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
  });
}

/* ---------- 10. INTERACTIVE CHATBOT LOGIC ---------- */
function initChatbot() {
  const toggleBtn = document.getElementById('chatbot-toggle');
  const chatWindow = document.getElementById('chatbot-window');
  const chatMessages = document.getElementById('chatbot-messages');
  const choicesContainer = document.getElementById('chatbot-choices');
  
  // New AI integration elements
  const settingsBtn = document.getElementById('chatbot-settings-btn');
  const settingsPanel = document.getElementById('chatbot-settings-panel');
  const keyInput = document.getElementById('gemini-key-input');
  const saveKeyBtn = document.getElementById('save-gemini-key');
  const textInput = document.getElementById('chatbot-text-input');
  const sendBtn = document.getElementById('chatbot-send-btn');

  if (!toggleBtn || !chatWindow || !chatMessages || !choicesContainer) return;

  let chatHistory = [];

  // Clear old inactive keys from localStorage to force fallback to the new default key
  const currentSavedKey = localStorage.getItem('gemini_api_key');
  if (currentSavedKey && (
    currentSavedKey.trim().startsWith('AQ.Ab8RN6KIOg') || 
    currentSavedKey.trim().startsWith('AQ.Ab8RN6KiOg') ||
    currentSavedKey.trim().startsWith('AQ.Ab8RN6K23B')
  )) {
    localStorage.removeItem('gemini_api_key');
  }

  // Toggle chatbot window open/close
  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    const isClosed = chatWindow.classList.contains('hidden');

    const chatIcon = toggleBtn.querySelector('.chat-icon');
    const closeIcon = toggleBtn.querySelector('.close-icon');

    if (isClosed) {
      chatIcon.style.display = 'block';
      closeIcon.style.display = 'none';
      if (settingsPanel) settingsPanel.classList.add('hidden');
    } else {
      chatIcon.style.display = 'none';
      closeIcon.style.display = 'block';
      scrollToBottom();
    }
  });

  // Toggle settings panel
  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsPanel.classList.toggle('hidden');
      if (!settingsPanel.classList.contains('hidden')) {
        const savedKey = localStorage.getItem('gemini_api_key') || '';
        keyInput.value = savedKey;
      }
    });
  }

  // Save API Key
  if (saveKeyBtn && keyInput) {
    saveKeyBtn.addEventListener('click', () => {
      const key = keyInput.value.trim();
      if (key) {
        localStorage.setItem('gemini_api_key', key);
        showToast('Đã lưu Gemini API Key thành công!');
      } else {
        localStorage.removeItem('gemini_api_key');
        showToast('Đã xóa Gemini API Key.', 'info');
      }
      if (settingsPanel) settingsPanel.classList.add('hidden');
    });
  }

  // Custom static responses for local fallback NLP mode
  const responses = {
    gpm: {
      text: "Mạnh Hà có nhận viết script tự động hóa theo yêu cầu trên **GPM Browser** sử dụng **Node.js, Puppeteer/Playwright**. Các script hỗ trợ tự động cày farm tài khoản, auto airdrop/retroactive, và đồng bộ thao tác đa luồng quy mô lớn giúp tiết kiệm tối đa thời gian. Bạn có thể kết nối Zalo **0334383560** để đặt hàng code nhé!",
      followups: ["drone", "contact"]
    },
    drone: {
      text: "Đồ án Drone là sản phẩm nghiên cứu chuyên sâu về **Thiết kế hệ thống điều khiển cho Robot Drone Vận tải**. Mô hình 3D được thiết kế chuẩn xác trên SolidWorks, viết phương trình toán học động lực học và mô phỏng cân bằng PID trên **MATLAB**. Đồ án đã được đăng thành bài báo khoa học. Bạn có thể nhấp vào phần Dự án để xem mô phỏng PID trực quan nhé!",
      followups: ["gpm", "contact"]
    },
    travel: {
      text: "Mạnh Hà rất yêu thích du lịch trải nghiệm! Một số chuyến đi ấn tượng gần đây của Hà bao gồm:\n- ⛰️ **Hà Giang**: Chinh phục đèo Mã Pí Lèng, sông Nho Quế, cao nguyên đá Đồng Văn.\n- 🛶 **Ninh Bình**: Chèo thuyền ở Tràng An, Tam Cốc, ngắm cảnh núi non hùng vĩ.\n- 🏝️ **Cát Bà**: Trải nghiệm Vịnh Lan Hạ hoang sơ, chèo thuyền Kayak và tận hưởng hải sản.\nBạn có thể cuộn xem phần **Du lịch** trên trang web hoặc click vào liên kết để xem trực tiếp các album ảnh trên Google Drive nhé!",
      followups: ["contact", "main_menu"]
    },
    contact: {
      text: "Bạn có thể liên hệ hợp tác làm việc với tôi qua các kênh trực tiếp sau:\n- 📞 Zalo/SĐT: **0334383560**\n- ✉️ Email: **ngomanhha2004@gmail.com**\n- 🌐 Facebook: [Ngo Ha](https://www.facebook.com/ngo.ha.591196/about)\nTôi thường online và phản hồi ngay lập tức!",
      followups: ["gpm", "gaming"]
    },
    gaming: {
      text: "Haha! Ngoài giờ cày code và MMO thì tôi cũng là một game thủ Đấu Trường Chân Lý (TFT) và Tốc Chiến đấy. Hôm nào muốn làm vài ván giao lưu leo rank thì nhắn Zalo cho tôi nhé! 🎮",
      followups: ["contact", "main_menu"]
    }
  };

  const choiceTexts = {
    gpm: "Hỏi về Script GPM Browser?",
    drone: "Hỏi về Thiết kế Drone?",
    travel: "Hỏi về sở thích Du lịch của Hà?",
    contact: "Làm sao để liên hệ hợp tác?",
    gaming: "Bạn có chơi TFT / Tốc Chiến không?"
  };

  // Local static keyword search response
  function getLocalNLPResponse(msg) {
    const text = msg.toLowerCase();
    
    if (text.includes('chào') || text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('alo') || text.startsWith('chao')) {
      return {
        text: "Xin chào! Tôi là Trợ lý ảo của anh Ngô Mạnh Hà. Bạn cần tôi hỗ trợ thông tin gì về đồ án, viết script GPM Browser hay kết nối công việc?",
        followups: ["gpm", "drone", "contact"]
      };
    }
    if (text.includes('sao vậy') || text.includes('sao thế') || text.includes('lỗi') || text.includes('sao vay') || text.includes('sao the') || text.includes('chạy') || text.includes('chay')) {
      return {
        text: "API Key hệ thống của Mạnh Hà hiện đã hết hạn mức (Quota) miễn phí hôm nay hoặc đang được cấu hình lại. Để kích hoạt AI trò chuyện tự do, bạn hãy nhấn vào bánh răng cài đặt ⚙️ ở trên ô chat để dán Gemini API Key của riêng bạn nhé! Hoặc click nhanh các chủ đề dưới đây:",
        followups: ["gpm", "drone", "contact"]
      };
    }
    if (text.includes('cảm ơn') || text.includes('cám ơn') || text.includes('thank') || text.includes('ok') || text.includes('cảm on')) {
      return {
        text: "Không có gì! Tôi rất vui được hỗ trợ bạn. Nếu có câu hỏi nào khác về robotics hay automation, cứ nhắn tôi nhé!",
        followups: ["contact", "main_menu"]
      };
    }
    if (text.includes('du lịch') || text.includes('du lich') || text.includes('đi chơi') || text.includes('di choi') || text.includes('hà giang') || text.includes('ha giang') || text.includes('ninh bình') || text.includes('ninh binh') || text.includes('cát bà') || text.includes('cat ba') || text.includes('đi phượt') || text.includes('phượt') || text.includes('album') || text.includes('ảnh')) {
      return responses.travel;
    }
    if (text.includes('gpm') || text.includes('script') || text.includes('auto') || text.includes('tool') || text.includes('trình duyệt')) {
      return responses.gpm;
    }
    if (text.includes('drone') || text.includes('robot') || text.includes('simulink') || text.includes('matlab') || text.includes('đồ án') || text.includes('điều khiển')) {
      return responses.drone;
    }
    if (text.includes('liên hệ') || text.includes('zalo') || text.includes('phone') || text.includes('sđt') || text.includes('email') || text.includes('hợp tác') || text.includes('fb') || text.includes('facebook')) {
      return responses.contact;
    }
    if (text.includes('game') || text.includes('tft') || text.includes('tốc chiến') || text.includes('rank') || text.includes('leo')) {
      return responses.gaming;
    }
    if (text.includes('học') || text.includes('trường') || text.includes('thủy lợi') || text.includes('tlu') || text.includes('đại học')) {
      return {
        text: "Ngô Mạnh Hà đã tốt nghiệp chuyên ngành **Kỹ thuật Robot & Điều khiển thông minh** tại **Trường Đại học Thủy Lợi** (Khóa 2022 - 2026). Nền tảng robotics giúp Hà thành thạo SolidWorks, MATLAB Simulink, vi điều khiển (C/C++, Arduino) và hệ thống nhúng.",
        followups: ["drone", "gpm"]
      };
    }
    if (text.includes('quê') || text.includes('sống') || text.includes('ở đâu') || text.includes('địa chỉ') || text.includes('hưng yên') || text.includes('văn lâm')) {
      return {
        text: "Mạnh Hà hiện tại sinh sống và hoạt động tại **Văn Lâm, Hưng Yên, Việt Nam**. Bạn có thể liên hệ Zalo **0334383560** trước để gặp gỡ trao đổi trực tiếp nhé!",
        followups: ["contact", "main_menu"]
      };
    }
    if (text.includes('tiktok') || text.includes('editor') || text.includes('capcut') || text.includes('video') || text.includes('dựng')) {
      return {
        text: "Hà là một **Freelance Video Editor** thành thạo CapCut, Premiere và Photoshop. Hà hiện đang xây dựng một kênh TikTok chia sẻ tiếng Nhật đạt mốc **57.9K followers** và **255.5K lượt thích**!",
        followups: ["contact", "main_menu"]
      };
    }
    return null;
  }

  // Handle Quick Choices Click
  choicesContainer.addEventListener('click', e => {
    const button = e.target.closest('.choice-btn');
    if (!button) return;

    const choice = button.getAttribute('data-choice');
    if (choice === 'main_menu') {
      showMainMenu();
      return;
    }

    const questionText = choiceTexts[choice] || button.innerText;
    processMessageSequence(questionText, () => {
      const res = responses[choice];
      if (res) {
        appendMessage(res.text, 'bot');
        showFollowupChoices(res.followups);
        chatHistory.push({ role: 'user', parts: [{ text: questionText }] });
        chatHistory.push({ role: 'model', parts: [{ text: res.text }] });
        if (chatHistory.length > 10) chatHistory.splice(0, 2);
      } else {
        appendMessage("Xin lỗi, tôi chưa hiểu câu hỏi này.", 'bot');
        showMainMenu();
      }
    });
  });

  // Handle Free text input triggers
  if (textInput && sendBtn) {
    const handleSend = () => {
      const msg = textInput.value.trim();
      if (!msg) return;
      textInput.value = '';

      processMessageSequence(msg, async () => {
        chatHistory.push({ role: 'user', parts: [{ text: msg }] });
        if (chatHistory.length > 10) chatHistory.shift();

        let apiKey = localStorage.getItem('gemini_api_key') || '';

        if (apiKey) {
          // ONLINE MODE: Call Gemini API
          try {
            const systemContext = "Bạn là Trợ lý ảo của anh Ngô Mạnh Hà. Hãy trả lời thân thiện, lịch sự và ngắn gọn bằng tiếng Việt. Hãy giới thiệu và trả lời các thông tin dựa trên hồ sơ của Hà: tốt nghiệp ĐH Thủy Lợi ngành Robotics & Điều khiển thông minh (khoá 2022-2026), 3 năm kinh nghiệm MMO/Crypto/GPM browser script tự động hóa (NodeJS/Puppeteer), có kênh Tiktok CapCut 57.9k followers và 255.5k likes, sống tại Văn Lâm, Hưng Yên. Hà cũng đam mê du lịch phượt và đã khám phá Hà Giang, Ninh Bình, Cát Bà (có các album ảnh Google Drive trên web). Zalo: 0334383560, email: ngomanhha2004@gmail.com, facebook: Ngo Ha. Hãy trả lời khoảng 2-3 câu và luôn trả lời dưới góc nhìn đại diện trợ lý của Hà.";
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: chatHistory,
                systemInstruction: { parts: [{ text: systemContext }] }
              })
            });

            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
              const reply = data.candidates[0].content.parts[0].text;
              appendMessage(reply, 'bot');
              chatHistory.push({ role: 'model', parts: [{ text: reply }] });
              if (chatHistory.length > 10) chatHistory.splice(0, 2);
              
              // Clear choices container during custom AI chat
              choicesContainer.innerHTML = '';
            } else {
              throw new Error('Invalid response payload');
            }
          } catch (err) {
            console.error(err);
            // Fallback to local keyword agent if API fails
            const localRes = getLocalNLPResponse(msg);
            if (localRes) {
              appendMessage(localRes.text, 'bot');
              showFollowupChoices(localRes.followups);
              chatHistory.push({ role: 'model', parts: [{ text: localRes.text }] });
              if (chatHistory.length > 10) chatHistory.splice(0, 2);
            } else {
              appendMessage("Chào bạn! Hiện tại tôi đang hoạt động ở chế độ **Trợ lý tự động** nên chỉ có thể trả lời các chủ đề về Robotics, Đồ án Drone, Script GPM Browser, Thông tin liên hệ, Học tập và Quê quán của Mạnh Hà.\n\nĐể kích hoạt **AI thông minh tự do trò chuyện**, bạn hãy nhấn nút cài đặt **⚙️** ở góc trên ô chat để điền **Gemini API Key** cá nhân nhé! Hoặc chọn nhanh các câu hỏi gợi ý phía dưới:", 'bot');
              showMainMenu();
            }
          }
        } else {
          // OFFLINE FALLBACK MODE: Check local keywords
          const localRes = getLocalNLPResponse(msg);
          if (localRes) {
            appendMessage(localRes.text, 'bot');
            showFollowupChoices(localRes.followups);
            chatHistory.push({ role: 'model', parts: [{ text: localRes.text }] });
            if (chatHistory.length > 10) chatHistory.splice(0, 2);
          } else {
            appendMessage("Chào bạn! Hiện tại tôi đang hoạt động ở chế độ **Trợ lý tự động** nên chỉ có thể trả lời các chủ đề về Robotics, Đồ án Drone, Script GPM Browser, Thông tin liên hệ, Học tập và Quê quán của Mạnh Hà.\n\nĐể kích hoạt **AI thông minh tự do trò chuyện**, bạn hãy nhấn nút cài đặt **⚙️** ở góc trên ô chat để điền **Gemini API Key** cá nhân nhé! Hoặc chọn nhanh các câu hỏi gợi ý phía dưới:", 'bot');
            showMainMenu();
          }
        }
      });
    };

    sendBtn.addEventListener('click', handleSend);
    textInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // Unified animation and scroll helper for messaging
  function processMessageSequence(userMsgText, fetchResponseCallback) {
    appendMessage(userMsgText, 'user');

    choicesContainer.style.pointerEvents = 'none';
    choicesContainer.style.opacity = '0.3';
    if (textInput) textInput.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    
    appendTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      fetchResponseCallback();

      choicesContainer.style.pointerEvents = 'all';
      choicesContainer.style.opacity = '1';
      if (textInput) {
        textInput.disabled = false;
        textInput.focus();
      }
      if (sendBtn) sendBtn.disabled = false;
    }, 1200);
  }

  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    
    // Safety escape HTML, then format bold, italic, inline code, and links
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    let formattedText = escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="text-decoration:underline;color:var(--color-primary);">$1</a>')
      .replace(/^\s*-\s+(.*?)$/gm, '• $1')
      .replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
      <div class="message-bubble">
        ${formattedText}
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
  }

  function appendTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.id = 'chatbot-typing';
    indicatorDiv.className = 'chat-message bot-msg';
    indicatorDiv.innerHTML = `
      <div class="message-bubble typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatMessages.appendChild(indicatorDiv);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('chatbot-typing');
    if (indicator) indicator.remove();
  }

  function showFollowupChoices(followupKeys) {
    choicesContainer.innerHTML = '';
    followupKeys.forEach(key => {
      if (key === 'main_menu') {
        choicesContainer.innerHTML += `<button class="choice-btn" data-choice="main_menu">← Quay lại Menu chính</button>`;
      } else {
        choicesContainer.innerHTML += `<button class="choice-btn" data-choice="${key}">${choiceTexts[key]}</button>`;
      }
    });
  }

  function showMainMenu() {
    choicesContainer.innerHTML = `
      <button class="choice-btn" data-choice="gpm">Hỏi về Script GPM Browser?</button>
      <button class="choice-btn" data-choice="drone">Hỏi về Thiết kế Drone?</button>
      <button class="choice-btn" data-choice="travel">Hỏi về sở thích Du lịch của Hà?</button>
      <button class="choice-btn" data-choice="contact">Làm sao để liên hệ hợp tác?</button>
      <button class="choice-btn" data-choice="gaming">Bạn có chơi TFT / Tốc Chiến không?</button>
    `;
    appendMessage("Bạn muốn tìm hiểu thêm điều gì khác nữa không?", 'bot');
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

/* ---------- 11. INTERACTIVE PROJECT MODAL SHOWCASES ---------- */
function initProjectModals() {
  const droneCard = document.getElementById('project-drone');
  const gpmCard = document.getElementById('project-gpm');
  const tiktokCard = document.getElementById('project-tiktok');
  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');

  if (!modal || !modalBody) return;

  function openModal(htmlContent) {
    modalBody.innerHTML = htmlContent;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  if (droneCard) {
    droneCard.addEventListener('click', e => {
      if (e.target.closest('.btn-icon, a')) return;

      const html = `
        <div class="project-modal-container">
          <div class="matlab-sim-window">
            <div class="sim-header">
              <span>MATLAB Simulink PID Simulation</span>
              <span id="sim-status" style="color:#10b981;">RUNNING...</span>
            </div>
            <canvas id="sim-canvas" class="sim-grid-canvas"></canvas>
          </div>
          <div class="modal-details-col">
            <h3 class="modal-proj-title">Robot Drone Vận Tải - Thiết Kế Hệ Thống Điều Khiển</h3>
            <div class="modal-tech-list">
              <span class="modal-tech-tag">MATLAB</span>
              <span class="modal-tech-tag">SolidWorks</span>
              <span class="modal-tech-tag">PID Control</span>
              <span class="modal-tech-tag">Động lực học</span>
            </div>
            <p class="modal-proj-desc">Bài báo nghiên cứu thiết kế mô phỏng Drone vận chuyển hàng hóa tự cân bằng dưới tác động của gió nhiễu. Sử dụng bộ điều khiển phản hồi vị trí PID tối ưu.</p>
            <div class="modal-action-row">
              <a href="assets/drone_thesis.pdf" target="_blank" class="btn btn-primary">Đọc Toàn Văn PDF</a>
              <a href="https://zalo.me/0334383560" target="_blank" class="btn btn-secondary">Trao Đổi Đồ Án</a>
            </div>
          </div>
        </div>
      `;
      openModal(html);
      runDroneSimulation();
    });
  }

  if (gpmCard) {
    gpmCard.addEventListener('click', e => {
      if (e.target.closest('.btn-icon, a')) return;

      const html = `
        <div class="project-modal-container">
          <div class="terminal-window">
            <div class="terminal-header">
              <div class="terminal-dots">
                <span class="term-dot term-dot-red"></span>
                <span class="term-dot term-dot-yellow"></span>
                <span class="term-dot term-dot-green"></span>
              </div>
              <div class="terminal-title">gpm_automation_farm.js</div>
            </div>
            <div id="modal-terminal-body" class="terminal-body">
              <div class="terminal-line" style="color:#64748b;">[SYSTEM] Ready. Press key to initialize execution...</div>
            </div>
          </div>
          <div class="modal-details-col">
            <h3 class="modal-proj-title">Tự Động Hóa MMO - Viết Script GPM Browser</h3>
            <div class="modal-tech-list">
              <span class="modal-tech-tag">GPM Browser API</span>
              <span class="modal-tech-tag">Puppeteer / JS</span>
              <span class="modal-tech-tag">Proxy Rotation</span>
              <span class="modal-tech-tag">Auto Farming</span>
            </div>
            <p class="modal-proj-desc">Hệ thống kịch bản lập trình chạy đa luồng điều khiển hàng trăm luồng trình duyệt GPM. Tự động hóa điểm danh, claim token, làm airdrop retroactive và tương tác X kiếm tiền ad revenue.</p>
            <div class="modal-action-row">
              <a href="assets/videoscriptgpm.mp4" target="_blank" class="btn btn-primary">Xem Video</a>
              <a href="https://zalo.me/0334383560" target="_blank" class="btn btn-secondary">Đặt Hàng Code Tool</a>
            </div>
          </div>
        </div>
      `;
      openModal(html);
      runTerminalSimulation();
    });
  }

  if (tiktokCard) {
    tiktokCard.addEventListener('click', e => {
      if (e.target.closest('.btn-icon, a')) return;

      const html = `
        <div class="project-modal-container">
          <div class="matlab-sim-window" style="background-color: #0b0214; border-color: rgba(189,0,255,0.25);">
            <div class="sim-header">
              <span style="color: var(--color-secondary);">TikTok Beta Analytics</span>
              <span style="color: #10b981;">LIVE DATABASE</span>
            </div>
            <div style="padding: 24px; text-align: center;">
              <h2 style="font-size: 2.6rem; color: #ffffff; font-family: var(--font-heading); margin-bottom: 4px; text-shadow: 0 0 10px rgba(189,0,255,0.6);">57.9K</h2>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 24px; letter-spacing: 1px;">FOLLOWERS ĐẠT ĐƯỢC</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(189,0,255,0.15); padding: 12px; border-radius: 6px;">
                  <h4 style="color: var(--color-primary); font-size:1.15rem;">255.5K</h4>
                  <p style="font-size: 0.7rem; color: var(--text-muted); font-weight:700;">LƯỢT THÍCH</p>
                </div>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(189,0,255,0.15); padding: 12px; border-radius: 6px;">
                  <h4 style="color: var(--color-primary); font-size:1.15rem;">3.2M+</h4>
                  <p style="font-size: 0.7rem; color: var(--text-muted); font-weight:700;">TỔNG LƯỢT XEM</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-details-col">
            <h3 class="modal-proj-title">Biên Tập Video Ngắn & TikTok (57.9K Followers)</h3>
            <div class="modal-tech-list">
              <span class="modal-tech-tag">CapCut Keyframes</span>
              <span class="modal-tech-tag">Video Editing</span>
              <span class="modal-tech-tag">Algorithm SEO</span>
              <span class="modal-tech-tag">Beta Monetization</span>
            </div>
            <p class="modal-proj-desc">Xây dựng và phát triển kênh sáng tạo video tiếng Nhật đạt 57.9K người theo dõi từ con số 0. Biên tập hiệu ứng keyframe chuyên sâu, phối âm thanh thu hút người nghe.</p>
            <div class="modal-action-row">
              <a href="https://drive.google.com/drive/u/0/folders/1wolWHnV8Jd8WzyQ_hO02gGZpXkKkeL3V" target="_blank" class="btn btn-primary">Xem Kho Drive Video</a>
            </div>
          </div>
        </div>
      `;
      openModal(html);
    });
  }

  function runDroneSimulation() {
    const canvas = document.getElementById('sim-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const setpoint = canvas.height / 2;
    let t = 0;
    const points = [];
    const maxPoints = Math.floor(canvas.width - 60);

    function draw() {
      if (!document.getElementById('sim-canvas')) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#102040';
      ctx.lineWidth = 0.5;
      for (let x = 40; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 30; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(40, setpoint);
      ctx.lineTo(canvas.width - 20, setpoint);
      ctx.stroke();
      ctx.setLineDash([]);

      const zeta = 0.12;
      const wn = 0.28;
      const amplitude = 90;
      const val = setpoint + Math.exp(-zeta * wn * t) * Math.cos(wn * t) * amplitude;

      points.push({ x: 40 + t * 4, y: val });
      if (points.length > maxPoints) points.shift();

      ctx.strokeStyle = '#00c2ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      if (points.length > 0) {
        const last = points[points.length - 1];
        ctx.fillStyle = '#0052ff';
        ctx.beginPath();
        ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(last.x, last.y, 7, 0, Math.PI * 2);
        ctx.stroke();
      }

      t += 0.2;
      window._matlabSimId = requestAnimationFrame(draw);
    }
    window._matlabSimId = requestAnimationFrame(draw);
  }

  function runTerminalSimulation() {
    const termBody = document.getElementById('modal-terminal-body');
    if (!termBody) return;

    const logLines = [
      "[SYSTEM] Loading profile configurations...",
      "[SUCCESS] Loaded 50 active GPM Profiles.",
      "[INFO] Rotating Multi-proxy connectivity...",
      "[SUCCESS] Proxy rotation successful. IP: 14.226.92.10",
      "[SYSTEM] Booting Puppeteer instances (threads: 4)...",
      "[INFO] Thread-01 (Profile_Zalo) launched on tab 1.",
      "[INFO] Thread-02 (Profile_TikTok) launched on tab 2.",
      "[PROCESS] Thread-01 navigating to target portal...",
      "[PROCESS] Execution sequence: claiming Dogs Airdrop retroactive...",
      "[SUCCESS] Thread-01: Claimed 51,200 DOGS successfully.",
      "[PROCESS] Thread-02 navigating to X Ads Revenue dashboard...",
      "[SUCCESS] Thread-02: Scraped Ads metrics. Revenue status: PAID.",
      "[INFO] Executing follow-up farm algorithms...",
      "[INFO] Sequence completed. Launching sleep cycle (300s)...",
      "[SYSTEM] Thread sleep active. Logging closed."
    ];

    let currentLine = 0;
    termBody.innerHTML = '';

    window._terminalInterval = setInterval(() => {
      if (!document.getElementById('modal-terminal-body')) {
        clearInterval(window._terminalInterval);
        return;
      }

      const lineDiv = document.createElement('div');
      lineDiv.className = 'terminal-line';
      
      let text = logLines[currentLine];
      if (text.startsWith("[SUCCESS]")) {
        lineDiv.style.color = '#39ff14';
      } else if (text.startsWith("[SYSTEM]")) {
        lineDiv.style.color = '#00c2ff';
      } else if (text.startsWith("[INFO]")) {
        lineDiv.style.color = '#94a3b8';
      } else if (text.startsWith("[PROCESS]")) {
        lineDiv.style.color = '#bd00ff';
      }

      lineDiv.innerText = text;
      termBody.appendChild(lineDiv);
      termBody.scrollTop = termBody.scrollHeight;

      currentLine++;
      if (currentLine >= logLines.length) {
        clearInterval(window._terminalInterval);
      }
    }, 450);
  }
}

/* ---------- 12. LIVE DEPIN SYSTEM MONITOR HUD ---------- */
function initDepinMonitor() {
  const widget = document.getElementById('depin-monitor-widget');
  const toggleBtn = document.getElementById('monitor-toggle');
  const earnRateText = document.getElementById('mon-earn-rate');
  const totalEarnedText = document.getElementById('mon-total-earned');

  if (!widget || !toggleBtn) return;

  // Toggle HUD minimized/expanded state
  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    widget.classList.toggle('minimized');
  });

  // Numeric count-up simulation for earnings
  let totalEarned = parseFloat(localStorage.getItem('depin_points') || '2548.12');
  const earnRate = 1.42; // points per second
  earnRateText.innerText = `${earnRate} pts/s`;

  setInterval(() => {
    if (window._particleConfig.grassOnline || window._particleConfig.dawnOnline) {
      // Scale earning rate based on active nodes
      let multiplier = 0;
      if (window._particleConfig.grassOnline) multiplier += 0.5;
      if (window._particleConfig.dawnOnline) multiplier += 0.5;
      
      const currentRate = earnRate * multiplier;
      earnRateText.innerText = `${currentRate.toFixed(2)} pts/s`;
      
      if (multiplier > 0) {
        totalEarned += (currentRate / 10);
        totalEarnedText.innerText = `${totalEarned.toFixed(2)} pts`;
        localStorage.setItem('depin_points', totalEarned.toString());
      }
    } else {
      earnRateText.innerText = `0.00 pts/s`;
    }
  }, 100);
}

/* ---------- 13. SECRET DEVELOPER CONSOLE (Easter Egg) ---------- */
function initAdminConsole() {
  const adminModal = document.getElementById('admin-dashboard-modal');
  const closeBtn = document.getElementById('admin-modal-close');
  const particleCountSlider = document.getElementById('admin-particle-count');
  const particleCountVal = document.getElementById('admin-particle-count-val');
  const particleSpeedSlider = document.getElementById('admin-particle-speed');
  const particleSpeedVal = document.getElementById('admin-particle-speed-val');
  const nodeGrassToggle = document.getElementById('node-toggle-grass');
  const nodeDawnToggle = document.getElementById('node-toggle-dawn');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const messagesList = document.getElementById('admin-messages-list');
  const logo = document.querySelector('.logo');

  if (!adminModal) return;

  function openAdmin() {
    adminModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    loadAdminMessages();
  }

  function closeAdmin() {
    adminModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeAdmin);

  // Trigger 1: Typing 'admin' on keyboard
  let keyHistory = "";
  window.addEventListener('keydown', e => {
    keyHistory += e.key.toLowerCase();
    if (keyHistory.endsWith("admin")) {
      openAdmin();
      keyHistory = "";
    }
    if (keyHistory.length > 20) keyHistory = keyHistory.substring(10);
  });

  // Trigger 2: Clicking logo 5 times in 3 seconds
  if (logo) {
    let logoClicks = 0;
    let logoTimeout = null;
    logo.addEventListener('click', e => {
      // Only trigger if clicking logo, not navigation links
      if (e.target.closest('a') && e.target.getAttribute('href') !== '#hero') return;
      
      logoClicks++;
      clearTimeout(logoTimeout);
      
      if (logoClicks >= 5) {
        openAdmin();
        logoClicks = 0;
        // Visual indicator toast
        showToast("System Console unlocked!");
      }
      
      logoTimeout = setTimeout(() => { logoClicks = 0; }, 3000);
    });
  }

  // Particle Count Controller
  if (particleCountSlider && particleCountVal) {
    particleCountSlider.addEventListener('input', () => {
      const val = parseInt(particleCountSlider.value);
      particleCountVal.innerText = val;
      window._particleConfig.count = val;
    });
  }

  // Particle Speed Controller
  if (particleSpeedSlider && particleSpeedVal) {
    particleSpeedSlider.addEventListener('input', () => {
      const val = parseInt(particleSpeedSlider.value) / 10;
      particleSpeedVal.innerText = `${val.toFixed(1)}x`;
      window._particleConfig.speed = val;
    });
  }

  // Node toggle controls
  if (nodeGrassToggle) {
    nodeGrassToggle.addEventListener('change', () => {
      const isOnline = nodeGrassToggle.checked;
      window._particleConfig.grassOnline = isOnline;
      const grassVal = document.getElementById('mon-grass-val');
      if (grassVal) {
        grassVal.innerText = isOnline ? "100% Quality" : "OFFLINE";
        grassVal.style.color = isOnline ? "" : "#ef4444";
      }
      updateNodeActiveCount();
    });
  }

  if (nodeDawnToggle) {
    nodeDawnToggle.addEventListener('change', () => {
      const isOnline = nodeDawnToggle.checked;
      window._particleConfig.dawnOnline = isOnline;
      const dawnVal = document.getElementById('mon-dawn-val');
      if (dawnVal) {
        dawnVal.innerText = isOnline ? "98% Online" : "OFFLINE";
        dawnVal.style.color = isOnline ? "" : "#ef4444";
      }
      updateNodeActiveCount();
    });
  }

  function updateNodeActiveCount() {
    let activeCount = 0;
    if (window._particleConfig.grassOnline) activeCount++;
    if (window._particleConfig.dawnOnline) activeCount++;
    const nodeStatus = document.getElementById('mon-node-status');
    if (nodeStatus) {
      nodeStatus.innerText = `${activeCount} ACTIVE`;
      nodeStatus.className = `mon-status ${activeCount > 0 ? 'mon-active' : 'mon-inactive'}`;
    }
  }

  // Helper to apply and save color theme preset
  function applyColorTheme(themeName, showToastNotify = false) {
    localStorage.setItem('color-theme', themeName);

    // Update body classes
    document.body.classList.remove('theme-matrix-green', 'theme-cyber-purple', 'theme-solar-orange');
    if (themeName === 'matrix') {
      document.body.classList.add('theme-matrix-green');
    } else if (themeName === 'cyber') {
      document.body.classList.add('theme-cyber-purple');
    } else if (themeName === 'solar') {
      document.body.classList.add('theme-solar-orange');
    }

    // Update active classes for Admin Console buttons
    const consoleBtns = document.querySelectorAll('.theme-btn');
    consoleBtns.forEach(btn => {
      if (btn.getAttribute('data-theme-name') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update active classes for Header Customizer buttons
    const headerBtns = document.querySelectorAll('.theme-preset-btn');
    headerBtns.forEach(btn => {
      if (btn.getAttribute('data-theme-preset') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (showToastNotify) {
      const names = {
        default: 'Flame Blue',
        matrix: 'Matrix Green',
        cyber: 'Cyber Purple',
        solar: 'Solar Orange'
      };
      showToast(`Đã chuyển sang tông màu ${names[themeName] || themeName}!`);
    }
  }

  // Load and apply theme on start to sync buttons
  const savedColorTheme = localStorage.getItem('color-theme') || 'default';
  applyColorTheme(savedColorTheme, false);

  // Theme customizer buttons (Admin Console)
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme-name');
      applyColorTheme(theme, true);
    });
  });

  // Theme preset buttons (Header Customizer Popup)
  const headerThemeBtns = document.querySelectorAll('.theme-preset-btn');
  headerThemeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme-preset');
      applyColorTheme(theme, true);
    });
  });

  // Load contact messages sent locally
  function loadAdminMessages() {
    if (!messagesList) return;
    
    const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
    if (messages.length === 0) {
      messagesList.innerHTML = `<div class="admin-no-msg">Không có tin nhắn nào được gửi. Hãy thử gửi tin nhắn ở form liên hệ phía dưới nhé!</div>`;
    } else {
      messagesList.innerHTML = messages.map(msg => `
        <div class="admin-msg-card">
          <div class="admin-msg-header">
            <span>👤 ${escapeHtml(msg.name)}</span>
            <span style="font-size:0.65rem;color:var(--text-muted);">${msg.timestamp}</span>
          </div>
          <div style="font-size:0.7rem;margin-top:2px;">Email: <a href="mailto:${escapeHtml(msg.email)}" style="color:var(--color-secondary);text-decoration:underline;">${escapeHtml(msg.email)}</a></div>
          <div class="admin-msg-subject">Tiêu đề: ${escapeHtml(msg.subject)}</div>
          <div class="admin-msg-body">${escapeHtml(msg.message)}</div>
        </div>
      `).join('');
    }
  }

  // Reload messages list when a new form message event is dispatched
  window.addEventListener('contact_message_received', loadAdminMessages);

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // helper to print toast inside main
  function showToast(message) {
    // Check if container exists or create it
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast toast-success glass-card show';
    toast.innerHTML = `
      <div class="toast-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
      <div class="toast-message">${message}</div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }
}

/* ---------- BOOT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initParticles();
  initPageTransition();
  initCursorGlow();
  initAudio();
  initModal();
  initTypewriter();
  initCustomCursor();
  initGlassCards();
  initChatbot();
  initProjectModals();
  initDepinMonitor();
  initAdminConsole();
  initBgMusic();
});

/* ---------- BACKGROUND MUSIC PLAYER (YouTube IFrame API) ---------- */
// Playlist kênh Harmony in Sound (lấy từ channel uploads)
const YT_CHANNEL_PLAYLIST = 'UUxtA0cEVWWutQyKJA_4mVEQ';

let ytPlayer = null;
let ytMusicReady = false;
let ytMusicPlaying = false;

// Callback tự động gọi khi YouTube IFrame API load xong
window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-player-container', {
    height: '1',
    width: '1',
    playerVars: {
      listType: 'playlist',
      list: YT_CHANNEL_PLAYLIST,
      autoplay: 1,
      mute: 1,        // Phải mute để bypass autoplay policy
      loop: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady: function (e) {
        ytMusicReady = true;
        const savedVol = parseInt(localStorage.getItem('bgMusicVolume') || '30');
        e.target.setVolume(savedVol);
        // Shuffle ngẫu nhiên
        try { e.target.setShuffle(true); } catch(_) {}

        const shouldPlay = localStorage.getItem('bgMusicPlaying') !== 'false';
        if (shouldPlay) {
          e.target.playVideo();
          // Sau 1.5s tự unmute — nghe được nhạc
          setTimeout(() => {
            if (localStorage.getItem('bgMusicPlaying') !== 'false') {
              try { e.target.unMute(); } catch(_) {}
              ytMusicPlaying = true;
              updateMusicBtn();
            }
          }, 1500);

          // Lắng nghe tương tác lần đầu để chủ động unmute nếu trình duyệt chặn tự động unmute
          const unmuteOnInteraction = () => {
            if (ytPlayer && ytMusicReady && ytMusicPlaying && localStorage.getItem('bgMusicPlaying') !== 'false') {
              try { ytPlayer.unMute(); } catch(_) {}
            }
            document.removeEventListener('click', unmuteOnInteraction);
            document.removeEventListener('touchstart', unmuteOnInteraction);
          };
          document.addEventListener('click', unmuteOnInteraction, { once: true });
          document.addEventListener('touchstart', unmuteOnInteraction, { once: true });
        } else {
          ytMusicPlaying = false;
          updateMusicBtn();
        }
      },
      onStateChange: function (e) {
        if (e.data === YT.PlayerState.ENDED) {
          try { ytPlayer.nextVideo(); } catch(_) {}
        }
        ytMusicPlaying = (e.data === YT.PlayerState.PLAYING);
        updateMusicBtn();
      },
      onError: function (e) {
        console.warn('YouTube Player Error:', e.data);
        // Tự động chuyển bài tiếp theo nếu lỗi (ví dụ video bị xóa hoặc không cho phép embed)
        try { ytPlayer.nextVideo(); } catch(_) {}
      }
    }
  });
};

// Nếu API đã load xong trước khi script này chạy (phòng ngừa race condition)
if (window.YT && window.YT.Player) {
  window.onYouTubeIframeAPIReady();
}

function updateMusicBtn() {
  const btn = document.getElementById('music-player-btn');
  if (!btn) return;
  const iconPaused = btn.querySelector('.music-icon-paused');
  const iconPlaying = btn.querySelector('.music-icon-playing');
  if (ytMusicPlaying) {
    btn.classList.add('playing');
    if (iconPaused) iconPaused.style.display = 'none';
    if (iconPlaying) iconPlaying.style.display = 'flex';
    btn.setAttribute('title', 'Tắt nhạc nền (M)');
  } else {
    btn.classList.remove('playing');
    if (iconPaused) iconPaused.style.display = '';
    if (iconPlaying) iconPlaying.style.display = 'none';
    btn.setAttribute('title', 'Bật nhạc nền (M)');
  }
}

function initBgMusic() {
  const btn = document.getElementById('music-player-btn');
  const volumeSlider = document.getElementById('music-volume-slider');
  if (!btn) return;

  // Cập nhật slider từ saved state
  if (volumeSlider) {
    const savedVol = parseInt(localStorage.getItem('bgMusicVolume') || '30');
    volumeSlider.value = savedVol;
  }

  // Click để play/pause
  btn.addEventListener('click', function (e) {
    if (volumeSlider && e.target === volumeSlider) return;
    if (!ytPlayer || !ytMusicReady) return;
    try {
      if (ytMusicPlaying) {
        ytPlayer.pauseVideo();
        ytMusicPlaying = false;
        localStorage.setItem('bgMusicPlaying', 'false');
      } else {
        ytPlayer.unMute();
        ytPlayer.playVideo();
        ytMusicPlaying = true;
        localStorage.setItem('bgMusicPlaying', 'true');
      }
      updateMusicBtn();
    } catch(_) {}
  });

  // Volume slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', function (e) {
      e.stopPropagation();
      const vol = parseInt(e.target.value);
      localStorage.setItem('bgMusicVolume', String(vol));
      if (ytPlayer && ytMusicReady) {
        try { ytPlayer.setVolume(vol); } catch(_) {}
      }
    });
    volumeSlider.addEventListener('click', e => e.stopPropagation());
    volumeSlider.addEventListener('mousedown', e => e.stopPropagation());
  }

  // Phím tắt M để toggle nhạc
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'm' || e.key === 'M') btn.click();
  });

  // Mobile: nhấn giữ để hiện volume popup
  let pressTimer = null;
  btn.addEventListener('touchstart', () => {
    pressTimer = setTimeout(() => {
      const popup = document.getElementById('music-volume-popup');
      if (popup) {
        popup.style.opacity = '1';
        popup.style.pointerEvents = 'auto';
        setTimeout(() => { popup.style.opacity = ''; popup.style.pointerEvents = ''; }, 3000);
      }
    }, 500);
  }, { passive: true });
  btn.addEventListener('touchend', () => { if (pressTimer) clearTimeout(pressTimer); }, { passive: true });

  updateMusicBtn();
}
