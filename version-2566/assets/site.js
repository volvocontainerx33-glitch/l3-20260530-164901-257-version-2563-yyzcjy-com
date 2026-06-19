(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function safeText(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var data = window.SEARCH_INDEX || [];
    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var box = form.querySelector("[data-search-results]");
      if (!input || !box) {
        return;
      }

      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          box.classList.remove("is-open");
          box.innerHTML = "";
          return;
        }
        var results = data.filter(function (item) {
          return [item.title, item.region, item.year, item.tags, item.category]
            .join(" ")
            .toLowerCase()
            .indexOf(query) !== -1;
        }).slice(0, 10);
        if (!results.length) {
          box.innerHTML = '<span class="search-result-item">没有匹配结果</span>';
          box.classList.add("is-open");
          return;
        }
        box.innerHTML = results.map(function (item) {
          return '<a class="search-result-item" href="' + safeText(item.href) + '"><strong>' + safeText(item.title) + '</strong><span>' + safeText(item.region) + ' · ' + safeText(item.year) + ' · ' + safeText(item.category) + '</span></a>';
        }).join("");
        box.classList.add("is-open");
      });

      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          box.classList.remove("is-open");
        }
      });
    });
  }

  function initLocalFilter() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var section = input.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".filter-card"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector(".play-overlay");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var loaded = false;
      var hls = null;

      function load() {
        if (loaded || !stream) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        load();
        frame.classList.add("is-playing");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        frame.classList.add("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initLocalFilter();
    initPlayers();
  });
})();
