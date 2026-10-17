/**
 * Interactive Hacker Terminal (CLI Mode) for Ngô Mạnh Hà Portfolio
 * Trigger: Key [~] or click on #terminal-toggle-btn
 */
(function() {
  const terminalModal = document.getElementById('hacker-terminal-modal');
  const terminalBtn   = document.getElementById('terminal-toggle-btn');
  const termInput     = document.getElementById('terminal-input');
  const termOutput    = document.getElementById('terminal-output');
  const termScreen    = document.getElementById('terminal-screen');
  const closeBtn      = document.getElementById('term-close-btn');

  if (!terminalModal || !termInput || !termOutput) return;

  let history = [];
  let historyIdx = -1;

  const WELCOME_BANNER = `
<span style="color:#00f0ff;">
  __  __            _     _  _       
 |  \\/  |__ _ _ _  | |_  | || |__ _ 
 | |\\/| / _\` | ' \\ | ' \\ | __ / _\` |
 |_|  |_\\__,_|_||_||_||_||_||_\\__,_|
</span>
<span style="color:#10b981;">[MANH HA SYSTEM OS v2.6.1] - Robotics & Automation Interactive CLI</span>
Gõ <span style="color:#f59e0b; font-weight:bold;">"help"</span> để xem danh sách câu lệnh. Bấm <span style="color:#f59e0b;">[Esc]</span> hoặc phím <span style="color:#f59e0b;">[~]</span> để đóng/mở nhanh.
--------------------------------------------------------------------------------`;

  function init() {
    termOutput.innerHTML = `<div class="term-line">${WELCOME_BANNER}</div>`;

    if (terminalBtn) {
      terminalBtn.addEventListener('click', toggleTerminal);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeTerminal);
    }

    // Hotkey toggle with `~` (tilde / backquote)
    window.addEventListener('keydown', (e) => {
      if (e.key === '`' || e.key === '~') {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if ((activeTag !== 'input' && activeTag !== 'textarea') || document.activeElement === termInput) {
          e.preventDefault();
          toggleTerminal();
        }
      } else if (e.key === 'Escape' && !terminalModal.classList.contains('hidden')) {
        closeTerminal();
      }
    });

    termInput.addEventListener('keydown', handleInput);

    // Click anywhere on terminal screen to focus input
    termScreen.addEventListener('click', () => {
      termInput.focus();
    });
  }

  function toggleTerminal() {
    if (terminalModal.classList.contains('hidden')) {
      openTerminal();
    } else {
      closeTerminal();
    }
  }

  function openTerminal() {
    terminalModal.classList.remove('hidden');
    termInput.focus();
    scrollToBottom();
  }

  function closeTerminal() {
    terminalModal.classList.add('hidden');
  }

  function scrollToBottom() {
    termScreen.scrollTop = termScreen.scrollHeight;
  }

  function printLine(html, color) {
    const div = document.createElement('div');
    div.className = 'term-line';
    if (color) div.style.color = color;
    div.innerHTML = html;
    termOutput.appendChild(div);
    scrollToBottom();
  }

  function handleInput(e) {
    if (e.key === 'Enter') {
      const cmdRaw = termInput.value.trim();
      termInput.value = '';
      if (!cmdRaw) return;

      history.push(cmdRaw);
      historyIdx = history.length;

      // Echo command
      printLine(`<span style="color:#64748b;">manhha@system:~$</span> <span style="color:#fff; font-weight:600;">${escapeHtml(cmdRaw)}</span>`);

      executeCommand(cmdRaw);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx > 0) {
        historyIdx--;
        termInput.value = history[historyIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        historyIdx++;
        termInput.value = history[historyIdx];
      } else {
        historyIdx = history.length;
        termInput.value = '';
      }
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function executeCommand(raw) {
    const args = raw.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case 'help':
        printLine(`
<span style="color:#00f0ff; font-weight:bold;">DANH SÁCH LỆNH KHẢ DỤNG:</span>
  <span style="color:#10b981;">about</span>       - Giới thiệu vắn tắt về Ngô Mạnh Hà
  <span style="color:#10b981;">skills</span>      - Kỹ năng Robotics, Lập trình tự động hóa & Media
  <span style="color:#10b981;">projects</span>    - Danh sách 6 dự án tiêu biểu
  <span style="color:#10b981;">scara</span>       - Di chuyển tới bộ mô phỏng 3D Robot SCARA
  <span style="color:#10b981;">drone</span>       - Thông số kỹ thuật mô hình Drone & bộ PID
  <span style="color:#10b981;">cv</span>          - Tải hồ sơ CV kỹ sư PDF
  <span style="color:#10b981;">contact</span>     - Thông tin Zalo, Telegram, Mail liên hệ
  <span style="color:#10b981;">theme &lt;name&gt;</span> - Đổi theme: default | matrix | cyber | solar
  <span style="color:#10b981;">matrix</span>      - Kích hoạt hiệu ứng mưa mã số The Matrix
  <span style="color:#10b981;">clear</span>       - Xóa sạch màn hình terminal
  <span style="color:#10b981;">exit</span>        - Đóng cửa sổ terminal
        `);
        break;

      case 'about':
        printLine(`
<span style="color:#38bdf8; font-weight:bold;">NGÔ MẠNH HÀ</span> (Kỹ sư Robotics & Automation Scripter)
• Tốt nghiệp chuyên ngành Kỹ thuật Robot & ĐK thông minh - ĐH Thủy Lợi (2022 - 2026).
• Kinh nghiệm thực tế: Thực tập chế tạo máy & lập trình Robot SCARA tại Autotech Việt Nam.
• 3 năm thực chiến tự động hóa MMO, viết kịch bản GPM Browser, Crypto DePIN Node.
• Sở hữu kênh TikTok Short đạt 57.9K followers & 255K+ lượt thích.
        `);
        break;

      case 'skills':
        printLine(`
<span style="color:#38bdf8; font-weight:bold;">TECH STACK & SKILLSET:</span>
• <b>Robotics & Hardware:</b> SolidWorks 3D, MATLAB Simulink, PID Control, SCARA Robot, PLC, C/C++ Nhúng, Arduino/ESP.
• <b>Automation & MMO:</b> GPM Browser API, NodeJS, Puppeteer, Multi-threading, Proxy Routing, Crypto Node/Airdrop.
• <b>Media & Design:</b> CapCut Pro Keyframes, Adobe Premiere Pro, Photoshop, VideoScribe, Audio Mastering.
        `);
        break;

      case 'projects':
        printLine(`
<span style="color:#38bdf8; font-weight:bold;">CÁC DỰ ÁN NỔI BẬT:</span>
1. <a href="#project-drone" style="color:#10b981; text-decoration:underline;">[Robot Drone Vận Tải]</a> - Thiết kế động lực học & mô phỏng PID cân bằng.
2. <a href="#project-gpm" style="color:#10b981; text-decoration:underline;">[GPM Browser Automation]</a> - Viết script nuôi 200+ profile cày airdrop & X revenue.
3. <a href="#project-tiktok" style="color:#10b981; text-decoration:underline;">[Kênh TikTok 57.9K Follower]</a> - Sáng tạo video viral & kiếm tiền Quỹ Beta.
4. <a href="#project-scara" style="color:#10b981; text-decoration:underline;">[Dây Chuyền SCARA Autotech]</a> - Lắp ráp cơ khí & lập trình gắp phôi.
5. <a href="#project-videoscribe" style="color:#10b981; text-decoration:underline;">[VideoScribe Animation]</a> - Hoạt hình vẽ tay giới thiệu sản phẩm.
6. <a href="#project-youtube" style="color:#10b981; text-decoration:underline;">[Harmony in Sound]</a> - Kênh YouTube âm nhạc lofi chất lượng cao.
(Gợi ý: Click trực tiếp vào thẻ trên web để xem toàn bộ Case Study!)
        `);
        break;

      case 'drone':
        printLine(`
<span style="color:#38bdf8; font-weight:bold;">DRONE QUADCOPTER SPECIFICATION:</span>
• Cấu hình: 4 động cơ không chổi than (Brushless), cánh quạt 1045, khung Carbon fiber.
• Tải trọng mục tiêu: 5.0 kg bưu kiện hàng hóa.
• Mô hình điều khiển: Phản hồi vòng kín PID phân tầng (Góc nghiêng Roll/Pitch/Yaw + Độ cao Z).
• Thời gian xác lập cân bằng: &lt; 0.8 giây | Độ vọt lố: &lt; 4.5%.
        `);
        break;

      case 'scara':
        printLine(`<span style="color:#10b981;">Đang chuyển hướng tới Bộ mô phỏng 3D Robot SCARA...</span>`);
        closeTerminal();
        const scaraSec = document.getElementById('robot-simulator-section');
        if (scaraSec) scaraSec.scrollIntoView({ behavior: 'smooth' });
        break;

      case 'cv':
        printLine(`<span style="color:#10b981;">Đang mở và tải CV Kỹ sư Ngô Mạnh Hà...</span>`);
        window.open('Ngô Mạnh Hà- 2251283518.pdf', '_blank');
        break;

      case 'contact':
        printLine(`
<span style="color:#38bdf8; font-weight:bold;">THÔNG TIN KẾT NỐI:</span>
• <b>Zalo / Hotline:</b> <a href="https://zalo.me/0334383560" target="_blank" style="color:#10b981;">0334383560</a>
• <b>Telegram:</b> @manhha101z (Bot: @manhha101_bot)
• <b>Email:</b> <a href="mailto:ngomanhha2004@gmail.com" style="color:#10b981;">ngomanhha2004@gmail.com</a>
• <b>Địa chỉ:</b> Như Quỳnh, Văn Lâm, Hưng Yên
        `);
        break;

      case 'theme':
        const themeName = args[1] ? args[1].toLowerCase() : '';
        const validThemes = ['default', 'matrix', 'cyber', 'solar'];
        if (validThemes.includes(themeName)) {
          const presetBtn = document.querySelector(`.theme-preset-btn[data-theme-preset="${themeName}"]`);
          if (presetBtn) presetBtn.click();
          printLine(`<span style="color:#10b981;">Đã chuyển sang theme [${themeName.toUpperCase()}] thành công!</span>`);
        } else {
          printLine(`Cú pháp: theme &lt;default|matrix|cyber|solar&gt;`, '#ef4444');
        }
        break;

      case 'matrix':
        printLine(`<span style="color:#39ff14;">Entering the Matrix... Nhấn phím bất kỳ hoặc click để thoát.</span>`);
        startMatrixRain();
        break;

      case 'clear':
      case 'cls':
        termOutput.innerHTML = '';
        break;

      case 'exit':
      case 'quit':
        closeTerminal();
        break;

      case 'sudo':
        printLine(`<span style="color:#ef4444;">Permission denied: You are not root on Mạnh Hà's system :)</span>`);
        break;

      default:
        printLine(`<span style="color:#ef4444;">Lệnh không hợp lệ: "${escapeHtml(cmd)}". Gõ "help" để xem danh sách lệnh.</span>`);
        break;
    }
  }

  // --- MATRIX RAIN EFFECT ---
  let matrixInterval = null;
  function startMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    canvas.classList.remove('hidden');
    const ctx = canvas.getContext('2d');
    canvas.width = termScreen.clientWidth;
    canvas.height = termScreen.clientHeight;

    const chars = '0123456789ABCDEFROBOTICSAUTOMATIONGPM';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    if (matrixInterval) clearInterval(matrixInterval);

    matrixInterval = setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#39ff14';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 40);

    // Stop on click or key
    function stopMatrix() {
      clearInterval(matrixInterval);
      matrixInterval = null;
      canvas.classList.add('hidden');
      window.removeEventListener('keydown', stopMatrix);
      canvas.removeEventListener('click', stopMatrix);
    }
    setTimeout(() => {
      window.addEventListener('keydown', stopMatrix, { once: true });
      canvas.addEventListener('click', stopMatrix, { once: true });
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
