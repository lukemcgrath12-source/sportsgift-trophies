document.addEventListener('DOMContentLoaded', () => {
  initIntroOverlay();
  initHeroCarousel();
  initScrollReveal();
});

function initIntroOverlay() {
  if (sessionStorage.getItem('sptIntroShown')) return;
  sessionStorage.setItem('sptIntroShown', 'true');

  const overlay = document.createElement('div');
  overlay.className = 'intro-overlay';
  overlay.innerHTML = `
    <img class="intro-logo" src="/assets/images/logo.png" alt="SportsGift Trophies logo" />
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener('animationend', event => {
    if (event.animationName === 'overlayFade') {
      overlay.remove();
    }
  });
}

function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  if (!slides.length) return;

  let activeIndex = 0;
  slides[activeIndex].classList.add('active');

  setInterval(() => {
    slides[activeIndex].classList.remove('active');
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add('active');
  }, 4000);
}

function initScrollReveal() {
  const targets = document.querySelectorAll('.fade-section');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  targets.forEach(target => observer.observe(target));
}
