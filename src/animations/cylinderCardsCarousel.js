const CARD_VIDEOS = [
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_030111_a9e15665-d379-4a7f-8116-695bbe452ad1.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_171347_f640c30d-ec21-426a-98bc-77e07c2c60cb.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_115655_b4d9cd77-feed-43cd-a198-af78ebdf1f7a.mp4'
];

const CARD_DETAILS = [
  {
    tier: 'TITANIUM',
    sub: 'Corporate Platinum',
    number: '•••• 8814',
    fullNumber: '4232 8908 1121 8814',
    name: 'ALEXANDER VORONOV',
    cvv: '842',
    currency: '€'
  },
  {
    tier: 'OBSIDIAN',
    sub: 'Private Banking',
    number: '•••• 5590',
    fullNumber: '5375 8891 2234 5590',
    name: 'ALEXANDER VORONOV',
    cvv: '382',
    currency: '$'
  },
  {
    tier: 'EMERALD',
    sub: 'Global Treasury',
    number: '•••• 3210',
    fullNumber: '5457 4120 7733 3210',
    name: 'ALEXANDER VORONOV',
    cvv: '309',
    currency: '£'
  },
  {
    tier: 'HOLOGRAM',
    sub: 'Cyber Security',
    number: '•••• 4921',
    fullNumber: '4154 7831 9904 4921',
    name: 'ALEXANDER VORONOV',
    cvv: '591',
    currency: '€'
  },
  {
    tier: 'AURORA',
    sub: 'SEPA Instant',
    number: '•••• 2468',
    fullNumber: '4441 5567 1223 2468',
    name: 'ALEXANDER VORONOV',
    cvv: '491',
    currency: '$'
  }
];

export class CylinderCardsCarousel {
  constructor(stageEl, options = {}) {
    this.stage = stageEl;
    if (!this.stage) return;

    this.cardCount = 5;
    this.currentIndex = 0;
    this.targetIndex = 0;
    this.progress = 0; // floating position 0..cardCount
    this.isFlipped = false;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.metrics = { cardW: 340, cardH: 214, radiusX: 380, radiusZ: 260 };

    this.isDragging = false;
    this.startX = 0;
    this.lastX = 0;
    this.dragDelta = 0;
    this.hasMoved = false;

    this.cards = [];
    this.thicknessLayers = [-1.47, -0.73, 0, 0.73, 1.47];
    this.isVisible = true;
    this.frameId = 0;

    // Optional UI Controls
    this.prevBtn = options.prevBtn || document.getElementById('cylinder-prev');
    this.nextBtn = options.nextBtn || document.getElementById('cylinder-next');
    this.tabsWrap = options.tabsWrap || document.getElementById('cylinder-tabs');
    this.flipBtn = options.flipBtn || document.getElementById('cylinder-flip-btn');

    this.buildDOM();
    this.updateMetrics();
    this.initEvents();

    this.tick = this.tick.bind(this);
    this.frameId = requestAnimationFrame(this.tick);
  }

  updateMetrics() {
    const w = this.stage.clientWidth || window.innerWidth;
    const isMobile = w < 640;
    const isTablet = w < 960;

    let cardW = 340;
    let radiusX = 390;
    let radiusZ = 240;

    if (isMobile) {
      cardW = Math.min(270, Math.round(w * 0.72));
      radiusX = Math.round(w * 0.44);
      radiusZ = 160;
    } else if (isTablet) {
      cardW = 300;
      radiusX = 310;
      radiusZ = 200;
    } else {
      cardW = 350;
      radiusX = 400;
      radiusZ = 260;
    }

    const cardH = Math.round(cardW / 1.59);
    this.metrics = { cardW, cardH, radiusX, radiusZ };

    if (this.viewport3D) {
      this.viewport3D.style.width = `${cardW}px`;
      this.viewport3D.style.height = `${cardH}px`;
    }

    this.cards.forEach(card => {
      card.style.width = `${cardW}px`;
      card.style.height = `${cardH}px`;
    });
  }

  buildDOM() {
    this.stage.innerHTML = '';

    const cameraSpace = document.createElement('div');
    cameraSpace.className = 'cylinder-camera-space';
    cameraSpace.style.perspective = '1350px';

    this.viewport3D = document.createElement('div');
    this.viewport3D.className = 'cylinder-viewport-3d';
    this.viewport3D.style.transformStyle = 'preserve-3d';

    for (let i = 0; i < this.cardCount; i++) {
      const cardEl = document.createElement('div');
      cardEl.className = 'cylinder-card-item';
      cardEl.dataset.index = i;
      cardEl.style.transformStyle = 'preserve-3d';
      cardEl.style.backfaceVisibility = 'visible';

      const videoSrc = CARD_VIDEOS[i % CARD_VIDEOS.length];
      const details = CARD_DETAILS[i % CARD_DETAILS.length];

      // Build physical 3D volumetric thickness by dense parallel layering
      this.thicknessLayers.forEach((zOffset, layerIdx) => {
        const isFrontFace = layerIdx === this.thicknessLayers.length - 1;
        const isBackFace = layerIdx === 0;

        // Middle structural slice
        if (!isFrontFace && !isBackFace) {
          const slice = document.createElement('div');
          slice.className = 'cylinder-card-layer cylinder-card-slice';
          slice.style.transform = `translateZ(${zOffset}px)`;
          cardEl.appendChild(slice);
          return;
        }

        // Front face slice
        if (isFrontFace) {
          const front = document.createElement('div');
          front.className = 'cylinder-card-layer cylinder-card-front';
          front.style.transform = `translateZ(${zOffset}px)`;
          front.style.backfaceVisibility = 'hidden';

          front.innerHTML = `
            <video src="${videoSrc}" autoplay loop muted playsinline preload="metadata" class="cylinder-card-video"></video>
            <div class="cylinder-card-front-overlay">
              <!-- Top Row: EMV Chip & Brand -->
              <div class="cylinder-card-top-bar">
                <div class="cylinder-card-chip">
                  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M20 8H40V14C40.0016 14.5299 40.2128 15.0377 40.5875 15.4125C40.9623 15.7872 41.4701 15.9984 42 16H59V24H42C41.4701 24.0016 40.9623 24.2128 40.5875 24.5875C40.2128 24.9623 40.0016 25.4701 40 26V52H20V8ZM18 8H8.00039C4.47435 8 1.56576 10.6083 1.08 14H18V8ZM1 16V24V26V34V36V44H18V36H1V34H18V26H1V24H18V16H1ZM1.08 46C1.56576 49.3917 4.47435 52 8.00039 52H18V46H1.08ZM42 14V8H52.0004C55.5264 8 58.4342 10.6084 58.92 14H42ZM59 26H42V34H59V26ZM59 36H42V44H59V36ZM52.0004 52H42V46H58.92C58.4342 49.3916 55.5264 52 52.0004 52Z" fill="url(#chip-grad-${i})" />
                    <defs>
                      <linearGradient id="chip-grad-${i}" x1="30" y1="8" x2="30" y2="52" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#ffffff" />
                        <stop offset="1" stop-color="#a3a3a3" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div class="cylinder-card-brand">
                  <div class="cylinder-brand-logo">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                    <span>NOVA</span>
                  </div>
                  <span class="cylinder-card-tier">${details.tier}</span>
                </div>
              </div>

              <!-- Mid Card Number -->
              <div class="cylinder-card-num-preview">${details.number}</div>

              <!-- Bottom Row: Cardholder & Intersecting Circles -->
              <div class="cylinder-card-bottom-row">
                <div class="cylinder-card-holder-meta">
                  <span class="meta-label">CARDHOLDER</span>
                  <span class="meta-name">${details.name}</span>
                </div>
                <div class="cylinder-card-intersecting-circles" aria-hidden="true">
                  <span class="circle-c1"></span>
                  <span class="circle-c2"></span>
                </div>
              </div>
            </div>
          `;
          cardEl.appendChild(front);
          return;
        }

        // Back face slice
        if (isBackFace) {
          const back = document.createElement('div');
          back.className = 'cylinder-card-layer cylinder-card-back';
          back.style.transform = `translateZ(${zOffset}px) rotateY(180deg)`;
          back.style.backfaceVisibility = 'hidden';

          back.innerHTML = `
            <div class="cylinder-card-back-blur">
              <video src="${videoSrc}" autoplay loop muted playsinline preload="metadata" class="cylinder-card-video"></video>
            </div>
            <!-- Real Dark Magnetic Stripe -->
            <div class="cylinder-card-magstripe"></div>
            <!-- Back Meta Info -->
            <div class="cylinder-card-back-meta">
              <div class="cylinder-card-back-number">${details.fullNumber}</div>
              <div class="cylinder-card-back-sub">
                <span class="back-name">${details.name}</span>
                <span class="back-dot">•</span>
                <span class="back-cvv">CVV: ${details.cvv}</span>
              </div>
            </div>
            <div class="cylinder-card-legal">NOVA PAY EUROPE • REG. #49201 • 24/7 SUPPORT: +44 20 7946 0912</div>
          `;
          cardEl.appendChild(back);
        }
      });

      // Click on card: if active -> flip, if neighbor -> rotate to it!
      cardEl.addEventListener('click', (e) => {
        if (this.hasMoved) return;
        const idx = parseInt(cardEl.dataset.index, 10);
        if (idx === Math.round(this.targetIndex)) {
          this.toggleFlip();
        } else {
          this.goToIndex(idx);
        }
      });

      this.viewport3D.appendChild(cardEl);
      this.cards.push(cardEl);
    }

    cameraSpace.appendChild(this.viewport3D);
    this.stage.appendChild(cameraSpace);
  }

  initEvents() {
    window.addEventListener('resize', () => this.updateMetrics(), { passive: true });

    // Track mouse coordinates for interactive 3D parallax tilt with inertia
    window.addEventListener('mousemove', (e) => {
      const rect = this.stage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rx = (e.clientX - centerX) / (window.innerWidth / 2);
      const ry = (e.clientY - centerY) / (window.innerHeight / 2);
      this.mouse.targetX = Math.max(-1, Math.min(1, rx));
      this.mouse.targetY = Math.max(-1, Math.min(1, ry));

      if (this.isDragging) {
        const dx = e.clientX - this.lastX;
        if (Math.abs(e.clientX - this.startX) > 4) this.hasMoved = true;
        this.progress -= dx * 0.0035;
        this.targetIndex = this.progress;
        this.lastX = e.clientX;
      }
    });

    document.addEventListener('mouseleave', () => {
      this.mouse.targetX = 0;
      this.mouse.targetY = 0;
    });

    // Mouse drag / swipe
    this.stage.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.hasMoved = false;
      this.startX = e.clientX;
      this.lastX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      // Snap to nearest integer index
      this.targetIndex = Math.round(this.progress);
      this.updateActiveTab(this.getNormalizedIndex(this.targetIndex));
    });

    // Touch support for mobile devices
    this.stage.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.isDragging = true;
        this.hasMoved = false;
        this.startX = e.touches[0].clientX;
        this.lastX = e.touches[0].clientX;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) {
        const dx = e.touches[0].clientX - this.lastX;
        if (Math.abs(e.touches[0].clientX - this.startX) > 4) this.hasMoved = true;
        this.progress -= dx * 0.004;
        this.targetIndex = this.progress;
        this.lastX = e.touches[0].clientX;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.targetIndex = Math.round(this.progress);
      this.updateActiveTab(this.getNormalizedIndex(this.targetIndex));
    });

    // UI Buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }
    if (this.flipBtn) {
      this.flipBtn.addEventListener('click', () => this.toggleFlip());
    }

    if (this.tabsWrap) {
      this.tabsWrap.querySelectorAll('.cylinder-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index, 10);
          this.goToIndex(idx);
        });
      });
    }

    // Observer to pause animation loop when scrolled past
    const observer = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(this.stage);
  }

  getNormalizedIndex(idx) {
    return ((Math.round(idx) % this.cardCount) + this.cardCount) % this.cardCount;
  }

  goToIndex(targetIdx) {
    this.isFlipped = false;
    // Find closest shortest circular path to targetIdx from current progress
    const curNorm = this.getNormalizedIndex(this.progress);
    let diff = targetIdx - curNorm;
    if (diff > this.cardCount / 2) diff -= this.cardCount;
    if (diff < -this.cardCount / 2) diff += this.cardCount;
    this.targetIndex = Math.round(this.progress) + diff;
    this.updateActiveTab(targetIdx);
  }

  next() {
    this.isFlipped = false;
    this.targetIndex = Math.round(this.progress) + 1;
    this.updateActiveTab(this.getNormalizedIndex(this.targetIndex));
  }

  prev() {
    this.isFlipped = false;
    this.targetIndex = Math.round(this.progress) - 1;
    this.updateActiveTab(this.getNormalizedIndex(this.targetIndex));
  }

  toggleFlip() {
    this.isFlipped = !this.isFlipped;
  }

  updateActiveTab(idx) {
    if (!this.tabsWrap) return;
    this.tabsWrap.querySelectorAll('.cylinder-tab-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
    });
  }

  tick() {
    this.frameId = requestAnimationFrame(this.tick);
    if (!this.isVisible) return;

    // Smoothly spring towards targetIndex when not actively dragging
    if (!this.isDragging) {
      this.progress += (this.targetIndex - this.progress) * 0.1;
    }

    // Mouse inertia damping
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    const { radiusX, radiusZ } = this.metrics;
    const continuousProgress = this.progress;

    for (let i = 0; i < this.cardCount; i++) {
      const card = this.cards[i];
      if (!card) continue;

      // Solve circular offset in [-cardCount/2, cardCount/2]
      let offset = i - continuousProgress;
      const halfCount = this.cardCount / 2;
      while (offset > halfCount) offset -= this.cardCount;
      while (offset < -halfCount) offset += this.cardCount;

      const absOffset = Math.abs(offset);
      const angleRad = (offset / this.cardCount) * (Math.PI * 2);

      // Cards further in back (> 1.8 units away) can be gracefully hidden
      if (absOffset > 2.2) {
        card.style.visibility = 'hidden';
        continue;
      } else {
        card.style.visibility = 'visible';
      }

      // Horizontal Cylinder Math:
      // X follows sine (left-to-right spread)
      const x = Math.sin(angleRad) * radiusX;
      // Z follows cosine (center card at front, side cards push back)
      const z = (Math.cos(angleRad) - 1) * radiusZ;
      // Y stays cleanly centered (no flying upwards over section text!)
      const y = 0;

      // Rotation around Y follows angle
      const cylinderRotY = -angleRad * (180 / Math.PI) * 0.65;

      // Factor of closeness to center: 1.0 = exact center, 0.0 = sides
      const centerFactor = Math.max(0, 1 - absOffset * 0.85);

      // Interactive mouse parallax tilt (applied predominantly to center/active card)
      const activeTiltX = -this.mouse.y * 12 * centerFactor;
      const activeTiltY = this.mouse.x * 15 * centerFactor;

      // Flip on center card when isFlipped
      const flipY = (centerFactor > 0.8 && this.isFlipped) ? 180 : 0;

      const totalRotX = activeTiltX;
      const totalRotY = cylinderRotY + activeTiltY + flipY;
      const scale = 0.82 + 0.18 * Math.max(0, Math.cos(angleRad));

      card.style.zIndex = Math.round(z + 500).toString();
      card.style.opacity = Math.max(0.25, Math.min(1, Math.cos(angleRad) * 1.3)).toFixed(2);

      card.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${totalRotX.toFixed(2)}deg) rotateY(${totalRotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    }
  }

  destroy() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
  }
}
