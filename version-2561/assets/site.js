(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('[data-toggle-menu]');
    var menu = qs('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCategoryFilter() {
    qsa('[data-category-filter]').forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = qs('[data-filter-keyword]', panel);
      var year = qs('[data-filter-year]', panel);
      var type = qs('[data-filter-type]', panel);
      var cards = qsa('[data-card]', scope);

      if (year && year.options.length <= 1) {
        var years = Array.from(new Set(cards.map(function (card) {
          return card.getAttribute('data-year');
        }).filter(Boolean))).sort().reverse();
        years.forEach(function (item) {
          var option = document.createElement('option');
          option.value = item;
          option.textContent = item;
          year.appendChild(option);
        });
      }

      if (type && type.options.length <= 1) {
        var types = Array.from(new Set(cards.map(function (card) {
          return card.getAttribute('data-type');
        }).filter(Boolean))).sort();
        types.forEach(function (item) {
          var option = document.createElement('option');
          option.value = item;
          option.textContent = item;
          type.appendChild(option);
        });
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
          var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
          card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
        });
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function createSearchCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + movie.url + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="score-pill">' + movie.rating + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="meta-line">' + movie.year + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSearchPage() {
    var page = qs('[data-search-page]');

    if (!page || !window.MOVIE_INDEX) {
      return;
    }

    var input = qs('[data-search-input]', page);
    var category = qs('[data-search-category]', page);
    var year = qs('[data-search-year]', page);
    var results = qs('[data-search-results]', page);
    var summary = qs('[data-search-summary]', page);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedCategory = category ? category.value : '';
      var selectedYear = year ? year.value.trim() : '';
      var filtered = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.category,
          movie.genre,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchCategory = !selectedCategory || movie.category === selectedCategory;
        var matchYear = !selectedYear || String(movie.year) === selectedYear;
        return matchKeyword && matchCategory && matchYear;
      });

      var limited = filtered.slice(0, 120);
      results.innerHTML = limited.map(createSearchCard).join('\n');
      summary.textContent = '共找到 ' + filtered.length + ' 部影片，当前显示前 ' + limited.length + ' 部。';
    }

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play-button]', player);
      var message = qs('[data-player-message]', player);
      var source = player.getAttribute('data-video');
      var hlsInstance = null;

      if (!video || !button || !source) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function playVideo() {
        button.classList.add('is-hidden');
        setMessage('正在初始化播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('');
            video.play().catch(function () {
              setMessage('浏览器阻止了自动播放，请再次点击播放器。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setMessage('播放源加载失败，请稍后重试。');
            }
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setMessage('');
            video.play().catch(function () {
              setMessage('浏览器阻止了自动播放，请再次点击播放器。');
            });
          }, { once: true });
          return;
        }

        video.src = source;
        video.play().then(function () {
          setMessage('');
        }).catch(function () {
          setMessage('当前浏览器需要 HLS 支持组件，请检查网络或使用支持 HLS 的浏览器。');
        });
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('click', function () {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initCategoryFilter();
    initSearchPage();
    initPlayers();
  });
})();
