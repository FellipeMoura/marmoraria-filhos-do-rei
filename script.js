
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
