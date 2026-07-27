
const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('siteNav');
const budgetForm = document.getElementById('budgetForm');

const setScrolledState = () => {
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
};

window.addEventListener('scroll', setScrolledState, { passive: true });
window.addEventListener('load', setScrolledState);

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const element = entry.target;
      const target = Number(element.dataset.target || 0);
      const prefix = element.dataset.prefix || '';
      const suffix = element.dataset.suffix || '';
      const duration = 1400;
      const startTime = performance.now();

      const step = (timestamp) => {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(target * eased);
        const formatter = new Intl.NumberFormat('pt-BR');
        element.textContent = `${prefix}${formatter.format(currentValue)}${suffix}`;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          element.textContent = `${prefix}${formatter.format(target)}${suffix}`;
        }
      };

      window.requestAnimationFrame(step);
      observer.unobserve(element);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.metric-number').forEach((element) => counterObserver.observe(element));

document.getElementById('year').textContent = new Date().getFullYear();

if (budgetForm) {
  budgetForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const city = document.getElementById('city').value.trim();
    const project = document.getElementById('project').value.trim();

    const message = [
      `Olá! Meu nome é ${name}.`,
      `Sou de ${city} e gostaria de solicitar um orçamento.`,
      '',
      `Projeto: ${project}`
    ].join('\n');

    const url = `https://wa.me/5562994745438?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  });
}

/* Catálogo de Pedras — carrossel montado 100% via JS a partir de assets/carrossel/ */
(() => {
  const CATALOG_FOLDER = 'assets/carrossel/';
  const CATALOG_FILES = [
    'branco-carrara.webp',
    'branco-siena.webp',
    'branco-dallas.webp',
    'branco-itaunas.webp',
    'branco-prime.webp',
    'mont-blanc.webp'
  ];

  const carousel = document.getElementById('catalogCarousel');
  const track = document.getElementById('catalogTrack');
  const dotsWrap = document.getElementById('catalogDots');
  const modal = document.getElementById('catalogModal');

  if (!carousel || !track || !modal) return;

  const prevBtn = carousel.querySelector('.catalog-arrow-prev');
  const nextBtn = carousel.querySelector('.catalog-arrow-next');
  const modalImage = document.getElementById('catalogModalImage');
  const modalPrevBtn = modal.querySelector('.catalog-modal-prev');
  const modalNextBtn = modal.querySelector('.catalog-modal-next');

  const stones = CATALOG_FILES.map((file) => ({ file, src: CATALOG_FOLDER + file }));
  const total = stones.length;

  let currentIndex = 0;
  let modalIndex = 0;
  const dots = [];

  /* --- monta os cards dinamicamente --- */
  stones.forEach((stone, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'catalog-card';
    card.setAttribute('aria-label', `Ampliar imagem da pedra ${index + 1}`);

    const imageWrap = document.createElement('div');
    imageWrap.className = 'catalog-card-image';

    const img = document.createElement('img');
    img.src = stone.src;
    img.alt = `Pedra ${index + 1} do catálogo`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 640;
    img.height = 960;
    img.draggable = false;

    imageWrap.appendChild(img);
    card.appendChild(imageWrap);
    card.addEventListener('click', () => {
      if (track.dataset.dragged === 'true') return;
      openModal(index);
    });

    track.appendChild(card);
  });

  /* --- indicadores --- */
  stones.forEach((stone, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'catalog-dot';
    dot.setAttribute('aria-label', `Ir para pedra ${index + 1}`);
    dot.addEventListener('click', () => goToIndex(index));
    dotsWrap.appendChild(dot);
    dots.push(dot);
  });

  const updateDots = (index) => {
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  const getStep = () => {
    const card = track.querySelector('.catalog-card');
    if (!card) return 300;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
    return card.getBoundingClientRect().width + gap;
  };

  function goToIndex(index) {
    currentIndex = ((index % total) + total) % total;
    track.scrollTo({ left: currentIndex * getStep(), behavior: 'smooth' });
    updateDots(currentIndex);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goToIndex(currentIndex - 1); restartAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goToIndex(currentIndex + 1); restartAutoplay(); });

  let scrollSettleTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollSettleTimeout);
    scrollSettleTimeout = setTimeout(() => {
      const step = getStep();
      const index = Math.round(track.scrollLeft / step);
      currentIndex = Math.max(0, Math.min(total - 1, index));
      updateDots(currentIndex);
    }, 120);
  }, { passive: true });

  updateDots(0);

  /* --- arrastar com o mouse (desktop) --- */
  let isPointerDown = false;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  const DRAG_THRESHOLD = 5;

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') return;
    isPointerDown = true;
    isDragging = false;
    track.dataset.dragged = 'false';
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    stopAutoplay();
  });

  track.addEventListener('pointermove', (event) => {
    if (!isPointerDown || event.pointerType !== 'mouse') return;
    const delta = event.clientX - dragStartX;

    if (!isDragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      isDragging = true;
      track.dataset.dragged = 'true';
      track.classList.add('dragging');
      track.setPointerCapture(event.pointerId);
    }

    track.scrollLeft = dragStartScroll - delta;
  });

  const endDrag = (event) => {
    if (event && event.pointerType && event.pointerType !== 'mouse') return;
    isPointerDown = false;
    if (isDragging) {
      isDragging = false;
      track.classList.remove('dragging');
    }
    restartAutoplay();
    window.setTimeout(() => { track.dataset.dragged = 'false'; }, 50);
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointerleave', endDrag);
  track.addEventListener('pointercancel', endDrag);

  /* --- autoplay lento, pausa ao passar o mouse --- */
  const AUTOPLAY_DELAY = 4000;
  let autoplayTimer = null;

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = window.setInterval(() => goToIndex(currentIndex + 1), AUTOPLAY_DELAY);
  }
  function stopAutoplay() {
    if (autoplayTimer) window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('touchstart', stopAutoplay, { passive: true });

  startAutoplay();

  /* --- modal / lightbox --- */
  function renderModalImage() {
    const stone = stones[modalIndex];
    modalImage.src = stone.src;
    modalImage.alt = `Pedra ${modalIndex + 1} ampliada`;
  }

  function openModal(index) {
    modalIndex = ((index % total) + total) % total;
    renderModalImage();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    stopAutoplay();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    startAutoplay();
  }

  function modalStep(direction) {
    modalIndex = ((modalIndex + direction) % total + total) % total;
    renderModalImage();
  }

  modal.querySelectorAll('[data-modal-close]').forEach((element) => {
    element.addEventListener('click', closeModal);
  });

  if (modalPrevBtn) modalPrevBtn.addEventListener('click', () => modalStep(-1));
  if (modalNextBtn) modalNextBtn.addEventListener('click', () => modalStep(1));

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('open')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') modalStep(-1);
    if (event.key === 'ArrowRight') modalStep(1);
  });
})();
