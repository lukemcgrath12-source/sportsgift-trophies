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
