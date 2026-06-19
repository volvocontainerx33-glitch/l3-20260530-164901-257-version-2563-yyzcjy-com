const menuButton = document.querySelector("[data-menu-button]");
const mainNav = document.querySelector("[data-main-nav]");

if (menuButton && mainNav) {
    menuButton.addEventListener("click", function() {
        mainNav.classList.toggle("is-open");
    });
}

const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
let activeSlide = 0;
let slideTimer = null;

function showSlide(index) {
    if (!slides.length) {
        return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
}

function startHeroTimer() {
    if (!slides.length) {
        return;
    }

    slideTimer = window.setInterval(function() {
        showSlide(activeSlide + 1);
    }, 5200);
}

dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
        const index = Number(dot.getAttribute("data-hero-dot"));
        window.clearInterval(slideTimer);
        showSlide(index);
        startHeroTimer();
    });
});

startHeroTimer();

function normalize(value) {
    return String(value || "").toLowerCase().trim();
}

function applyFilter(input, list, status) {
    const query = normalize(input.value);
    const items = Array.from(list.querySelectorAll(".movie-card, .ranking-item"));
    let visibleCount = 0;

    items.forEach(function(item) {
        const text = normalize(item.getAttribute("data-search") || item.textContent);
        const matched = !query || text.includes(query);
        item.classList.toggle("is-hidden", !matched);
        if (matched) {
            visibleCount += 1;
        }
    });

    if (status) {
        status.textContent = query ? "筛选结果：" + visibleCount + " 条" : "";
    }
}

document.querySelectorAll("[data-filter-form]").forEach(function(form) {
    const input = form.querySelector("[data-filter-input]");
    const list = document.querySelector("[data-filter-list]");

    if (!input || !list) {
        return;
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        applyFilter(input, list, null);
    });

    input.addEventListener("input", function() {
        applyFilter(input, list, null);
    });
});

const searchPageInput = document.querySelector("[data-search-page-input]");
const searchPageList = document.querySelector("[data-filter-list]");
const searchPageStatus = document.querySelector("[data-filter-status]");

if (searchPageInput && searchPageList) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    searchPageInput.value = query;
    applyFilter(searchPageInput, searchPageList, searchPageStatus);

    searchPageInput.addEventListener("input", function() {
        applyFilter(searchPageInput, searchPageList, searchPageStatus);
    });
}
