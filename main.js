/* ============================================================
   main.js – Premium Immersive Interactions v7.0
   Ngô Mạnh Hà Portfolio (Flame Blue AI style)
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
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  }

  // Bind to buttons and active elements including chatbot/modals dynamically
  document.body.addEventListener('click', e => {
    if (e.target.closest('.btn, .btn-icon, .filter-btn, .choice-btn, #chatbot-toggle')) {
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
    
    // Stop MATLAB simulation animation loop if running
    if (window._matlabSimId) {
      cancelAnimationFrame(window._matlabSimId);
      window._matlabSimId = null;
    }
    // Clear terminal timer
    if (window._terminalInterval) {
      clearInterval(window._terminalInterval);
      window._terminalInterval = null;
    }
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  window._closeProjectModal = closeModal;
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
      'a, button, input, textarea, select, .project-card, .skills-card, .filter-btn, .timeline-card, .stat-item, .logo, .theme-toggle-btn, .choice-btn, #chatbot-toggle'
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

  // Listen to changes in the DOM or clicks that spawn elements
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
      if (card.id === 'chatbot-window') return; // skip chatbot container
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
      if (card.id === 'chatbot-window') return;
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

  if (!toggleBtn || !chatWindow || !chatMessages || !choicesContainer) return;

  // Toggle chat window visibility
  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    const isClosed = chatWindow.classList.contains('hidden');

    const chatIcon = toggleBtn.querySelector('.chat-icon');
    const closeIcon = toggleBtn.querySelector('.close-icon');

    if (isClosed) {
      chatIcon.style.display = 'block';
      closeIcon.style.display = 'none';
    } else {
      chatIcon.style.display = 'none';
      closeIcon.style.display = 'block';
      scrollToBottom();
    }
  });

  // Chat Responses Configuration
  const responses = {
    gpm: {
      text: "Mạnh Hà có nhận viết script tự động hóa theo yêu cầu trên **GPM Browser** sử dụng **Node.js, Puppeteer/Playwright**. Các script hỗ trợ tự động cày farm tài khoản, auto airdrop/retroactive, và đồng bộ thao tác đa luồng quy mô lớn giúp tiết kiệm tối đa thời gian. Bạn có thể kết nối Zalo **0334383560** để đặt hàng code nhé!",
      followups: ["drone", "contact"]
    },
    drone: {
      text: "Đồ án Drone là sản phẩm nghiên cứu chuyên sâu về **Thiết kế hệ thống điều khiển cho Robot Drone Vận tải**. Mô hình 3D được thiết kế chuẩn xác trên SolidWorks, viết phương trình toán học động lực học và mô phỏng cân bằng PID trên **MATLAB**. Đồ án đã được đăng thành bài báo khoa học. Bạn có thể nhấp vào phần Dự án để xem mô phỏng PID trực quan nhé!",
      followups: ["gpm", "contact"]
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
    contact: "Làm sao để liên hệ hợp tác?",
    gaming: "Bạn có chơi TFT / Tốc Chiến không?"
  };

  // Event delegation for choices buttons
  choicesContainer.addEventListener('click', e => {
    const button = e.target.closest('.choice-btn');
    if (!button) return;

    const choice = button.getAttribute('data-choice');
    if (choice === 'main_menu') {
      showMainMenu();
      return;
    }

    // Append User message
    appendMessage(choiceTexts[choice] || button.innerText, 'user');

    // Hide choices & Show typing indicator
    choicesContainer.style.pointerEvents = 'none';
    choicesContainer.style.opacity = '0.3';
    appendTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      
      // Append Bot message
      const res = responses[choice];
      if (res) {
        appendMessage(res.text, 'bot');
        showFollowupChoices(res.followups);
      } else {
        appendMessage("Xin lỗi, tôi chưa hiểu câu hỏi này.", 'bot');
        showMainMenu();
      }

      choicesContainer.style.pointerEvents = 'all';
      choicesContainer.style.opacity = '1';
    }, 1200);
  });

  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    
    // Format bold markdown **text** and links [text](url)
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="text-decoration:underline;color:var(--color-primary);">$1</a>')
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

  // Modal open helpers
  function openModal(htmlContent) {
    modalBody.innerHTML = htmlContent;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  // Card 1: Drone Project Click
  if (droneCard) {
    droneCard.addEventListener('click', e => {
      // Allow direct link click without opening modal
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

  // Card 5: GPM Automation Script Click
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
              <a href="assets/videoscriptgpm.mp4" target="_blank" class="btn btn-primary">Xem Full Video</a>
              <a href="https://zalo.me/0334383560" target="_blank" class="btn btn-secondary">Đặt Hàng Code Tool</a>
            </div>
          </div>
        </div>
      `;
      openModal(html);
      runTerminalSimulation();
    });
  }

  // Card 3: TikTok Creators Click
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

  // --- MATLAB PID PLOT SIMULATION Core ---
  function runDroneSimulation() {
    const canvas = document.getElementById('sim-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize canvas
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const setpoint = canvas.height / 2;
    let t = 0;
    const points = [];
    const maxPoints = Math.floor(canvas.width - 60);

    function draw() {
      if (!document.getElementById('sim-canvas')) return; // exit if modal closed

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw matlab-style background grid
      ctx.strokeStyle = '#102040';
      ctx.lineWidth = 0.5;
      for (let x = 40; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 30; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Draw Setpoint Line (dashed red)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(40, setpoint);
      ctx.lineTo(canvas.width - 20, setpoint);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Math PID Damping equation simulation
      // y(t) = Setpoint - e^(-zeta * w_n * t) * cos(w_d * t)
      const zeta = 0.12;
      const wn = 0.28;
      const amplitude = 90;
      const val = setpoint + Math.exp(-zeta * wn * t) * Math.cos(wn * t) * amplitude;

      points.push({ x: 40 + t * 4, y: val });
      if (points.length > maxPoints) points.shift();

      // Render Trajectory Damping Line
      ctx.strokeStyle = '#00c2ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Active scanning dot
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
      // Loop
      window._matlabSimId = requestAnimationFrame(draw);
    }
    window._matlabSimId = requestAnimationFrame(draw);
  }

  // --- AUTOMATED LOGS TERMINAL Core ---
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
    termBody.innerHTML = ''; // reset terminal

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
      termBody.scrollTop = termBody.scrollHeight; // autoscroll

      currentLine++;
      if (currentLine >= logLines.length) {
        clearInterval(window._terminalInterval);
      }
    }, 450);
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
});
