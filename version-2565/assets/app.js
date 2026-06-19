(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilter() {
        var input = document.querySelector("[data-filter-input]");
        var list = document.querySelector("[data-filter-list]");
        if (!input || !list) {
            return;
        }
        var items = Array.prototype.slice.call(list.children);
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            items.forEach(function (item) {
                var text = item.textContent.toLowerCase();
                item.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
            });
        });
    }

    function setupPlayer() {
        var video = document.getElementById("moviePlayer");
        var button = document.querySelector("[data-play-button]");
        if (!video) {
            return;
        }
        var shell = video.closest(".video-shell");
        var source = video.getAttribute("data-src");
        var loaded = false;
        function loadAndPlay() {
            if (!source) {
                return;
            }
            if (!loaded) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                loaded = true;
            }
            if (shell) {
                shell.classList.add("playing");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener("click", loadAndPlay);
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                loadAndPlay();
            }
        });
    }

    ready(function () {
        setupHero();
        setupFilter();
        setupPlayer();
    });
})();
