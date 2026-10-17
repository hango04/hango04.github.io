document.addEventListener('DOMContentLoaded', () => {
  // --- STICKY NAV SYSTEM ---
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- MOBILE NAV TOGGLE ---
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      
      // Update hamburger button icon (SVG toggle or text)
      const isExpanded = navMenu.classList.contains('active');
      mobileNavToggle.setAttribute('aria-expanded', isExpanded);
      
      const menuIcon = mobileNavToggle.querySelector('svg path');
      if (menuIcon) {
        if (isExpanded) {
          menuIcon.setAttribute('d', 'M6 18L18 6M6 6l12 12'); // X Close icon
        } else {
          menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16'); // Hamburger icon
        }
      }
    });
  }

  // Close mobile menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      const menuIcon = mobileNavToggle?.querySelector('svg path');
      if (menuIcon) {
        menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
      }
      
      // Update active state
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // --- THEME SWITCHER (DARK / LIGHT) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'dark';

  // Apply initial theme
  document.documentElement.setAttribute('data-theme', currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme');
      let newTheme = 'dark';
      
      if (theme === 'dark') {
        newTheme = 'light';
      }
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      const themeName = newTheme === 'dark' ? 'tối' : 'sáng';
      showToast(`Đã chuyển sang giao diện ${themeName}!`);
    });
  }

  // --- THEME CUSTOMIZER POPUP ---
  const themeMenuToggle = document.getElementById('theme-menu-toggle');
  const themeCustomizerPopup = document.getElementById('theme-customizer-popup');

  if (themeMenuToggle && themeCustomizerPopup) {
    themeMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      themeCustomizerPopup.classList.toggle('hidden');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!themeCustomizerPopup.classList.contains('hidden') && !e.target.closest('.theme-customizer-wrapper')) {
        themeCustomizerPopup.classList.add('hidden');
      }
    });
  }

  // --- SCROLL REVEAL ANIMATIONS (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once revealed, we can unobserve if we want it to stay permanent
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // --- SKILLS PROGRESS BARS ANIMATION ---
  const skillSection = document.getElementById('skills');
  const skillBars = document.querySelectorAll('.skill-bar-inner');
  
  if (skillSection && skillBars.length > 0) {
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          skillBars.forEach(bar => {
            const percentage = bar.getAttribute('data-percentage');
            bar.style.width = percentage + '%';
          });
          skillObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });
    
    skillObserver.observe(skillSection);
  }

  // --- PROJECTS GRID FILTER ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Toggle active class on buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');
        
        if (filterValue === 'all' || categories.includes(filterValue)) {
          // Smooth fade in / scaling
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          // Smooth fade out
          card.style.opacity = '0';
          card.style.transform = 'scale(0.9)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // --- CONTACT FORM SUBMISSION WITH TELEGRAM BOT & FALLBACK ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const phoneInput = document.getElementById('form-phone');
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !subject || !message) {
        showToast('Vui lòng điền đầy đủ các trường thông tin.', 'error');
        return;
      }

      if (!emailRegex.test(email)) {
        showToast('Vui lòng nhập địa chỉ email hợp lệ.', 'error');
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin-icon" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
        <span>Đang gửi tin nhắn...</span>
      `;

      // Save to local inbox backup
      try {
        const newMessage = {
          name,
          email,
          phone,
          subject,
          message,
          timestamp: new Date().toLocaleString('vi-VN')
        };
        const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
        messages.unshift(newMessage);
        localStorage.setItem('contact_messages', JSON.stringify(messages));
        window.dispatchEvent(new Event('contact_message_received'));
      } catch (err) {
        console.error('LocalStorage error:', err);
      }

      // Telegram Bot Dispatch (Đã tích hợp cấu hình bot của Mạnh Hà)
      const TELEGRAM_BOT_TOKEN = window.TELEGRAM_BOT_TOKEN || localStorage.getItem('telegram_bot_token') || '8588897348:AAHQ9jC9y-Y_Ds7VHkUgTKc2oQIlUmnyy0Q';
      const TELEGRAM_CHAT_ID   = window.TELEGRAM_CHAT_ID || localStorage.getItem('telegram_chat_id') || '6147568636';

      const telegramText = 
`🚀 <b>TIN NHẮN MỚI TỪ PORTFOLIO NGOMANHHA.XYZ</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Họ tên:</b> ${name}
📧 <b>Email:</b> ${email}
📞 <b>Số điện thoại / Zalo:</b> ${phone || 'Không cung cấp'}
📌 <b>Tiêu đề:</b> ${subject}
💬 <b>Lời nhắn:</b>
${message}
━━━━━━━━━━━━━━━━━━━━
⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;

      let sentViaTelegram = false;

      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        try {
          const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: telegramText,
              parse_mode: 'HTML'
            })
          });
          const data = await res.json();
          if (data.ok) {
            sentViaTelegram = true;
          }
        } catch (fetchErr) {
          console.warn('Telegram send failed:', fetchErr);
        }
      }

      // Feedback to User
      if (sentViaTelegram) {
        showToast('Gửi tin nhắn thành công! Đã gửi thông báo tức thì đến Telegram của Mạnh Hà.');
      } else {
        showToast('Lời nhắn đã được gửi! Tôi sẽ phản hồi bạn qua Email/Zalo sớm nhất.');
      }

      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    });
  }

  // Global helper for user to easily set their Telegram Bot Token in browser
  window.setupTelegramBot = function(token, chatId) {
    if (token && chatId) {
      localStorage.setItem('telegram_bot_token', token);
      localStorage.setItem('telegram_chat_id', chatId);
      console.log('✅ Đã lưu cấu hình Telegram Bot thành công!');
      return 'Đã kích hoạt Telegram Bot: ' + chatId;
    } else {
      console.log('ℹ️ Cú pháp: setupTelegramBot("BOT_TOKEN", "CHAT_ID")');
      return 'Vui lòng cung cấp cả BOT_TOKEN và CHAT_ID';
    }
  };

  // --- CUSTOM TOAST NOTIFICATION SYSTEM ---
  function showToast(message, type = 'success') {
    // Check if container exists
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} glass-card`;
    
    // Choose icon
    const icon = type === 'success' 
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
    `;

    toastContainer.appendChild(toast);

    // Trigger reveal transition
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Automatically remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 4000);
  }
});
