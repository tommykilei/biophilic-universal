// Biophilic Universal - homepage behaviour
(function () {
  const header = document.getElementById('header');
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');

  // Header turns solid after scrolling past the top
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    header.classList.toggle('scrolled', open || window.scrollY > 40);
  };
  btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMenu(false); btn.focus(); } });

  // Reveal image blocks once
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    items.forEach((el) => io.observe(el));
  } else { items.forEach((el) => el.classList.add('in')); }

  // WhatsApp: set your number (digits only, with country code) to activate
  const WHATSAPP_NUMBER = '254746727615'; // e.g. '2547XXXXXXXX'
  document.querySelectorAll('[data-whatsapp]').forEach((a) => {
    if (!WHATSAPP_NUMBER) return;
    a.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Hello Biophilic Universal, I would like to plan a trip.');
    a.target = '_blank'; a.rel = 'noopener';
  });


  // Skeleton: remove once the page (images included) has loaded
  const sk = document.getElementById('skeleton');
  const hideSkeleton = () => {
    if (!sk || sk.classList.contains('done')) return;
    sk.classList.add('done');
    setTimeout(() => sk.remove(), 500);
  };
  if (document.readyState === 'complete') hideSkeleton();
  else window.addEventListener('load', hideSkeleton);
  setTimeout(hideSkeleton, 6000); // safety net on very slow connections

  // Lazy-load background photos shortly before they scroll into view
  const bgs = document.querySelectorAll('[data-bg]');
  const loadBg = (el) => { el.style.setProperty('--img', 'url(' + el.dataset.bg + ')'); el.removeAttribute('data-bg'); };
  if ('IntersectionObserver' in window) {
    const bgIo = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { loadBg(en.target); bgIo.unobserve(en.target); } });
    }, { rootMargin: '500px 0px' });
    bgs.forEach((el) => bgIo.observe(el));
  } else { bgs.forEach(loadBg); }

  // Hero video: loops silently by default; the only control is play/pause.
  // It also pauses while scrolled out of view, which keeps scrolling smooth.
  const video = document.getElementById('heroVideo');
  const toggle = document.getElementById('heroToggle');
  if (video && toggle) {
    let userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const label = () => {
      const playing = !video.paused;
      toggle.classList.toggle('is-paused', !playing);
      toggle.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
    };
    toggle.addEventListener('click', () => {
      if (video.paused) { userPaused = false; video.play(); } else { userPaused = true; video.pause(); }
    });
    video.addEventListener('play', label);
    video.addEventListener('pause', label);
    if (userPaused) video.pause(); else { const start = video.play(); if (start && start.catch) start.catch(label); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { if (!userPaused) video.play().catch(() => {}); }
        else video.pause();
      }, { threshold: 0.05 }).observe(video);
    }
    label();
  }


  // Stay enquiry form: opens WhatsApp with the details filled in (backend comes in a later stage)
  const stayForm = document.getElementById('stayForm');
  if (stayForm) {
    const status = document.getElementById('formStatus');
    stayForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(stayForm);
      if (!String(d.get('name')).trim()) { status.textContent = 'Please enter your name.'; stayForm.name.focus(); return; }
      if (!WHATSAPP_NUMBER) { status.textContent = 'Online enquiries are being set up. Please check back soon.'; return; }
      const msg = ['Stay enquiry', 'Name: ' + d.get('name'), 'Area: ' + (d.get('area') || '-'),
        'Check-in: ' + (d.get('checkin') || '-'), 'Check-out: ' + (d.get('checkout') || '-'),
        'Guests: ' + d.get('guests'), 'Add: ' + d.get('addon'), 'Notes: ' + (d.get('notes') || '-')].join('\n');
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      status.textContent = 'Opening WhatsApp with your enquiry.';
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
