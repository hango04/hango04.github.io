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

  // --- CONTACT FORM SUBMISSION & VALIDATION ---
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve values
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      // Simple email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !subject || !message) {
        showToast('Vui lòng điền đầy đủ tất cả các trường.', 'error');
        return;
      }

      if (!emailRegex.test(email)) {
        showToast('Vui lòng nhập địa chỉ email hợp lệ.', 'error');
        return;
      }

      // Simulate API call / success feedback
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Đang gửi...';

      setTimeout(() => {
        showToast('Gửi tin nhắn thành công! Tôi sẽ liên hệ lại sớm.');
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }, 1500);
    });
  }

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
