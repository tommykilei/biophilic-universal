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
    }, { rootMargin: '0px 0px 200px 0px' });
    items.forEach((el) => io.observe(el));
  } else { items.forEach((el) => el.classList.add('in')); }

  // WhatsApp: set your number (digits only, with country code) to activate
  const WHATSAPP_NUMBER = '254746727615'; // e.g. '2547XXXXXXXX'
  document.querySelectorAll('[data-whatsapp]').forEach((a) => {
    if (!WHATSAPP_NUMBER) return;
    a.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Hello Biophilic Universal, I would like to plan a trip.');
    a.target = '_blank'; a.rel = 'noopener';
  });


  // Image placeholders: shimmer until each photo has loaded
  const cssLink = document.querySelector('link[href$="style.css"]');
  const cssBase = cssLink ? cssLink.href : location.href;
  document.querySelectorAll('.ph').forEach((el) => {
    const m = /url\(["']?([^"')]+)["']?\)/.exec(el.getAttribute('style') || '');
    if (!m) { el.classList.add('loaded'); return; }
    const img = new Image();
    const done = () => el.classList.add('loaded');
    img.onload = done; img.onerror = done;
    img.src = new URL(m[1], cssBase).href;
    if (img.complete) done();
  });

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


  // Enquiry forms (contact, car hire): send via WhatsApp, Gmail or email (backend comes in a later stage)
  const EMAIL = 'info@biophilictours.com';
  document.querySelectorAll('form[data-enquiry]').forEach((form) => {
    const status = form.querySelector('.form-status');
    const codeSel = form.querySelector('select[name="code"]');
    const phoneIn = form.querySelector('input[name="phone"]');
    if (codeSel && phoneIn) {
      codeSel.addEventListener('change', () => {
        phoneIn.placeholder = codeSel.value === '254' ? '7XX XXX XXX' : codeSel.value === '' ? 'e.g. +44 7700 900123' : 'Phone number';
      });
    }
    // Builds an international number such as +254712345678 from the country code and the digits typed
    const formatPhone = () => {
      if (!codeSel || !phoneIn) return '';
      let digits = String(phoneIn.value).replace(/\D/g, '').replace(/^0+/, '');
      if (!digits) return '';
      const code = codeSel.value;
      if (!code) return '+' + digits;
      if (code === '254' && digits.length === 12 && digits.startsWith('254')) digits = digits.slice(3);
      return '+' + code + digits;
    };
    const send = (channel) => {
      const nameField = form.elements['name'];
      const person = String(nameField.value).trim();
      if (!person) { status.textContent = 'Please enter your name.'; nameField.focus(); return; }
      const phone = formatPhone();
      if (phone) {
        const n = phone.length - 1;
        if (codeSel.value === '254' && phone.length !== 13) { status.textContent = 'Kenyan numbers have 9 digits after +254, for example 712 345 678.'; phoneIn.focus(); return; }
        if (n < 8 || n > 15) { status.textContent = 'Please check your phone number.'; phoneIn.focus(); return; }
      }
      const lines = [form.dataset.title];
      Array.from(form.elements).forEach((el) => {
        if (!el.name || el.name === 'code') return;
        const label = form.querySelector('label[for="' + el.id + '"]');
        const value = el.name === 'phone' ? phone : String(el.value).trim();
        lines.push((label ? label.textContent : el.name) + ': ' + (value || '-'));
      });
      const text = lines.join('\n');
      const subject = form.dataset.title + ' from ' + person;
      if (channel === 'gmail') {
        window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL) + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text), '_blank', 'noopener');
        status.textContent = 'Opening Gmail in a new tab.';
      } else if (channel === 'email') {
        window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
        status.textContent = 'Opening your email app.';
      } else {
        if (!WHATSAPP_NUMBER) { status.textContent = 'WhatsApp enquiries are being set up. Please use email for now.'; return; }
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        status.textContent = 'Opening WhatsApp with your enquiry.';
      }
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); send('whatsapp'); });
    form.querySelectorAll('[data-send]').forEach((b) => b.addEventListener('click', () => send(b.dataset.send)));
  });

  // Contact page: pre-fill the message when a visitor arrives from a tour (contact.html?topic=...)
  const topic = new URLSearchParams(location.search).get('topic');
  const msgBox = document.getElementById('c-msg');
  if (topic && msgBox && !msgBox.value) msgBox.value = 'I am interested in: ' + topic + '.';

  // Gallery: category filter and photo viewer
  const grid = document.getElementById('galleryGrid');
  if (grid) {
    const items = Array.from(grid.querySelectorAll('.g-item'));
    const chips = document.querySelectorAll('[data-filter]');
    chips.forEach((chip) => chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      items.forEach((it) => { it.hidden = !(f === 'all' || it.dataset.cat === f); });
    }));
    const dlg = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    let list = [], pos = 0;
    const show = (i) => {
      pos = (i + list.length) % list.length;
      const it = list[pos];
      lbImg.src = it.dataset.full;
      lbImg.alt = it.querySelector('img').alt;
    };
    items.forEach((it) => it.addEventListener('click', () => {
      list = items.filter((x) => !x.hidden);
      show(list.indexOf(it));
      dlg.showModal();
    }));
    document.getElementById('lbPrev').addEventListener('click', () => show(pos - 1));
    document.getElementById('lbNext').addEventListener('click', () => show(pos + 1));
    document.getElementById('lbClose').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(pos - 1);
      if (e.key === 'ArrowRight') show(pos + 1);
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
