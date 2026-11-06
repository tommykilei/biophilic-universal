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
  const WHATSAPP_NUMBER = '+254746727615'; // e.g. '2547XXXXXXXX'
  document.querySelectorAll('[data-whatsapp]').forEach((a) => {
    if (!WHATSAPP_NUMBER) return;
    a.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Hello Biophilic Universal, I would like to plan a trip.');
    a.target = '_blank'; a.rel = 'noopener';
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
