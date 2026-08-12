import { menuData, vehicleChargeTypes, continentMarkers } from "./data.js";
import { initNavbarEntrance, initHeroAnimations, initStatsAnimations, initChargeTypeAnimations } from "./animations.js";
import { renderNavbar } from "./navbar.js";
import { renderFooter } from "./footer.js";

// Use global jQuery loaded from CDN
const $ = window.jQuery || window.$;

// App State
let activePage = "home";
let isTransitioning = false;
let currentHeroImageIndex = 0;
const heroImages = [
  "../asset/img/images/hero_ev_station1.jpg",
  "../asset/img/images/hero_ev_station2.jpg",
  "../asset/img/images/hero_ev_station3.jpg",
  "../asset/img/images/hero_ev_station4.jpg",
  "../asset/img/images/hero_ev_station5.jpg",
  "../asset/img/images/hero_ev_station6.jpg",
];

// Leaflet world map instance
let worldMap = null;

// P2P Calculator State
let p2pHours = 5;
let p2pKw = 22;

$(document).ready(() => {
  // Render JS Components (Navbar & Footer)
  renderNavbar("#navbar-app", { activePage: "home" });
  renderFooter("#footer-app", { activePage: "home" });
  updateNavbarStyle();

  // Play initial page entrance curtain transition
  playCurtainEntrance();

  // Initial render
  renderVehicleCards();
  initNavbarEvents();
  initHeroSlideshow();
  initP2PCalculator();
  initNavigation();
  initMonumentCarousel();

  // Initialize GSAP Animations
  initNavbarEntrance();
  initHeroAnimations();
  initStatsAnimations();
  initChargeTypeAnimations();

  // Initialize Leaflet World Map
  initWorldMap();

  // Sign up form interaction
  initSignUpForm();

  // Initialize Third Party Libraries if available
  initPlugins();
});

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

// BFCache (Back/Forward Navigation) Event Listener
window.addEventListener("pageshow", (event) => {
  isTransitioning = false;

  const $curtain = $("#page-curtain-overlay");
  if ($curtain.length) {
    if (event.persisted || sessionStorage.getItem("voltmap_transition") === "true" || !$curtain.hasClass("hidden")) {
      playCurtainEntrance();
    }
  }

  if (worldMap) worldMap.invalidateSize();
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

  $curtain.removeClass("hidden pointer-events-none");
  $layer1.removeClass("animate-wipe-out animate-wipe-out-delayed").addClass("animate-wipe-in");
  $layer2.removeClass("animate-wipe-out animate-wipe-out-delayed").addClass("animate-wipe-in-delayed");

  setTimeout(() => {
    window.location.href = destinationUrl;
  }, 450);
}

function initNavigation() {
  $("[data-nav-target]").on("click", function (e) {
    const target = $(this).attr("data-nav-target");

    if (target === "explore") {
      e.preventDefault();
      performPageTransition("exploremap.html");
      return;
    }
    if (target === "home") {
      e.preventDefault();
      performPageTransition("index.html");
      return;
    }
    if (target === "install") {
      e.preventDefault();
      performPageTransition("installcharge.html");
      return;
    }
  });

  // Intercept links between index.html, exploremap.html, and installcharge.html
  $(document).on("click", 'a[href="index.html"], a[href="exploremap.html"], a[href="installcharge.html"]', function (e) {
    const href = $(this).attr("href");
    const currentFile = window.location.pathname.split("/").pop();

    if (href !== currentFile && (href === "index.html" || href === "exploremap.html" || href === "installcharge.html")) {
      e.preventDefault();
      performPageTransition(href);
    }
  });
}

/* ==========================================
   NAVBAR & MEGA MENU
   ========================================== */
function updateNavbarStyle() {
  const scrollY = window.scrollY;
  const inSlider = isInsideSliderSection();
  const isTransparent = !scrollY || inSlider;
  const $container = $("#navbar-container");
  const $logo = $("#nav-logo");

  if (isTransparent) {
    $container.addClass("bg-transparent border-transparent shadow-none").removeClass("bg-white/95 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.08)] border-gray-100");
    $logo.addClass("text-white").removeClass("text-[var(--primary)]");
    $(".nav-link-btn").addClass("text-white/90 hover:text-white").removeClass("text-gray-700 hover:text-[var(--primary)]");
    $(".nav-icon-circle").addClass("bg-white/15 text-white border-white/20 hover:bg-white/25").removeClass("bg-[#F3F3F3] text-gray-800 hover:bg-[#EAEAEA]");
  } else {
    $container.removeClass("bg-transparent border-transparent shadow-none").addClass("bg-white/95 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.08)] border-gray-100");
    $logo.removeClass("text-white").addClass("text-[var(--primary)]");
    $(".nav-link-btn").removeClass("text-white/90 hover:text-white").addClass("text-gray-700 hover:text-[var(--primary)]");
    $(".nav-icon-circle").removeClass("bg-white/15 text-white border-white/20 hover:bg-white/25").addClass("bg-[#F3F3F3] text-gray-800 hover:bg-[#EAEAEA]");
  }

  const $header = $("#header-navbar");
  const $drawer = $("#mobile-drawer");

  if (inSlider) {
    $header.addClass("opacity-0 pointer-events-none -translate-y-6").removeClass("opacity-100 pointer-events-auto translate-y-0");
    if ($drawer.length) {
      $drawer.attr("data-open", "false").addClass("pointer-events-none opacity-0 -translate-y-5").removeClass("opacity-100 translate-y-0");
    }
  } else {
    $header.removeClass("opacity-0 pointer-events-none -translate-y-6").addClass("opacity-100 pointer-events-auto translate-y-0");
  }
}

function isInsideSliderSection() {
  const sectionEl = document.querySelector("#chargetype-section") || document.querySelector("[data-slider-section]");
  if (!sectionEl) return false;
  const rect = sectionEl.getBoundingClientRect();
  return rect.top <= window.innerHeight * 0.5 && rect.bottom >= 60;
}

function initNavbarEvents() {
  $(window).on("scroll", () => {
    updateNavbarStyle();
  });

  // Mobile Drawer toggle
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
    if (page === "home" || page === "explore" || page === "install") {
      performPageTransition(page === "home" ? "index.html" : page === "explore" ? "exploremap.html" : "installcharge.html");
    }
  });
}

/* ==========================================
   HERO SLIDESHOW
   ========================================== */
function initHeroSlideshow() {
  setInterval(() => {
    currentHeroImageIndex = (currentHeroImageIndex + 1) % heroImages.length;
    updateHeroSlide(currentHeroImageIndex);
  }, 4000);

  $(document).on("click", "[data-hero-indicator]", function () {
    const idx = parseInt($(this).attr("data-hero-indicator"), 10);
    currentHeroImageIndex = idx;
    updateHeroSlide(idx);
  });
}

function updateHeroSlide(index) {
  $(".hero-bg-img").each(function (i) {
    if (i === index) {
      $(this).removeClass("opacity-0").addClass("opacity-100");
    } else {
      $(this).removeClass("opacity-100").addClass("opacity-0");
    }
  });

  $("[data-hero-indicator]").each(function (i) {
    if (i === index) {
      $(this).addClass("w-6 sm:w-7 bg-[var(--secondary)] shadow-sm shadow-[var(--secondary)]").removeClass("w-2 bg-white/40");
    } else {
      $(this).removeClass("w-6 sm:w-7 bg-[var(--secondary)] shadow-sm shadow-[var(--secondary)]").addClass("w-2 bg-white/40");
    }
  });
}

/* ==========================================
   VEHICLE CARDS (CHARGE TYPE SECTION)
   ========================================== */
function renderVehicleCards() {
  const html = vehicleChargeTypes
    .map(
      (type, idx) => `
    <div
      data-card-idx="${idx}"
      class="group relative rounded-[10px] overflow-hidden transition-all duration-500 cursor-pointer flex flex-col justify-end w-[82vw] shrink-0 select-none vehicle-card-item"
    >
      <div class="absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-[10px] z-0">
        <div class="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
          <img
            src="${type.image}"
            alt="${type.title}"
            class="vehicle-card-img absolute -left-[25%] -top-[15%] w-[150%] h-[130%] max-w-none object-cover object-center transform-gpu pointer-events-none select-none"
          />
        </div>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none z-10"></div>
      <div class="relative z-20 p-5 sm:p-8 md:p-10 space-y-2 sm:space-y-3 mt-auto">
        <h4 class="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          ${type.title}
        </h4>
        <p class="text-white text-xs sm:text-base md:text-lg font-medium leading-relaxed max-w-[55%] line-clamp-2 sm:line-clamp-none">
          ${type.subtitle}
        </p>
        <div class="pt-2 sm:pt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-sm font-bold text-emerald-400">
          <span class="flex items-center gap-1.5">
            <i class="fa-solid fa-bolt"></i>
            <span>${type.power}</span>
          </span>
          <span class="text-white">${type.timeRange}</span>
          <span class="text-white">${type.connectorTypes.join(" / ")}</span>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  $("#vehicle-slider-track").html(html);

  $(document).on("click", "[data-card-idx]", function () {
    const idx = parseInt($(this).attr("data-card-idx"), 10);
    scrollToVehicleCard(idx);
  });
}

function scrollToVehicleCard(index) {
  if (typeof ScrollTrigger === "undefined") return;
  const sliderPin = document.querySelector("#slider-pin-container");
  const trigger = ScrollTrigger.getAll().find((st) => st.trigger === sliderPin);
  if (trigger) {
    const targetProgress = index / (vehicleChargeTypes.length - 1);
    const targetPos = trigger.start + targetProgress * (trigger.end - trigger.start);
    window.scrollTo({ top: targetPos, behavior: "smooth" });
  }
}

/* ==========================================
   P2P CALCULATOR WIDGET
   ========================================== */
function initP2PCalculator() {
  $("#p2p-hours-slider").on("input", function () {
    p2pHours = parseInt($(this).val(), 10);
    $("#p2p-hours-label").text(`${p2pHours} Jam`);
    updateP2PIncome();
  });

  $("[data-p2p-kw]").on("click", function () {
    p2pKw = parseInt($(this).attr("data-p2p-kw"), 10);
    $("[data-p2p-kw]").each(function () {
      const kw = parseInt($(this).attr("data-p2p-kw"), 10);
      if (kw === p2pKw) {
        $(this).addClass("bg-[var(--secondary)] text-white border-[var(--secondary)] shadow-sm").removeClass("bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100");
      } else {
        $(this).removeClass("bg-[var(--secondary)] text-white border-[var(--secondary)] shadow-sm").addClass("bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100");
      }
    });
    updateP2PIncome();
  });
}

function updateP2PIncome() {
  const monthly = Math.round(p2pHours * p2pKw * 0.35 * 30);
  $("#p2p-income-display").text(`$${monthly.toLocaleString()}`);
}

/* ==========================================
   LEAFLET WORLD CONTINENT MAP
   ========================================== */
function initWorldMap() {
  const container = document.getElementById("world-map-container");
  if (!container || typeof L === "undefined") return;

  if (worldMap) {
    worldMap.invalidateSize();
    return;
  }

  const worldBounds = L.latLngBounds(
    L.latLng(-65.0, -180.0),
    L.latLng(85.0, 180.0)
  );

  worldMap = L.map(container, {
    center: [20.0, 30.0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 6,
    maxBounds: worldBounds,
    maxBoundsViscosity: 1.0,
    scrollWheelZoom: false,
    dragging: true,
    doubleClickZoom: true,
    zoomControl: false,
    touchZoom: true,
    boxZoom: false,
    keyboard: false,
    attributionControl: false,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 18,
    minZoom: 2,
    noWrap: true,
    className: "vibrant-map-tiles",
  }).addTo(worldMap);

  continentMarkers.forEach((marker) => {
    const icon = L.divIcon({
      className: "custom-continent-marker",
      html: `<div class="continent-badge border border-emerald-400/60 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs text-white font-bold transition-all duration-300 hover:scale-110 hover:border-emerald-400 hover:shadow-emerald-500/30 hover:z-[9999] cursor-pointer whitespace-nowrap group">
        <span class="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span class="text-black font-semibold tracking-wide">${marker.name}</span>
        <span class="h-3.5 w-[1px] bg-slate-700/80 mx-0.5"></span>
        <span class="text-emerald-400 font-extrabold bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 text-[11px] group-hover:bg-emerald-400 group-hover:text-slate-950 transition-colors">${marker.count}</span>
      </div>`,
      iconSize: null,
    });

    L.marker(marker.coords, { icon }).addTo(worldMap);
  });

  setTimeout(() => {
    if (worldMap) worldMap.invalidateSize();
  }, 300);
}

/* ==========================================
   THIRD PARTY PLUGINS (SimpleParallax, AOS, Typed, Fancybox)
   ========================================== */
function initPlugins() {
  const SimpleParallaxClass = window.SimpleParallax || window.simpleParallax;
  if (typeof SimpleParallaxClass !== "undefined") {
    const images = document.querySelectorAll(".simple-parallax-img");
    if (images.length) {
      new SimpleParallaxClass(images, {
        scale: 1.2,
        delay: 0.6,
        transition: "cubic-bezier(0,0,0.2,1)",
      });
    }
  }

  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
  }

  if (typeof Typed !== "undefined" && document.querySelector("#typed-hero-badge")) {
    new Typed("#typed-hero-badge", {
      strings: ["Stay Charged", "Explore Without Limits", "Global EV Network"],
      typeSpeed: 60,
      backSpeed: 40,
      loop: true,
    });
  }

  if (typeof Fancybox !== "undefined") {
    Fancybox.bind("[data-fancybox]", {});
  }
}

/* ==========================================
   MONUMENT SVG CAROUSEL (3-second Interval)
   ========================================== */
function initMonumentCarousel() {
  const $inlineSvg = $("#monument-inline-svg");
  if (!$inlineSvg.length) return;

  const monumentsSvg = [
    `<svg class="w-[1em] h-[1em] text-[var(--secondary)] inline-block align-middle drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c.8 1.5.8 2.5 0 3.5C11.5 6.5 12.5 8 12 9" stroke="#EAB308" stroke-width="2"/><path d="M10 9h4l-1 9h-2z"/><path d="M7 18h10v2H7z"/><path d="M5 20h14v2H5z"/></svg>`,
    `<svg class="w-[1em] h-[1em] text-[var(--secondary)] inline-block align-middle drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l-1.5 5h3L12 2z"/><path d="M10.5 7L7 20h2.5l1-4h3l1 4h2.5L13.5 7h-3z"/><path d="M9 13h6"/><path d="M4 22h16"/></svg>`,
    `<svg class="w-[1em] h-[1em] text-[var(--secondary)] inline-block align-middle drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5c4-1 14-1 18 0"/><path d="M4 8h16"/><path d="M7 8v14"/><path d="M17 8v14"/><circle cx="12" cy="14" r="3" stroke="#EF4444" stroke-width="2"/></svg>`,
    `<svg class="w-[1em] h-[1em] text-[var(--secondary)] inline-block align-middle drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3l1 2h2l-1.5 1.5.5 2-2-1-2 1 .5-2L13 5h2z" fill="currentColor"/><path d="M12 9v13"/><path d="M9 14h6"/><path d="M7 22h10"/></svg>`,
    `<svg class="w-[1em] h-[1em] text-[var(--secondary)] inline-block align-middle drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2h4l1 3h-6z"/><path d="M9 5h6v12H9z"/><circle cx="12" cy="9" r="1.5"/><path d="M12 9v1.5h1"/><path d="M7 17h10v5H7z"/></svg>`,
    `<svg class="w-[1em] h-[1em] text-[var(--secondary)] inline-block align-middle drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20V10c0-3 4-5 9-5s9 2 9 5v10"/><path d="M3 20h18"/><path d="M7 10v10"/><path d="M11 9v11"/><path d="M15 9v11"/><path d="M19 10v10"/><path d="M3 14h18"/></svg>`,
    `<svg class="w-[1em] h-[1em] text-[var(--secondary)] inline-block align-middle drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v3"/><path d="M11 4h2l.5 5h-3z"/><path d="M10 9h4l1 6H9z"/><path d="M8 15h8l1 7H7z"/><path d="M4 22h16"/></svg>`
  ];

  let currentIndex = 0;
  $inlineSvg.html(monumentsSvg[0]);

  setInterval(() => {
    $inlineSvg.addClass("opacity-0 scale-75");

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % monumentsSvg.length;
      $inlineSvg.html(monumentsSvg[currentIndex]);
      $inlineSvg.removeClass("opacity-0 scale-75");
    }, 250);
  }, 3000);
}

/* ==========================================
   VOLTMAP SIGN UP FORM INTERACTION
   ========================================== */
function initSignUpForm() {
  const $form = $("#signup-voltmap-form");
  const $msg = $("#signup-success-msg");

  if (!$form.length) return;

  $form.on("submit", function (e) {
    e.preventDefault();
    const email = $("#signup-email-input").val().trim();
    if (email) {
      $msg.removeClass("hidden").addClass("flex");
      $("#signup-email-input").val("");
      setTimeout(() => {
        $msg.addClass("hidden").removeClass("flex");
      }, 5000);
    }
  });
}

