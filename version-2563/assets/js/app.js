(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMobileNav();
        setupHeroCarousel();
        setupFilters();
        setupPlayers();
    });

    function setupMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-main-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector("[data-hero-carousel]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        if (slides.length <= 1) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });

        show(0);

        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var typeFilter = scope.querySelector("[data-type-filter]");
            var yearFilter = scope.querySelector("[data-year-filter]");
            var count = scope.querySelector("[data-result-count]");
            var cards = findCards(scope);

            function apply() {
                var query = normalize(input ? input.value : "");
                var selectedType = typeFilter ? typeFilter.value : "";
                var selectedYear = yearFilter ? yearFilter.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search") || "");
                    var type = card.getAttribute("data-type") || "";
                    var year = card.getAttribute("data-year") || "";
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesType = !selectedType || type.indexOf(selectedType) !== -1;
                    var matchesYear = !selectedYear || year === selectedYear;
                    var shouldShow = matchesQuery && matchesType && matchesYear;

                    card.style.display = shouldShow ? "" : "none";

                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "当前显示 " + visible + " 部影片";
                }

                var empty = document.querySelector("[data-empty-state]");

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            if (typeFilter) {
                typeFilter.addEventListener("change", apply);
            }

            if (yearFilter) {
                yearFilter.addEventListener("change", apply);
            }

            apply();
        });
    }

    function findCards(scope) {
        var section = scope.nextElementSibling;

        while (section && !section.querySelectorAll(".movie-card").length) {
            section = section.nextElementSibling;
        }

        if (section) {
            return Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
        }

        return Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

        shells.forEach(function (shell) {
            var button = shell.querySelector(".player-cover");
            var video = shell.querySelector("video");
            var status = shell.parentElement ? shell.parentElement.querySelector(".player-status") : null;
            var source = shell.getAttribute("data-video-src");

            if (!button || !video || !source) {
                return;
            }

            button.addEventListener("click", function () {
                startPlayback(shell, video, source, status);
            });
        });
    }

    function startPlayback(shell, video, source, status) {
        shell.classList.add("is-playing");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            play(video, status);
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                play(video, status);
            });

            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (status && data && data.fatal) {
                    status.textContent = "播放源暂时无法加载，请稍后刷新页面重试。";
                }
            });

            return;
        }

        video.src = source;
        play(video, status);
    }

    function play(video, status) {
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (status) {
                    status.textContent = "浏览器阻止了自动播放，请再次点击播放器开始观看。";
                }
            });
        }

        if (status) {
            status.textContent = "播放器已绑定播放源，正在加载视频。";
        }
    }
})();
