/**
 * Interactive Vietnam Neon Travel Map for Ngô Mạnh Hà Portfolio
 * Features locations: Hà Giang, Tà Xùa, Cát Bà, Ninh Bình
 */

(function () {
  const LOCATIONS = [
    {
      id: 'hagiang',
      name: 'Hà Giang',
      region: 'Đông Bắc',
      x: 48, // % from left on map
      y: 11, // % from top on map
      tagline: 'Cao nguyên đá Đồng Văn & Đèo Mã Pí Lèng',
      driveLink: 'https://drive.google.com/drive/u/8/folders/1opLN1hiv1F8QqYhsFx4-7N2KNtg1wIRh',
      cardSelector: '.travel-card:nth-of-type(1)'
    },
    {
      id: 'taxua',
      name: 'Tà Xùa (Sơn La)',
      region: 'Tây Bắc',
      x: 37,
      y: 19,
      tagline: 'Săn mây trên đỉnh Tà Xùa & Sống lưng khủng long',
      driveLink: 'https://drive.google.com/drive/u/8/folders/1zWM06jfZbERZRZMLuF8mAWCcWaoPCCqU',
      cardSelector: '.travel-card:nth-of-type(4)'
    },
    {
      id: 'catba',
      name: 'Cát Bà (Hải Phòng)',
      region: 'Vịnh Bắc Bộ',
      x: 58,
      y: 21,
      tagline: 'Đảo ngọc Lan Hạ & Vườn quốc gia Cát Bà',
      driveLink: 'https://drive.google.com/drive/u/8/folders/1cTF-ColDV0o_ysnoILlxfCIpOgd3hI4b',
      cardSelector: '.travel-card:nth-of-type(3)'
    },
    {
      id: 'ninhbinh',
      name: 'Ninh Bình',
      region: 'Cố Đô',
      x: 50,
      y: 26,
      tagline: 'Tràng An, Tam Cốc & Hang Múa',
      driveLink: 'https://drive.google.com/drive/u/8/folders/1tfgew2KSTuRzUzej1U9l3GxtaGvD0MDi',
      cardSelector: '.travel-card:nth-of-type(2)'
    }
  ];

  function initTravelMap() {
    const mapWrapper = document.getElementById('vietnam-travel-map-container');
    if (!mapWrapper) return;

    // Render Pin Markers onto map
    const pinsContainer = document.getElementById('travel-map-pins');
    if (!pinsContainer) return;

    pinsContainer.innerHTML = '';

    LOCATIONS.forEach((loc) => {
      const pin = document.createElement('div');
      pin.className = 'travel-map-pin';
      pin.style.left = `${loc.x}%`;
      pin.style.top = `${loc.y}%`;
      pin.setAttribute('data-loc-id', loc.id);

      pin.innerHTML = `
        <div class="pin-pulse"></div>
        <div class="pin-dot"></div>
        <div class="pin-label">${loc.name}</div>
      `;

      pin.addEventListener('click', () => {
        selectLocation(loc, pin);
      });

      pinsContainer.appendChild(pin);
    });

    // Default select first location
    selectLocation(LOCATIONS[1]); // Select Tà Xùa by default as highlight
  }

  function selectLocation(loc, pinElement) {
    // Update active pin
    document.querySelectorAll('.travel-map-pin').forEach((p) => p.classList.remove('active'));
    if (pinElement) {
      pinElement.classList.add('active');
    } else {
      const targetPin = document.querySelector(`.travel-map-pin[data-loc-id="${loc.id}"]`);
      if (targetPin) targetPin.classList.add('active');
    }

    // Update info panel
    const titleEl = document.getElementById('map-selected-title');
    const regionEl = document.getElementById('map-selected-region');
    const descEl = document.getElementById('map-selected-desc');
    const driveBtn = document.getElementById('map-selected-drive-btn');
    const scrollBtn = document.getElementById('map-selected-scroll-btn');

    if (titleEl) titleEl.textContent = loc.name;
    if (regionEl) regionEl.textContent = loc.region;
    if (descEl) descEl.textContent = loc.tagline;
    if (driveBtn) driveBtn.href = loc.driveLink;

    if (scrollBtn) {
      scrollBtn.onclick = (e) => {
        e.preventDefault();
        const card = document.querySelector(loc.cardSelector);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('highlight-flash');
          setTimeout(() => card.classList.remove('highlight-flash'), 2000);
        }
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTravelMap);
  } else {
    initTravelMap();
  }
})();
