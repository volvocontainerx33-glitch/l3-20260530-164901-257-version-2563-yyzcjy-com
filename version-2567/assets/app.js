(function () {
  function toggleMobileNav() {
    var button = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        play();
      });
    });

    show(0);
    play();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    if (!scopes.length) {
      return;
    }

    scopes.forEach(function (scope) {
      var container = scope.closest('section') || document;
      var input = container.querySelector('[data-filter-input]');
      var region = container.querySelector('[data-filter-region]');
      var year = container.querySelector('[data-filter-year]');
      var type = container.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-row'));

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : '';
      }

      function apply() {
        var query = valueOf(input);
        var regionValue = valueOf(region);
        var yearValue = valueOf(year);
        var typeValue = valueOf(type);

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
          var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
          var cardType = (card.getAttribute('data-type') || '').toLowerCase();
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (regionValue && cardRegion.indexOf(regionValue) === -1 && text.indexOf(regionValue) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);
        });
      }

      [input, region, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function initPlayers() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    panels.forEach(function (panel) {
      var video = panel.querySelector('video');
      var button = panel.querySelector('[data-player-start]');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-src');
      var hls = null;
      var ready = false;

      function markPlaying() {
        panel.classList.add('is-playing');
      }

      function startPlayback() {
        markPlaying();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function loadSource() {
        if (!source) {
          return;
        }
        if (ready) {
          startPlayback();
          return;
        }
        ready = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            startPlayback();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
              return;
            }
            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              return;
            }
            hls.destroy();
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', startPlayback, { once: true });
          return;
        }

        video.src = source;
        startPlayback();
      }

      button.addEventListener('click', loadSource);
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          loadSource();
          return;
        }
        video.pause();
      });
      video.addEventListener('play', markPlaying);
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMobileNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();
