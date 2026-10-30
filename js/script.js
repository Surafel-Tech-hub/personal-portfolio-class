document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setCurrentYear();
  setupActiveLinks();
  setupRevealOnScroll();
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