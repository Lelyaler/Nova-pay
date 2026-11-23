import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { HolographicFoil } from '../animations/holographicFoil.js';

const MATERIAL_MAP = {
  obsidian: {
    name: 'Midnight Obsidian',
    label: 'OBSIDIAN',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_171347_f640c30d-ec21-426a-98bc-77e07c2c60cb.mp4',
    number: '•••• •••• •••• 5590'
  },
  titanium: {
    name: 'Brushed Titanium',
    label: 'TITANIUM',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_030111_a9e15665-d379-4a7f-8116-695bbe452ad1.mp4',
    number: '•••• •••• •••• 8814'
  },
  emerald: {
    name: 'Racing Emerald',
    label: 'EMERALD',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4',
    number: '•••• •••• •••• 3210'
  },
  hologram: {
    name: 'Prism Hologram',
    label: 'HOLOGRAM',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4',
    number: '•••• •••• •••• 4921'
  },
  aurora: {
    name: 'Aurora SEPA',
    label: 'AURORA',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_115655_b4d9cd77-feed-43cd-a198-af78ebdf1f7a.mp4',
    number: '•••• •••• •••• 2468'
  }
};

export class CardCustomizer {
  constructor(containerEl) {
    this.container = containerEl;
    this.currentMaterial = 'obsidian';
    this.isFrozen = false;

    this.initElements();
    this.initHolo();
    this.initEvents();
  }

  initElements() {
    this.cardEl = this.container.querySelector('#custom-card-preview');
    this.videoEl = this.container.querySelector('#custom-card-video');
    this.brandEl = this.container.querySelector('#custom-card-brand');
    this.numEl = this.container.querySelector('#custom-card-number');
    this.nameInput = this.container.querySelector('#cardholder-name-input');
    this.cardholderLabel = this.container.querySelector('#card-name-display');
    this.materialButtons = this.container.querySelectorAll('.mat-btn');
    this.freezeBtn = this.container.querySelector('#freeze-card-btn');
    this.orderBtn = this.container.querySelector('#order-card-btn');
    this.frostOverlay = this.container.querySelector('#card-frost-overlay');
    this.laserScanner = this.container.querySelector('#laser-scanner');
  }

  initHolo() {
    if (this.cardEl) {
      this.holoFoil = new HolographicFoil(this.cardEl, { enableMouse: true });
    }
  }

  initEvents() {
    if (this.cardEl) {
      const glare = this.cardEl.querySelector('.custom-card-glare');

      this.cardEl.addEventListener('mousemove', (e) => {
        const rect = this.cardEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotX = ((y - centerY) / centerY) * -12;
        const rotY = ((x - centerX) / centerX) * 12;

        this.cardEl.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

        if (glare) {
          glare.style.opacity = '1';
          glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%)`;
        }
      });

      this.cardEl.addEventListener('mouseleave', () => {
        this.cardEl.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        if (glare) glare.style.opacity = '0';
      });
    }

    if (this.nameInput && this.cardholderLabel) {
      this.nameInput.addEventListener('input', (e) => {
        const val = e.target.value.toUpperCase().slice(0, 20);
        e.target.value = val;
        this.cardholderLabel.textContent = val.trim().length > 0 ? val : 'ALEXANDER VORONOV';
      });
    }

    this.materialButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mat = btn.dataset.mat;
        if (mat) {
          this.materialButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.setMaterial(mat);
        }
      });
    });

    if (this.freezeBtn && this.frostOverlay) {
      this.freezeBtn.addEventListener('click', () => {
        this.isFrozen = !this.isFrozen;

        if (this.isFrozen && this.laserScanner) {
          gsap.fromTo(this.laserScanner,
            { top: '0%', opacity: 1, scaleX: 1 },
            { top: '100%', opacity: 0, duration: 0.65, ease: 'power2.inOut' }
          );
        }

        this.frostOverlay.classList.toggle('is-frozen', this.isFrozen);
        this.freezeBtn.classList.toggle('active', this.isFrozen);
        this.freezeBtn.querySelector('.btn-text').textContent = this.isFrozen ? 'Разморозить карту' : 'Заморозить карту';
      });
    }

    if (this.orderBtn) {
      this.orderBtn.addEventListener('click', () => {
        const holderName = this.nameInput && this.nameInput.value.trim() ? this.nameInput.value.trim() : 'ALEXANDER VORONOV';
        const matConfig = MATERIAL_MAP[this.currentMaterial] || MATERIAL_MAP.obsidian;
        document.dispatchEvent(new CustomEvent('nova:open-order-modal', {
          detail: {
            cardholder: holderName,
            materialKey: this.currentMaterial,
            materialName: matConfig.name
          }
        }));
      });
    }
  }

  setMaterial(matKey) {
    this.currentMaterial = matKey;
    const config = MATERIAL_MAP[matKey] || MATERIAL_MAP.obsidian;

    if (this.cardEl) {
      this.cardEl.className = `custom-card-body card-mat-${matKey}`;
    }

    if (this.videoEl && config.video) {
      this.videoEl.src = config.video;
      this.videoEl.play().catch(() => {});
    }

    if (this.brandEl) {
      this.brandEl.innerHTML = `NOVA <b>${config.label}</b>`;
    }

    if (this.numEl) {
      this.numEl.textContent = config.number;
    }

    gsap.fromTo(this.cardEl, 
      { scale: 0.96 }, 
      { scale: 1.0, duration: 0.35, ease: 'back.out(2)' }
    );
  }
}
