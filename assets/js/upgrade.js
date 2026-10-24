/* SportsGift Trophies: small accessibility and usability layer, shared by every page. */
(function () {
  'use strict';

  // Mobile menu: expose state, close on Escape and after choosing a link
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.setAttribute('aria-controls', 'mainNav');
    toggle.setAttribute('aria-expanded', 'false');
    var sync = function () { toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false'); };
    toggle.addEventListener('click', function () { setTimeout(sync, 0); });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('open')) { nav.classList.remove('open'); toggle.classList.remove('open'); sync(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); toggle.classList.remove('open'); sync(); toggle.focus(); }
    });
  }

  // Quote modal (homepage): Escape to close, focus the first field, return focus afterwards
  var modal = document.getElementById('quoteModal');
  if (modal) {
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    var heading = modal.querySelector('h2, h3');
    if (heading) { heading.id = heading.id || 'quoteModalTitle'; modal.setAttribute('aria-labelledby', heading.id); }
    var lastFocus = null;
    new MutationObserver(function () {
      if (modal.classList.contains('open')) {
        lastFocus = document.activeElement;
        var first = modal.querySelector('input:not([type=hidden]), select, textarea');
        if (first) setTimeout(function () { first.focus(); }, 50);
      } else if (lastFocus && lastFocus.focus) {
        lastFocus.focus();
      }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) modal.classList.remove('open');
    });
    var status = document.getElementById('formStatus');
    if (status) { status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); }
  }

  // FAQ accordion: announce open/closed state
  var faqButtons = document.querySelectorAll('.faq-question');
  Array.prototype.forEach.call(faqButtons, function (btn, i) {
    var answer = btn.parentElement && btn.parentElement.querySelector('.faq-answer');
    if (!answer) return;
    answer.id = answer.id || 'faq-answer-' + (i + 1);
    btn.setAttribute('aria-controls', answer.id);
    var syncFaq = function () { btn.setAttribute('aria-expanded', answer.classList.contains('open') ? 'true' : 'false'); };
    syncFaq();
    btn.addEventListener('click', function () { setTimeout(function () { Array.prototype.forEach.call(faqButtons, function (b) {
      var a = document.getElementById(b.getAttribute('aria-controls')); if (a) b.setAttribute('aria-expanded', a.classList.contains('open') ? 'true' : 'false');
    }); }, 0); });
  });
})();

/* Products: filter catalogues by sport (deep links like products.html#netball still work) */
(function () {
  var grid = document.getElementById('catGrid');
  if (!grid) return;
  var buttons = document.querySelectorAll('.x-filter');
  var cards = grid.querySelectorAll('.x-cat');
  var count = document.getElementById('catCount');
  function apply(key, scroll) {
    var n = 0;
    Array.prototype.forEach.call(cards, function (c) {
      var s = c.getAttribute('data-sport');
      var show = key === 'all' || s === key || s === 'all';
      c.hidden = !show;
      if (show && s !== 'all') n++;
    });
    Array.prototype.forEach.call(buttons, function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === key ? 'true' : 'false'); });
    if (count) count.textContent = n;
    if (scroll) { var f = document.querySelector('.x-filters'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  Array.prototype.forEach.call(buttons, function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-filter');
      apply(k, false);
      if (history.replaceState) history.replaceState(null, '', k === 'all' ? location.pathname : '#' + k);
    });
  });
  var hash = (location.hash || '').slice(1);
  var known = Array.prototype.some.call(buttons, function (b) { return b.getAttribute('data-filter') === hash; });
  if (known) apply(hash, true);
})();

/* Gallery: lightbox using the native dialog element */
(function () {
  var dlg = document.getElementById('lightbox');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var img = dlg.querySelector('img');
  document.querySelectorAll('.x-g').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.querySelector('img');
      img.src = b.getAttribute('data-full');
      img.alt = t ? t.alt : '';
      dlg.showModal();
    });
  });
  dlg.querySelector('.x-lightbox__close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
})();
