(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initNav() {
    var button = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(next);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-filter-section]'));
    sections.forEach(function (section) {
      var input = section.querySelector('[data-search-input]');
      var select = section.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
      if (!cards.length) return;

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var year = select ? select.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre')
          ].join(' ').toLowerCase();
          var okQuery = !query || haystack.indexOf(query) !== -1;
          var okYear = !year || card.getAttribute('data-year') === year;
          card.hidden = !(okQuery && okYear);
        });
      }

      if (input) input.addEventListener('input', apply);
      if (select) select.addEventListener('change', apply);
      apply();
    });
  }

  function initPlayers() {
    var areas = Array.prototype.slice.call(document.querySelectorAll('[data-player-area]'));
    areas.forEach(function (area) {
      var video = area.querySelector('video');
      var button = area.querySelector('[data-play-button]');
      if (!video) return;
      var stream = video.getAttribute('data-stream');
      var prepared = false;

      function prepare() {
        if (prepared || !stream) return;
        prepared = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video._streamLoader = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      }

      function play() {
        prepare();
        var action = video.play();
        if (action && action.catch) {
          action.catch(function () {});
        }
      }

      if (button) button.addEventListener('click', play);
      video.addEventListener('click', play);
      video.addEventListener('play', function () {
        area.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        area.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        area.classList.remove('is-playing');
      });
    });
  }

  ready(function () {
    initNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();
