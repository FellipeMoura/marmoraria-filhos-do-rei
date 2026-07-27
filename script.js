
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

const CATALOG_CATEGORY_LABELS = {
  granitos: 'Granito',
  marmores: 'Mármore',
  quartzitos: 'Quartzito',
  acabamentos: 'Acabamento'
};

const CATALOG_STONES = [
  { id: 1, name: 'Nanoglass', category: 'acabamentos' },
  { id: 2, name: 'Via Láctea', category: 'granitos' },
  { id: 3, name: 'Café Imperial', category: 'granitos' },
  { id: 4, name: 'Branco Itaúnas', category: 'granitos' },
  { id: 5, name: 'Branco Siena', category: 'granitos' },
  { id: 6, name: 'Cinza Corumbá', category: 'granitos' },
  { id: 7, name: 'Calacatta', category: 'marmores' },
  { id: 8, name: 'Branco Dallas', category: 'granitos' },
  { id: 9, name: 'Preto São Gabriel', category: 'granitos' },
  { id: 10, name: 'Travertino Navona', category: 'marmores' },
  { id: 11, name: 'Crema Marfil', category: 'marmores' },
  { id: 12, name: 'Branco Dallas com Bordeaux', category: 'granitos' },
  { id: 13, name: 'Ônix Verde', category: 'marmores' },
  { id: 14, name: 'Bianco Gioia', category: 'marmores' },
  { id: 15, name: 'Mármore Carrara', category: 'marmores' },
  { id: 16, name: 'White Prime', category: 'quartzitos' },
  { id: 17, name: 'Piguês', category: 'quartzitos' },
  { id: 18, name: 'Verde Ubatuba', category: 'granitos' },
  { id: 19, name: 'Branco Paraná', category: 'granitos' },
  { id: 20, name: 'Preto Absoluto', category: 'granitos' },
  { id: 21, name: 'Titanium Gold', category: 'granitos' },
  { id: 22, name: 'Cinza Andorinha', category: 'granitos' },
  { id: 23, name: 'Branco Fortaleza', category: 'granitos' },
  { id: 24, name: 'Ouro Brasil', category: 'granitos' },
  { id: 25, name: 'Amarelo Icaraí', category: 'granitos' },
  { id: 26, name: 'Nero Marquina', category: 'marmores' },
  { id: 27, name: 'Quartzito Verde', category: 'quartzitos' },
  { id: 28, name: 'Ônix Branco', category: 'marmores' },
  { id: 29, name: 'Juparaná Bordeaux', category: 'granitos' },
  { id: 30, name: 'Giallo Ornamental', category: 'granitos' }
];

const catalogTrack = document.getElementById('catalogTrack');
const catalogFilters = document.getElementById('catalogFilters');
const catalogModal = document.getElementById('catalogModal');

if (catalogTrack && catalogFilters && catalogModal) {
  const catalogPrev = document.querySelector('.catalog-arrow-prev');
  const catalogNext = document.querySelector('.catalog-arrow-next');
  const catalogModalImage = document.getElementById('catalogModalImage');
  const catalogModalTitle = document.getElementById('catalogModalTitle');
  const catalogModalCategory = document.getElementById('catalogModalCategory');
  const catalogModalWhatsapp = document.getElementById('catalogModalWhatsapp');

  const stoneImage = (stone) => `assets/pedras/${stone.id}.webp`;

  const openCatalogModal = (stone) => {
    catalogModalImage.src = stoneImage(stone);
    catalogModalImage.alt = stone.name;
    catalogModalTitle.textContent = stone.name;
    catalogModalCategory.textContent = CATALOG_CATEGORY_LABELS[stone.category];

    const message = `Olá! Tenho interesse na pedra ${stone.name} e gostaria de solicitar um orçamento.`;
    catalogModalWhatsapp.href = `https://wa.me/5562994745438?text=${encodeURIComponent(message)}`;

    catalogModal.classList.add('open');
    catalogModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeCatalogModal = () => {
    catalogModal.classList.remove('open');
    catalogModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  catalogModal.querySelectorAll('[data-modal-close]').forEach((element) => {
    element.addEventListener('click', closeCatalogModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCatalogModal();
  });

  const renderCatalog = (filter) => {
    catalogTrack.innerHTML = '';
    const items = filter === 'todos'
      ? CATALOG_STONES
      : CATALOG_STONES.filter((stone) => stone.category === filter);

    items.forEach((stone) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'catalog-card';
      card.setAttribute('aria-label', `Ver detalhes de ${stone.name}`);

      const imageWrap = document.createElement('div');
      imageWrap.className = 'catalog-card-image';

      const img = document.createElement('img');
      img.src = stoneImage(stone);
      img.alt = stone.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 640;
      img.height = 800;
      imageWrap.appendChild(img);

      const info = document.createElement('div');
      info.className = 'catalog-card-info';

      const title = document.createElement('strong');
      title.textContent = stone.name;

      const category = document.createElement('span');
      category.textContent = CATALOG_CATEGORY_LABELS[stone.category];

      info.appendChild(title);
      info.appendChild(category);

      card.appendChild(imageWrap);
      card.appendChild(info);
      card.addEventListener('click', () => openCatalogModal(stone));

      catalogTrack.appendChild(card);
    });

    catalogTrack.scrollTo({ left: 0, behavior: 'auto' });
  };

  catalogFilters.querySelectorAll('.catalog-filter').forEach((button) => {
    button.addEventListener('click', () => {
      catalogFilters.querySelectorAll('.catalog-filter').forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      renderCatalog(button.dataset.filter);
    });
  });

  const scrollCatalog = (direction) => {
    const card = catalogTrack.querySelector('.catalog-card');
    const gap = 18;
    const amount = card ? card.getBoundingClientRect().width + gap : 300;
    catalogTrack.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  if (catalogPrev) catalogPrev.addEventListener('click', () => scrollCatalog(-1));
  if (catalogNext) catalogNext.addEventListener('click', () => scrollCatalog(1));

  renderCatalog('todos');
}
