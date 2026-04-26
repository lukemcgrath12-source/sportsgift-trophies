// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  }

  // Mark active nav link
  const links = document.querySelectorAll('[data-nav]');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    if (link.getAttribute('href') === path) {
      link.classList.add('text-cyan-400', 'font-semibold');
    }
  });
});
