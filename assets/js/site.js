/* SportsGift Trophies: all site behaviour in one file. Loaded with defer on every page. */
(function () {
  'use strict';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Tracking ---------- */
  // Sends to Vercel Web Analytics custom events (Pro plan) and any dataLayer/gtag added later.
  window.sgTrack = function (name, props) {
    try { if (window.va) window.va('event', { name: name, data: props || {} }); } catch (e) {}
    try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, props || {})); } catch (e) {}
    try { if (window.gtag) window.gtag('event', name, props || {}); } catch (e) {}
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (h.indexOf('tel:') === 0) sgTrack('call_click', { page: location.pathname });
    else if (h.indexOf('mailto:') === 0) sgTrack('email_click', { page: location.pathname });
    else if (/catalogues\/.*\.pdf$/.test(h)) sgTrack('catalogue_open', { file: h.split('/').pop() });
  }, true);

  /* ---------- Header: scrolled state ---------- */
  var header = $('header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 60); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $('#navToggle');
  var nav = $('#mainNav');
  if (toggle && nav) {
    toggle.setAttribute('aria-controls', 'mainNav');
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    setOpen(false);
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); }
    });
  }

  /* ---------- Quote modal (homepage only) ---------- */
  var modal = $('#quoteModal');
  if (modal) {
    var lastFocus = null;
    var openModal = function () {
      lastFocus = document.activeElement;
      modal.classList.add('open');
      var first = $('input:not([type=hidden]), select, textarea', modal);
      if (first) setTimeout(function () { first.focus(); }, 50);
    };
    var closeModal = function () {
      modal.classList.remove('open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    // Any "Get a quote" link opens the modal on this page instead of leaving it
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href="contact.html#quote"]');
      if (a) { e.preventDefault(); openModal(); }
    });
    $$('[data-modal-close]', modal).forEach(function (b) { b.addEventListener('click', closeModal); });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
  }

  /* ---------- FAQ accordion ---------- */
  var faqButtons = $$('.faq-question');
  faqButtons.forEach(function (btn, i) {
    var answer = btn.nextElementSibling;
    if (!answer) return;
    answer.id = answer.id || 'faq-answer-' + (i + 1);
    btn.setAttribute('aria-controls', answer.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var wasOpen = answer.classList.contains('open');
      faqButtons.forEach(function (b) {
        b.classList.remove('open');
        b.setAttribute('aria-expanded', 'false');
        if (b.nextElementSibling) b.nextElementSibling.classList.remove('open');
      });
      if (!wasOpen) { answer.classList.add('open'); btn.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- Quote forms (Web3Forms) ---------- */
  // Every quote form has data-quote-form. Success goes to the thank-you page (counted in analytics).
  $$('form[data-quote-form]').forEach(function (form) {
    var btn = $('[type="submit"]', form);
    var status = $('.form-status', form);
    var label = btn ? btn.textContent : '';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) { status.hidden = true; status.textContent = ''; }
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      var fail = function () {
        if (status) { status.textContent = 'Something went wrong. Please try again or call (02) 9540 1000.'; status.hidden = false; }
        if (btn) { btn.disabled = false; btn.textContent = label; }
      };
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (!json || !json.success) return fail();
          sgTrack('quote_submitted', { form: form.id, page: location.pathname });
          var from = location.pathname.replace(/^\//, '') || 'index.html';
          window.location.href = 'thank-you.html?from=' + encodeURIComponent(from);
        })
        .catch(fail);
    });
  });

  /* ---------- Products: filter catalogues by sport (deep links like #netball work) ---------- */
  var grid = $('#catGrid');
  if (grid) {
    var buttons = $$('.x-filter');
    var cards = $$('.x-cat', grid);
    var count = $('#catCount');
    var apply = function (key, scroll) {
      var n = 0;
      cards.forEach(function (c) {
        var s = c.getAttribute('data-sport');
        var show = key === 'all' || s === key || s === 'all';
        c.hidden = !show;
        if (show && s !== 'all') n++;
      });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === key ? 'true' : 'false'); });
      if (count) count.textContent = n;
      if (scroll) { var f = $('.x-filters'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    };
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-filter');
        apply(k, false);
        if (history.replaceState) history.replaceState(null, '', k === 'all' ? location.pathname : '#' + k);
      });
    });
    var fromHash = function () {
      var hash = (location.hash || '').slice(1);
      if (buttons.some(function (b) { return b.getAttribute('data-filter') === hash; })) apply(hash, true);
    };
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  /* ---------- Gallery lightbox (native dialog) ---------- */
  var dlg = $('#lightbox');
  if (dlg && typeof dlg.showModal === 'function') {
    var big = document.createElement('img');
    dlg.appendChild(big);
    $$('.x-g').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = $('img', b);
        big.src = b.getAttribute('data-full');
        big.alt = t ? t.alt : '';
        dlg.showModal();
      });
    });
    $('.x-lightbox__close', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.x-reveal');
  if (reveals.length) {
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (e) { e.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (e) { io.observe(e); });
    }
  }
})();
