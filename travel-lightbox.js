/**
 * Interactive Travel Lightbox Modal for Ngô Mạnh Hà Portfolio
 * Smoothly previews photos & videos of Ha Giang, Ninh Binh, Cat Ba, Ta Xua
 */

(function() {
  const TRIPS = [
    {
      id: 'hagiang',
      name: 'Hà Giang',
      region: 'Đông Bắc',
      tagline: 'Cao nguyên đá Đồng Văn & Đèo Mã Pí Lèng',
      desc: 'Chinh phục cung đường đèo hiểm trở bậc nhất Việt Nam, ngắm nhìn dòng sông Nho Quế xanh biếc như ngọc bích từ đỉnh Mã Pí Lèng và hòa mình vào cuộc sống mộc mạc của đồng bào vùng cao.',
      mediaType: 'video',
      mediaSrc: 'assets/hagiang_bg.mp4',
      thumbSrc: 'assets/hagiang_bg.mp4',
      driveLink: 'https://drive.google.com/drive/u/8/folders/1opLN1hiv1F8QqYhsFx4-7N2KNtg1wIRh'
    },
    {
      id: 'ninhbinh',
      name: 'Ninh Bình',
      region: 'Cố Đô',
      tagline: 'Tràng An, Tam Cốc & Hang Múa',
      desc: 'Hành trình chèo thuyền trên dòng sông Sào Khê xuyên qua các hang động kỳ ảo, leo đỉnh Hang Múa ngắm trọn non nước Tràng An và thăm cố đô Hoa Lư ngàn năm lịch sử.',
      mediaType: 'image',
      mediaSrc: 'assets/ninhbinh_bg.jpg',
      thumbSrc: 'assets/ninhbinh_bg.jpg',
      driveLink: 'https://drive.google.com/drive/u/8/folders/1tfgew2KSTuRzUzej1U9l3GxtaGvD0MDi'
    },
    {
      id: 'catba',
      name: 'Cát Bà',
      region: 'Hải Phòng / Vịnh Lan Hạ',
      tagline: 'Đảo ngọc Lan Hạ & Vườn quốc gia Cát Bà',
      desc: 'Lênh đênh giữa vịnh Lan Hạ hoang sơ với hàng trăm đảo đá vôi, trải nghiệm chèo thuyền kayak qua hang Sáng Tối và trekking xuyên rừng nhiệt đới Vườn Quốc Gia Cát Bà.',
      mediaType: 'image',
      mediaSrc: 'assets/catba_bg.jpg',
      thumbSrc: 'assets/catba_bg.jpg',
      driveLink: 'https://drive.google.com/drive/u/8/folders/1cTF-ColDV0o_ysnoILlxfCIpOgd3hI4b'
    },
    {
      id: 'taxua',
      name: 'Tà Xùa',
      region: 'Sơn La / Tây Bắc',
      tagline: 'Săn mây trên đỉnh Tà Xùa & Sống lưng khủng long',
      desc: 'Đón bình minh rực rỡ trên biển mây cuồn cuộn ngút ngàn tầm mắt, bước chân trên sống lưng khủng long Háng Đồng huyền thoại trong không khí se lạnh của đại ngàn Tây Bắc.',
      mediaType: 'image',
      mediaSrc: 'assets/taxua_bg.jpg',
      thumbSrc: 'assets/taxua_bg.jpg',
      driveLink: 'https://drive.google.com/drive/u/8/folders/1zWM06jfZbERZRZMLuF8mAWCcWaoPCCqU'
    }
  ];

  let currentIdx = 0;

  function init() {
    createLightboxDOM();
    bindCardClicks();
  }

  function createLightboxDOM() {
    if (document.getElementById('travel-lightbox-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'travel-lightbox-modal';
    modal.className = 'travel-lightbox-modal hidden';

    modal.innerHTML = `
      <div class="travel-lightbox-backdrop" id="tl-backdrop"></div>
      <div class="travel-lightbox-container glass-card">
        <button class="tl-close-btn" id="tl-close-btn" title="Đóng (Esc)">&times;</button>
        
        <!-- Media Viewport -->
        <div class="tl-viewport">
          <button class="tl-nav-btn tl-prev-btn" id="tl-prev-btn" title="Chuyến đi trước">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div class="tl-media-wrapper" id="tl-media-wrapper">
            <!-- Dynamic Image or Video -->
          </div>

          <button class="tl-nav-btn tl-next-btn" id="tl-next-btn" title="Chuyến đi tiếp theo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <!-- Info & Thumbnail Strip -->
        <div class="tl-info-panel">
          <div class="tl-meta-col">
            <div class="tl-tag-row">
              <span class="tl-region-badge" id="tl-region">Đông Bắc</span>
              <span class="tl-counter" id="tl-counter">1 / 4</span>
            </div>
            <h3 class="tl-title" id="tl-title">Hà Giang</h3>
            <p class="tl-tagline" id="tl-tagline">Cao nguyên đá Đồng Văn</p>
            <p class="tl-desc" id="tl-desc">Mô tả chuyến đi</p>
            <div class="tl-actions">
              <a href="#" target="_blank" class="btn btn-primary" id="tl-drive-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                <span>Mở Toàn Bộ Album 4K Trên Drive</span>
              </a>
            </div>
          </div>

          <!-- Thumbnails -->
          <div class="tl-thumbs-col">
            <div class="tl-thumbs-title">CÁC CHUYẾN ĐI ĐÃ KHÁM PHÁ</div>
            <div class="tl-thumbs-list" id="tl-thumbs-list">
              ${TRIPS.map((t, idx) => `
                <div class="tl-thumb-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
                  ${t.mediaType === 'video' 
                    ? `<video src="${t.mediaSrc}" muted></video>` 
                    : `<img src="${t.mediaSrc}" alt="${t.name}">`
                  }
                  <span class="tl-thumb-name">${t.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('tl-close-btn').addEventListener('click', closeLightbox);
    document.getElementById('tl-backdrop').addEventListener('click', closeLightbox);
    document.getElementById('tl-prev-btn').addEventListener('click', prevTrip);
    document.getElementById('tl-next-btn').addEventListener('click', nextTrip);

    // Thumbnails click
    const thumbs = modal.querySelectorAll('.tl-thumb-item');
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.getAttribute('data-idx'), 10);
        showTrip(idx);
      });
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
      if (modal.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevTrip();
      if (e.key === 'ArrowRight') nextTrip();
    });
  }

  function bindCardClicks() {
    const cards = document.querySelectorAll('.travel-card');
    cards.forEach((card, idx) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        // If clicking normal anchor to Drive, let it open lightbox instead or keep drive open
        e.preventDefault();
        openLightbox(idx);
      });
    });
  }

  function openLightbox(idx = 0) {
    const modal = document.getElementById('travel-lightbox-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    showTrip(idx);
  }

  function closeLightbox() {
    const modal = document.getElementById('travel-lightbox-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';

    // Pause any playing videos
    const video = modal.querySelector('video');
    if (video) video.pause();
  }

  function showTrip(idx) {
    if (idx < 0) idx = TRIPS.length - 1;
    if (idx >= TRIPS.length) idx = 0;
    currentIdx = idx;

    const trip = TRIPS[currentIdx];
    const wrapper = document.getElementById('tl-media-wrapper');
    const title = document.getElementById('tl-title');
    const region = document.getElementById('tl-region');
    const tagline = document.getElementById('tl-tagline');
    const desc = document.getElementById('tl-desc');
    const driveLink = document.getElementById('tl-drive-link');
    const counter = document.getElementById('tl-counter');

    if (trip.mediaType === 'video') {
      wrapper.innerHTML = `
        <video class="tl-active-media" src="${trip.mediaSrc}" controls autoplay loop playsinline></video>
      `;
    } else {
      wrapper.innerHTML = `
        <img class="tl-active-media" src="${trip.mediaSrc}" alt="${trip.name}">
      `;
    }

    title.textContent = trip.name;
    region.textContent = trip.region;
    tagline.textContent = trip.tagline;
    desc.textContent = trip.desc;
    driveLink.href = trip.driveLink;
    counter.textContent = `${currentIdx + 1} / ${TRIPS.length}`;

    // Update active thumb
    const thumbs = document.querySelectorAll('.tl-thumb-item');
    thumbs.forEach((th, i) => {
      th.classList.toggle('active', i === currentIdx);
    });
  }

  function prevTrip() {
    showTrip(currentIdx - 1);
  }

  function nextTrip() {
    showTrip(currentIdx + 1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
