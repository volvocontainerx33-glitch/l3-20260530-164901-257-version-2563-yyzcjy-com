
(function(){
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  if (slides.length > 1) {
    let index = 0;
    const show = (i) => {
      slides.forEach((slide, j) => slide.classList.toggle('active', j === i));
    };
    show(index);
    setInterval(() => {
      index = (index + 1) % slides.length;
      show(index);
    }, 4500);
  } else if (slides.length === 1) {
    slides[0].classList.add('active');
  }

  document.querySelectorAll('[data-play-video]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('[data-player-wrap]');
      const video = wrap && wrap.querySelector('video');
      if (video) {
        video.play().catch(()=>{});
      }
      const overlay = wrap && wrap.querySelector('[data-player-overlay]');
      if (overlay) overlay.style.display = 'none';
    });
  });

  const searchInputs = document.querySelectorAll('[data-filter-input]');
  if (searchInputs.length) {
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const counter = document.querySelector('[data-filter-count]');
    const apply = () => {
      const values = Array.from(searchInputs).map(el => (el.value || '').trim().toLowerCase());
      let visible = 0;
      cards.forEach((card) => {
        const title = (card.dataset.title || '').toLowerCase();
        const summary = (card.dataset.summary || '').toLowerCase();
        const genre = (card.dataset.genre || '').toLowerCase();
        const year = (card.dataset.year || '').toLowerCase();
        const region = (card.dataset.region || '').toLowerCase();
        const tags = (card.dataset.tags || '').toLowerCase();
        const haystack = `${title} ${summary} ${genre} ${year} ${region} ${tags}`;
        const ok = values.every(v => !v || haystack.includes(v));
        card.classList.toggle('hidden', !ok);
        if (ok) visible += 1;
      });
      if (counter) counter.textContent = String(visible);
    };
    searchInputs.forEach((input) => input.addEventListener('input', apply));
    apply();
  }

  const categoryButtons = document.querySelectorAll('[data-category-filter]');
  if (categoryButtons.length) {
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    categoryButtons.forEach((btn) => btn.addEventListener('click', () => {
      const cat = btn.dataset.categoryFilter;
      cards.forEach(card => {
        const ok = cat === 'all' || card.dataset.category === cat;
        card.classList.toggle('hidden', !ok);
      });
      categoryButtons.forEach(b => b.classList.toggle('active', b === btn));
    }));
  }
})();
