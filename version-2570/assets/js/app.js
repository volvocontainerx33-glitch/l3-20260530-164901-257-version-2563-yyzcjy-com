(function () {
  var mobileToggle = document.querySelector(".mobile-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

  if (slides.length > 1) {
    var currentSlide = 0;

    var showSlide = function (index) {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === currentSlide);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var normalize = function (value) {
    return (value || "").toString().toLowerCase().trim();
  };

  var getSearchQuery = function () {
    try {
      return new URLSearchParams(window.location.search).get("q") || "";
    } catch (error) {
      return "";
    }
  };

  var filterAreas = Array.prototype.slice.call(document.querySelectorAll("[data-search-area]"));

  filterAreas.forEach(function (area) {
    var input = area.querySelector("[data-search-input]");
    var chips = Array.prototype.slice.call(area.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(area.querySelectorAll("[data-movie-card]"));
    var empty = area.querySelector("[data-empty-state]");
    var activeCategory = "all";

    if (input && !input.value) {
      input.value = getSearchQuery();
    }

    var applyFilter = function () {
      var query = normalize(input ? input.value : "");
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-category"),
          card.getAttribute("data-year")
        ].join(" "));
        var cardCategory = card.getAttribute("data-category") || "";
        var matchesText = !query || haystack.indexOf(query) !== -1;
        var matchesCategory = activeCategory === "all" || cardCategory === activeCategory;
        var shouldShow = matchesText && matchesCategory;

        card.style.display = shouldShow ? "" : "none";

        if (shouldShow) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visibleCount === 0);
      }
    };

    if (input) {
      input.addEventListener("input", applyFilter);
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          applyFilter();
        }
      });
    }

    var trigger = area.querySelector(".search-box button");

    if (trigger) {
      trigger.addEventListener("click", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCategory = chip.getAttribute("data-filter-value") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  });

  var setupPlayer = function (shell) {
    var video = shell.querySelector("video");
    var playButton = shell.querySelector(".play-button");

    if (!video || !playButton) {
      return;
    }

    var hlsSource = video.getAttribute("data-hls");
    var mp4Source = video.getAttribute("data-mp4");
    var initialized = false;
    var hlsInstance = null;

    var safePlay = function () {
      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    };

    var fallbackToMp4 = function () {
      if (mp4Source && video.getAttribute("src") !== mp4Source) {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
        hlsInstance = null;
        video.src = mp4Source;
        video.load();
      }
      safePlay();
    };

    var startPlayback = function () {
      shell.classList.add("playing");
      safePlay();
    };

    var initialize = function () {
      if (initialized) {
        startPlayback();
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported() && hlsSource) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(hlsSource);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          startPlayback();
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            fallbackToMp4();
          }
        });
      } else if (hlsSource && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsSource;
        video.addEventListener("loadedmetadata", startPlayback, { once: true });
        video.load();
      } else {
        fallbackToMp4();
      }
    };

    playButton.addEventListener("click", function (event) {
      event.preventDefault();
      initialize();
    });

    shell.addEventListener("click", function (event) {
      if (event.target === video || event.target === shell) {
        initialize();
      }
    });

    video.addEventListener("play", function () {
      shell.classList.add("playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("playing");
      }
    });

    video.addEventListener("ended", function () {
      shell.classList.remove("playing");
    });
  };

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
})();
