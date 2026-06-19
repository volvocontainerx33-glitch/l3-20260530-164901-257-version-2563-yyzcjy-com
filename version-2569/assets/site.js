
(function(){
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root=document) => root.querySelector(sel);

  function ready(fn){
    if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu(){
    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => menu.classList.toggle('is-open'));
  }

  function initFilter(){
    const input = $('[data-filter-input]');
    if (!input) return;
    const cards = $$('[data-card]');
    if (!cards.length) return;
    const q = new URLSearchParams(location.search).get('q') || '';
    if (q) input.value = q;
    const apply = () => {
      const term = input.value.trim().toLowerCase();
      cards.forEach(card => {
        const hay = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year, card.dataset.tags, card.dataset.summary].join(' ').toLowerCase();
        const show = !term || hay.includes(term);
        card.style.display = show ? '' : 'none';
      });
      const countEl = $('[data-result-count]');
      if (countEl) {
        const visible = cards.filter(c => c.style.display !== 'none').length;
        countEl.textContent = visible;
      }
    };
    input.addEventListener('input', apply);
    apply();
  }

  function initCarousel(){
    $$('[data-carousel]').forEach(carousel => {
      const slides = $$('[data-slide]', carousel);
      const dots = $$('[data-dot]', carousel);
      if (!slides.length) return;
      let i = 0;
      const show = idx => {
        i = (idx + slides.length) % slides.length;
        slides.forEach((s, n) => s.classList.toggle('is-active', n === i));
        dots.forEach((d, n) => d.classList.toggle('is-active', n === i));
      };
      const next = () => show(i + 1);
      show(0);
      let timer = setInterval(next, 5000);
      carousel.addEventListener('mouseenter', () => clearInterval(timer));
      carousel.addEventListener('mouseleave', () => timer = setInterval(next, 5000));
      dots.forEach((dot, idx) => dot.addEventListener('click', () => show(idx)));
      const prevBtn = $('[data-prev]', carousel);
      const nextBtn = $('[data-next]', carousel);
      if (prevBtn) prevBtn.addEventListener('click', () => show(i - 1));
      if (nextBtn) nextBtn.addEventListener('click', () => show(i + 1));
    });
  }

  function initPlayers(){
    $$('[data-player]').forEach(box => {
      const video = $('video', box);
      const playBtn = $('[data-play]', box);
      const muteBtn = $('[data-mute]', box);
      const fsBtn = $('[data-fs]', box);
      const src = box.dataset.src;
      const poster = box.dataset.poster || '';
      if (!video || !src) return;
      if (poster) video.poster = poster;
      let hls = null;
      function load(){
        if (window.Hls && Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          box.classList.add('player-error');
          box.insertAdjacentHTML('afterbegin', '<div class="player-error-box">您的浏览器不支持 HLS 视频播放</div>');
        }
      }
      load();
      if (playBtn) playBtn.addEventListener('click', async () => {
        try {
          if (video.paused) await video.play(); else video.pause();
        } catch (e) {}
      });
      video.addEventListener('play', () => { if (playBtn) playBtn.textContent = '暂停'; });
      video.addEventListener('pause', () => { if (playBtn) playBtn.textContent = '播放'; });
      if (muteBtn) muteBtn.addEventListener('click', () => { video.muted = !video.muted; muteBtn.textContent = video.muted ? '取消静音' : '静音'; });
      if (fsBtn) fsBtn.addEventListener('click', async () => {
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else await box.requestFullscreen();
        } catch (e) {}
      });
    });
  }

  ready(() => {
    initMenu();
    initFilter();
    initCarousel();
    initPlayers();
  });
})();
