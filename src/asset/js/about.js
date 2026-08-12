import { renderNavbar } from "./navbar.js";
import { renderFooter } from "./footer.js";

const $ = window.jQuery || window.$;

let isTransitioning = false;

$(document).ready(() => {
  const activePage = "about";

  // Render Navbar and Footer Components
  renderNavbar("#navbar-app", { activePage });
  renderFooter("#footer-app", { activePage });

  updateNavbarStyle();
  playCurtainEntrance();
  initNavigation();
  initNavbarEvents();
  initCardParallax();

  // Initialize AOS if available
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true });
  }
});

/* ==========================================
   CARD SCROLL PARALLAX ANIMATION
   ========================================== */
function initCardParallax() {
  const wrappers = document.querySelectorAll(".card-parallax-wrapper");
  if (!wrappers.length) return;

  // 1. Primary approach: GSAP ScrollTrigger for horizontal right-to-left scrub
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    wrappers.forEach((wrapper) => {
      const card = wrapper.closest(".group") || wrapper.parentElement;
      gsap.fromTo(
        wrapper,
        { x: "12%" },
        {
          x: "-12%",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        }
      );
    });
    return;
  }

  // 2. High-performance requestAnimationFrame fallback for right-to-left horizontal scroll parallax
  let ticking = false;

  function updateParallax() {
    const windowHeight = window.innerHeight;

    wrappers.forEach((wrapper) => {
      const card = wrapper.closest(".group") || wrapper.parentElement;
      const rect = card.getBoundingClientRect();

      if (rect.bottom > 0 && rect.top < windowHeight) {
        const totalDist = windowHeight + rect.height;
        const currentPos = windowHeight - rect.top;
        const progress = Math.min(Math.max(currentPos / totalDist, 0), 1);
        const translateX = (0.5 - progress) * 60; // moves from right (+30px) to left (-30px)

        wrapper.style.transform = `translate3d(${translateX}px, 0, 0)`;
      }
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateParallax();
}

/* ==========================================
   NAVIGATION & CURTAIN PAGE TRANSITIONS
   ========================================== */
function playCurtainEntrance() {
  const isTransitioningFromPrev = sessionStorage.getItem("voltmap_transition") === "true";
  sessionStorage.removeItem("voltmap_transition");

  const $curtain = $("#page-curtain-overlay");
  const $layer1 = $("#curtain-layer-1");
  const $layer2 = $("#curtain-layer-2");

  if (!$curtain.length) return;

  if (isTransitioningFromPrev || !$curtain.hasClass("hidden")) {
    $curtain.removeClass("hidden pointer-events-none");
    $layer1.removeClass("animate-wipe-in animate-wipe-in-delayed").addClass("animate-wipe-out");
    $layer2.removeClass("animate-wipe-in animate-wipe-in-delayed").addClass("animate-wipe-out-delayed");

    setTimeout(() => {
      $curtain.addClass("hidden pointer-events-none");
      $layer1.removeClass("animate-wipe-in animate-wipe-in-delayed animate-wipe-out animate-wipe-out-delayed");
      $layer2.removeClass("animate-wipe-in animate-wipe-in-delayed animate-wipe-out animate-wipe-out-delayed");
    }, 600);
  } else {
    $curtain.addClass("hidden pointer-events-none");
  }
}

window.addEventListener("pageshow", (event) => {
  isTransitioning = false;
  const $curtain = $("#page-curtain-overlay");
  if ($curtain.length) {
    if (event.persisted || sessionStorage.getItem("voltmap_transition") === "true" || !$curtain.hasClass("hidden")) {
      playCurtainEntrance();
    }
  }
});

window.addEventListener("pagehide", () => {
  isTransitioning = false;
});

function performPageTransition(destinationUrl) {
  if (isTransitioning) return;
  isTransitioning = true;

  sessionStorage.setItem("voltmap_transition", "true");

  const $curtain = $("#page-curtain-overlay");
  const $layer1 = $("#curtain-layer-1");
  const $layer2 = $("#curtain-layer-2");

  if ($curtain.length) {
    $curtain.removeClass("hidden pointer-events-none");
    $layer1.removeClass("animate-wipe-out animate-wipe-out-delayed").addClass("animate-wipe-in");
    $layer2.removeClass("animate-wipe-out animate-wipe-out-delayed").addClass("animate-wipe-in-delayed");

    setTimeout(() => {
      window.location.href = destinationUrl;
    }, 650);
  } else {
    window.location.href = destinationUrl;
  }
}

function initNavigation() {
  $('[data-nav-target="home"]').on("click", function (e) {
    e.preventDefault();
    performPageTransition("index.html");
  });

  $('[data-nav-target="explore"]').on("click", function (e) {
    e.preventDefault();
    performPageTransition("exploremap.html");
  });

  $('[data-nav-target="install"]').on("click", function (e) {
    e.preventDefault();
    performPageTransition("installcharge.html");
  });

  $('[data-nav-target="about"]').on("click", function (e) {
    e.preventDefault();
    performPageTransition("about.html");
  });

  // Smooth scroll for internal anchor links
  $('a[href^="#"]').on("click", function (e) {
    const href = $(this).attr("href");
    if (href && href !== "#" && href.startsWith("#")) {
      const $target = $(href);
      if ($target.length) {
        e.preventDefault();
        $("html, body").animate({ scrollTop: $target.offset().top - 80 }, 600);
      }
    }
  });
}

function initNavbarEvents() {
  $(window).on("scroll", updateNavbarStyle);

  $("#mobile-hamburger-btn").on("click", function () {
    const $drawer = $("#mobile-drawer");
    const isOpen = $drawer.attr("data-open") === "true";
    if (isOpen) {
      $drawer.attr("data-open", "false").addClass("pointer-events-none opacity-0 -translate-y-5").removeClass("opacity-100 translate-y-0");
    } else {
      $drawer.attr("data-open", "true").removeClass("pointer-events-none opacity-0 -translate-y-5").addClass("opacity-100 translate-y-0");
    }
  });

  $("[data-mobile-nav]").on("click", function () {
    const page = $(this).attr("data-mobile-nav");
    $("#mobile-drawer").attr("data-open", "false").addClass("pointer-events-none opacity-0 -translate-y-5").removeClass("opacity-100 translate-y-0");
    if (page === "home" || page === "explore" || page === "install" || page === "about") {
      const targetUrl = page === "home" ? "index.html" : page === "explore" ? "exploremap.html" : page === "install" ? "installcharge.html" : "about.html";
      performPageTransition(targetUrl);
    }
  });
}

function updateNavbarStyle() {
  const $navbarContainer = $("#navbar-container");
  const $header = $("#header-navbar");
  const $logo = $("#nav-logo");

  if (!$navbarContainer.length) return;

  const scrollY = window.scrollY;
  const heroHeight = $("#about-hero").outerHeight() || window.innerHeight;
  const isTransparent = scrollY < heroHeight - 70;

  if (isTransparent) {
    $navbarContainer
      .addClass("bg-transparent border-transparent shadow-none")
      .removeClass("bg-white/95 backdrop-blur-md shadow-sm border-slate-200/80");
    $logo.addClass("text-white").removeClass("text-slate-900");
    $(".nav-link-btn").addClass("text-white/90 hover:text-white").removeClass("text-slate-800 hover:text-[var(--secondary)]");
    $(".nav-icon-circle").addClass("bg-white/15 text-white border-white/20 hover:bg-white/25").removeClass("bg-slate-100 text-slate-800 hover:bg-slate-200");
  } else {
    $navbarContainer
      .removeClass("bg-transparent border-transparent shadow-none")
      .addClass("bg-white/95 backdrop-blur-md shadow-sm border-slate-200/80");
    $logo.removeClass("text-white").addClass("text-slate-900");
    $(".nav-link-btn").removeClass("text-white/90 hover:text-white").addClass("text-slate-800 hover:text-[var(--secondary)]");
    $(".nav-icon-circle").removeClass("bg-white/15 text-white border-white/20 hover:bg-white/25").addClass("bg-slate-100 text-slate-800 hover:bg-slate-200");
  }

  $header.removeClass("opacity-0 pointer-events-none -translate-y-6").addClass("opacity-100 pointer-events-auto translate-y-0");
}
