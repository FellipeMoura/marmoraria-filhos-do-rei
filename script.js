
const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('siteNav');
const budgetForm = document.getElementById('budgetForm');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/* Parallax discreto no hero, desativado se o usuário preferir menos movimento */
const heroImage = document.getElementById('heroImage');
if (heroImage && !prefersReducedMotion) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const offset = Math.min(window.scrollY * 0.06, 40);
      heroImage.style.transform = `translateY(${offset}px) scale(1.08)`;
      ticking = false;
    });
  }, { passive: true });
}

/* Encontre a pedra ideal */
const FINDER_RECOMMENDATIONS = {
  cozinha: 'Cozinhas costumam valorizar granitos e mármores claros do nosso catálogo, como Branco Dallas e Branco Carrara, que trazem clareza e resistência para o dia a dia.',
  banheiro: 'Para banheiros, peças como Branco Siena e Branco Itaúnas ajudam a criar um visual clean e sofisticado.',
  gourmet: 'Em áreas gourmet, pedras como Mont Blanc e Branco Dallas dão um toque elegante para bancadas e ilhas.',
  escada: 'Em escadas, buscamos pedras resistentes e com bom acabamento — fale com a gente para indicar a melhor opção do catálogo para o seu projeto.',
  bancada: 'Bancadas ganham personalidade com pedras como Branco Prime e Mont Blanc, disponíveis em nosso catálogo.',
  nicho: 'Nichos costumam usar acabamentos como Branco Prime, trazendo um resultado clean e discreto.'
};

const finderChips = document.getElementById('finderChips');
const finderText = document.getElementById('finderText');

if (finderChips && finderText) {
  const chips = Array.from(finderChips.querySelectorAll('.finder-chip'));

  const selectRoom = (room) => {
    chips.forEach((chip) => {
      const isActive = chip.dataset.room === room;
      chip.classList.toggle('active', isActive);
      chip.setAttribute('aria-selected', String(isActive));
    });
    finderText.textContent = FINDER_RECOMMENDATIONS[room] || '';
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => selectRoom(chip.dataset.room));
  });

  selectRoom(chips[0].dataset.room);
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
  const cards = [];

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
    cards.push(card);
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

  const updateActiveCard = () => {
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const cardCenter = r.left + r.width / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    cards.forEach((card, i) => card.classList.toggle('is-active', i === closest));
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
    updateActiveCard();
    clearTimeout(scrollSettleTimeout);
    scrollSettleTimeout = setTimeout(() => {
      const step = getStep();
      const index = Math.round(track.scrollLeft / step);
      currentIndex = Math.max(0, Math.min(total - 1, index));
      updateDots(currentIndex);
    }, 120);
  }, { passive: true });

  updateDots(0);
  window.requestAnimationFrame(updateActiveCard);

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
    if (prefersReducedMotion) return;
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

/* Ambientes Inspiradores — cards por categoria com galeria em modal (independente do carrossel de pedras) */
(() => {
  const AMBIENTES_FOLDER = 'assets/ambientes/';
  const AMBIENTES_CATEGORIES = [
    { label: 'Cozinhas', files: ['539fd3f9-38b4-459c-9674-9b3822d3aca8.webp', 'angulo.webp', 'angulo1.webp', 'angulo 2.webp', 'ilha 2.webp', 'marrom imperador 1.webp', 'marrom imperador 3.webp'] },
    { label: 'Banheiros', files: ['verde ubatuba banheiro 1.webp', 'VERDE UBATUBA 2.webp', 'VERDE UBATUBA 3.webp'] },
    { label: 'Ilhas Gourmet', files: ['preto são gabriel.webp', 'preto são gabriel 2.webp', 'preto são gabriel 3.webp', 'ilha gourmet.webp'] },
    { label: 'Nichos', files: ['nicho 1.webp', 'nicho 2.webp', 'nicho 3.webp'] },
    { label: 'Bancadas', files: ['bege bahia centro de mesa.webp', 'preto indiano.webp', 'quartzo rosa.webp'] },
    { label: 'Sala', files: ['bege bahia 1.webp', 'bege bahia 2.webp', 'bege bahia 3.webp'] },
    { label: 'Painéis', files: ['preto via lactea 1.webp', 'preto via lactea 2.webp', 'preto via lactea 3.webp'] },
    { label: 'Escadas', files: ['escaada 1.webp', 'escada 2.webp', 'escada angulo 3.webp'] }
  ];

  const AMBIENTES_DIMS = {
    '539fd3f9-38b4-459c-9674-9b3822d3aca8.webp': [1536, 1024],
    'angulo.webp': [1536, 1024],
    'angulo1.webp': [1536, 1024],
    'angulo 2.webp': [1536, 1024],
    'bege bahia 1.webp': [1536, 1024],
    'bege bahia 2.webp': [1536, 1024],
    'bege bahia 3.webp': [1536, 1024],
    'bege bahia centro de mesa.webp': [1536, 1024],
    'escaada 1.webp': [1122, 1402],
    'escada 2.webp': [1122, 1402],
    'escada angulo 3.webp': [1086, 1448],
    'ilha 2.webp': [1402, 1122],
    'ilha gourmet.webp': [1402, 1122],
    'marrom imperador 1.webp': [1402, 1122],
    'marrom imperador 3.webp': [1402, 1122],
    'nicho 1.webp': [1536, 1024],
    'nicho 2.webp': [1536, 1024],
    'nicho 3.webp': [1536, 1024],
    'preto indiano.webp': [1536, 1024],
    'preto são gabriel.webp': [1536, 1024],
    'preto são gabriel 2.webp': [1536, 1024],
    'preto são gabriel 3.webp': [1536, 1024],
    'preto via lactea 1.webp': [1536, 1024],
    'preto via lactea 2.webp': [1536, 1024],
    'preto via lactea 3.webp': [1536, 1024],
    'quartzo rosa.webp': [1536, 1024],
    'VERDE UBATUBA 2.webp': [1536, 1024],
    'VERDE UBATUBA 3.webp': [1536, 1024],
    'verde ubatuba banheiro 1.webp': [1536, 1024]
  };

  const grid = document.getElementById('inspiringGrid');
  const modal = document.getElementById('inspiringModal');
  const lightbox = document.getElementById('inspiringLightbox');
  if (!grid || !modal || !lightbox) return;

  const modalTitle = document.getElementById('inspiringModalTitle');
  const modalGallery = document.getElementById('inspiringModalGallery');
  const lightboxImage = document.getElementById('inspiringLightboxImage');
  const lightboxPrev = lightbox.querySelector('.inspiring-lightbox-prev');
  const lightboxNext = lightbox.querySelector('.inspiring-lightbox-next');

  const fileUrl = (file) => AMBIENTES_FOLDER + encodeURIComponent(file);
  const thumbUrl = (file) => AMBIENTES_FOLDER + 'thumbs/' + encodeURIComponent(file);
  const setDims = (img, file) => {
    const dims = AMBIENTES_DIMS[file];
    if (dims) { img.width = dims[0]; img.height = dims[1]; }
  };

  let activeCategory = null;
  let lightboxIndex = 0;

  const renderLightboxImage = () => {
    const file = activeCategory.files[lightboxIndex];
    lightboxImage.src = fileUrl(file);
    lightboxImage.alt = `${activeCategory.label} — Marmoraria Filhos do Rei`;
    setDims(lightboxImage, file);
  };

  const openLightbox = (category, index) => {
    activeCategory = category;
    lightboxIndex = index;
    renderLightboxImage();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  };

  const stepLightbox = (direction) => {
    if (!activeCategory) return;
    const total = activeCategory.files.length;
    lightboxIndex = ((lightboxIndex + direction) % total + total) % total;
    renderLightboxImage();
  };

  const openInspiringModal = (category) => {
    modalTitle.textContent = category.label;
    modalGallery.innerHTML = '';
    category.files.forEach((file, index) => {
      const img = document.createElement('img');
      img.src = fileUrl(file);
      img.alt = `${category.label} — Marmoraria Filhos do Rei`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.tabIndex = 0;
      setDims(img, file);
      img.addEventListener('click', () => openLightbox(category, index));
      modalGallery.appendChild(img);
    });
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeInspiringModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  AMBIENTES_CATEGORIES.forEach((category) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'inspiring-card';
    card.setAttribute('aria-label', `Ver galeria de ${category.label}`);

    const img = document.createElement('img');
    img.src = thumbUrl(category.files[0]);
    img.alt = category.label;
    img.loading = 'lazy';
    img.decoding = 'async';
    const coverDims = AMBIENTES_DIMS[category.files[0]];
    if (coverDims) {
      img.width = 600;
      img.height = Math.round(600 * (coverDims[1] / coverDims[0]));
    }

    const label = document.createElement('span');
    label.className = 'inspiring-card-label';
    label.textContent = category.label;

    card.appendChild(img);
    card.appendChild(label);
    card.addEventListener('click', () => openInspiringModal(category));

    grid.appendChild(card);
  });

  modal.querySelectorAll('[data-inspiring-close]').forEach((element) => {
    element.addEventListener('click', closeInspiringModal);
  });

  lightbox.querySelectorAll('[data-lightbox-close]').forEach((element) => {
    element.addEventListener('click', closeLightbox);
  });
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => stepLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => stepLightbox(1));

  document.addEventListener('keydown', (event) => {
    if (lightbox.classList.contains('open')) {
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') stepLightbox(-1);
      if (event.key === 'ArrowRight') stepLightbox(1);
      return;
    }
    if (event.key === 'Escape' && modal.classList.contains('open')) closeInspiringModal();
  });
})();
