document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setCurrentYear();
  setupActiveLinks();
  setupRevealOnScroll();
  setupProfilePhoto();
  setupInfiniteSpiral();
});

/* ---------- Mobile menu ---------- */
function setupMobileMenu() {
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu(returnFocus) {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) toggle.focus();
  }

  // Click or Enter/Space on the button (buttons handle keys natively)
  toggle.addEventListener("click", function () {
    if (menu.classList.contains("open")) {
      closeMenu(false);
    } else {
      openMenu();
    }
  });

  // Close after choosing a link
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { closeMenu(false); });
  });

  // Escape closes the menu and returns focus to the button
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      closeMenu(true);
    }
  });

  // Click outside closes the menu
  document.addEventListener("click", function (event) {
    if (menu.classList.contains("open") &&
        !menu.contains(event.target) &&
        !toggle.contains(event.target)) {
      closeMenu(false);
    }
  });

  // Reset state when the window grows to desktop size
  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) closeMenu(false);
  });
}

/* ---------- Footer year ---------- */
function setCurrentYear() {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Highlight the nav link of the section in view ---------- */
function setupActiveLinks() {
  var links = document.querySelectorAll(".nav-links a[href^='#']");
  if (!links.length || !("IntersectionObserver" in window)) return;

  var sections = [];
  links.forEach(function (link) {
    var section = document.querySelector(link.getAttribute("href"));
    if (section) sections.push({ link: link, section: section });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (l) {
        l.classList.remove("active");
        l.removeAttribute("aria-current");
      });
      var match = sections.find(function (s) { return s.section === entry.target; });
      if (match) {
        match.link.classList.add("active");
        match.link.setAttribute("aria-current", "true");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  sections.forEach(function (s) { observer.observe(s.section); });
}

/* ---------- Gentle fade-in when sections scroll into view ---------- */
function setupRevealOnScroll() {
  var items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // If animations are not wanted or not supported, just show everything
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("visible"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(function (el) { observer.observe(el); });
}

/* ---------- Profile picture: hide the frame if the image file is missing ---------- */
function setupProfilePhoto() {
  var photo = document.querySelector(".hero-photo");
  var grid = document.querySelector(".hero-grid");
  if (!photo) return;
  var img = photo.querySelector("img");
  if (!img) return;

  function hidePhoto() {
    photo.hidden = true;
    photo.style.display = "none";
    if (grid) grid.classList.add("no-photo");
  }

  // The image may already have failed before this script ran
  if (img.complete && img.naturalWidth === 0) {
    hidePhoto();
  } else {
    img.addEventListener("error", hidePhoto);
  }
}

/* ---------- Infinite Spiral ---------- */
function setupInfiniteSpiral() {
  var root = document.getElementById("infinite-spiral");
  if (!root) return;

  var images = [
    { src: "assets/images/landscape-1.jpg", alt: "Image 1" },
    { src: "assets/images/landscape-2.jpg", alt: "Image 2" },
    { src: "assets/images/landscape-3.jpg", alt: "Image 3" },
    { src: "assets/images/landscape-4.jpg", alt: "Image 4" },
    { src: "assets/images/landscape-5.jpg", alt: "Image 5" },
    { src: "assets/images/landscape-6.jpg", alt: "Image 6" }
  ];

var settings = {
  speed: 0.245,
  direction: "up",
  radius: 300,
  cardWidth: 150,
  cardHeight: 150,
  verticalSpacing: 100,
  perspective: 1050,
  cardsPerTurn: 7,
  rotation: 0,
  cardTilt: 0,
  cardRadius: 10,
  centerScale: 1.15,
  edgeFade: 0.3,
  edgeBlur: 6,
  pauseOnHover: false,
  grayscale: 0.3
};

  var stage = document.createElement("div");
  stage.className = "infinite-spiral__stage";
  stage.setAttribute("role", "list");
  stage.setAttribute("aria-label", "Infinite spiral gallery");

  root.innerHTML = "";
  root.appendChild(stage);

  var cards = [];

  images.forEach(function (image, index) {
    var card = document.createElement("div");
    card.className = "infinite-spiral__item";
    card.setAttribute("role", "listitem");

    card.style.width = settings.cardWidth + "px";
    card.style.height = settings.cardHeight + "px";
    card.style.borderRadius = settings.cardRadius + "px";

    var img = document.createElement("img");
    img.className = "infinite-spiral__image";
    img.src = image.src;
    img.alt = image.alt;
    img.draggable = false;
    img.loading = index < 6 ? "eager" : "lazy";
    img.style.filter =
      "grayscale(" + settings.grayscale + ")";

    card.appendChild(img);
    stage.appendChild(card);
    cards.push(card);
  });

  var progress = 0;
  var targetProgress = 0;
  var autoSpeed = 0;
  var hovered = false;
  var visible = true;

  var previousTime = performance.now();
  var bounds = root.getBoundingClientRect();

  var resizeObserver = new ResizeObserver(function () {
    bounds = root.getBoundingClientRect();
  });

  resizeObserver.observe(root);

  var intersectionObserver = new IntersectionObserver(
    function (entries) {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0.02 }
  );

  intersectionObserver.observe(root);

  root.addEventListener("mouseenter", function () {
    hovered = true;
  });

  root.addEventListener("mouseleave", function () {
    hovered = false;
  });

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function modulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function smoothstep(min, max, value) {
    var x = clamp(
      (value - min) / (max - min || 1),
      0,
      1
    );

    return x * x * (3 - 2 * x);
  }

  function render(time) {
    var delta = Math.min(
      (time - previousTime) / 1000,
      0.05
    );

    previousTime = time;

    var motionPaused =
      settings.pauseOnHover && hovered;

    var desiredAutoSpeed =
      visible && !motionPaused
        ? settings.speed
        : 0;

    var speedBlend =
      1 - Math.exp(-delta * 7);

    autoSpeed +=
      (desiredAutoSpeed - autoSpeed) *
      speedBlend;

    targetProgress +=
      autoSpeed * delta;

    var followBlend =
      1 - Math.exp(-delta * 11);

    progress +=
      (targetProgress - progress) *
      followBlend;

    var count = cards.length;
    var half = count / 2;

    var width = Math.max(bounds.width, 1);
    var height = Math.max(bounds.height, 1);

    var fit = Math.min(
      1,
      width / (settings.cardWidth * 2.8),
      height / (settings.cardHeight * 2.35)
    );

    var responsiveRadius =
      Math.min(
        settings.radius,
        Math.max(72, width * 0.36)
      ) * fit;

    var fadeStart =
      clamp(
        1 - settings.edgeFade,
        0,
        0.98
      );

    var turnSize =
      Math.max(settings.cardsPerTurn, 1);

    cards.forEach(function (card, index) {
      var offset =
        index - progress;

      offset =
        modulo(
          offset + half,
          count
        ) - half;

      var edge =
        Math.min(
          Math.abs(offset) /
            Math.max(half, 1),
          1
        );

      var opacity =
        1 -
        smoothstep(
          fadeStart,
          1,
          edge
        );

      var focus =
        1 -
        Math.min(
          Math.abs(offset) /
            Math.max(
              turnSize * 0.65,
              1
            ),
          1
        );

      var scale =
        (1 +
          (settings.centerScale - 1) *
            focus) *
        fit;

      var angle =
        offset *
          (360 / turnSize) +
        settings.rotation;

      var angleRadians =
        (angle * Math.PI) / 180;

      var x =
        Math.sin(angleRadians) *
        responsiveRadius;

      var z =
        Math.cos(angleRadians) *
        responsiveRadius;

      var depthScale =
        clamp(
          settings.perspective /
            Math.max(
              settings.perspective - z,
              1
            ),
          0.72,
          1.45
        );

      var visualScale =
        scale * depthScale;

      var depth =
        (z /
          Math.max(
            responsiveRadius,
            1
          ) +
          1) /
        2;

      var blur =
        settings.edgeBlur *
        smoothstep(
          0.35,
          1,
          edge
        );

      card.style.transform =
        "translate(-50%, -50%) " +
        "translate3d(" +
        x +
        "px, " +
        offset *
          settings.verticalSpacing *
          fit +
        "px, 0) " +
        "rotateZ(" +
        settings.cardTilt +
        "deg) " +
        "scale(" +
        visualScale +
        ")";

      card.style.opacity =
        opacity.toFixed(3);

      card.style.filter =
        blur > 0.01
          ? "blur(" +
            blur.toFixed(2) +
            "px)"
          : "none";

      card.style.zIndex =
        String(
          Math.round(depth * 100000) +
            index
        );
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

