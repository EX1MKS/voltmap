import { menuData, vehicleChargeTypes, continentMarkers, generateMockStations } from "./data.js";
import { initNavbarEntrance, initHeroAnimations, initStatsAnimations, initChargeTypeAnimations } from "./animations.js";
import { renderNavbar } from "./navbar.js";

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

// Leaflet maps instances
let worldMap = null;
let baliMap = null;
let baliClusterGroup = null;
let allStations = [];
let selectedStationId = null;

// P2P Calculator State
let p2pHours = 5;
let p2pKw = 22;

$(document).ready(() => {
  // If on standalone Explore Map page (exploremap.html)
  if ($("#explore-view").length && !$("#home-view").length) {
    activePage = "explore";
  }

  // Render JS Navbar Component
  renderNavbar("#navbar-app", { activePage });
  updateNavbarStyle();

  // Play initial page entrance curtain transition
  playCurtainEntrance();

  // Generate stations data
  allStations = generateMockStations();

  // Initial render
  renderVehicleCards();
  renderMegaMenu("Charging");
  initNavbarEvents();
  initHeroSlideshow();
  initP2PCalculator();
  initNavigation();

  // Initialize GSAP Animations
  initNavbarEntrance();
  initHeroAnimations();
  initStatsAnimations();
  initChargeTypeAnimations();

  // Initialize Leaflet World Map
  initWorldMap();

  // Initialize Third Party Libraries if available
  initPlugins();

  if (activePage === "explore") {
    initBaliMap();
  }
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

  if (isTransitioningFromPrev) {
    $curtain.removeClass("hidden pointer-events-none");
    $layer1.removeClass("animate-wipe-in animate-wipe-in-delayed").addClass("animate-wipe-out");
    $layer2.removeClass("animate-wipe-in animate-wipe-in-delayed").addClass("animate-wipe-out-delayed");

    setTimeout(() => {
      $curtain.addClass("hidden pointer-events-none");
      $layer1.removeClass("animate-wipe-out");
      $layer2.removeClass("animate-wipe-out-delayed");
    }, 600);
  } else {
    $curtain.addClass("hidden pointer-events-none");
  }
}

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
      if (!$("#explore-view").length || $("#home-view").length) {
        e.preventDefault();
        performPageTransition("exploremap.html");
        return;
      }
    }
    if (target === "home") {
      if (!$("#home-view").length || $("#explore-view").length) {
        e.preventDefault();
        performPageTransition("index.html");
        return;
      }
    }

    if (target === "home" || target === "explore") {
      e.preventDefault();
      navigateTo(target);
    }
  });

  // Intercept links between index.html and exploremap.html
  $(document).on("click", 'a[href="index.html"], a[href="exploremap.html"]', function (e) {
    const href = $(this).attr("href");
    const currentFile = window.location.pathname.split("/").pop();

    if (href !== currentFile && (href === "index.html" || href === "exploremap.html")) {
      e.preventDefault();
      performPageTransition(href);
    }
  });
}

function navigateTo(targetPage) {
  if (targetPage === activePage || isTransitioning) return;
  isTransitioning = true;

  const $curtain = $("#page-curtain-overlay");
  const $layer1 = $("#curtain-layer-1");
  const $layer2 = $("#curtain-layer-2");

  $curtain.removeClass("hidden pointer-events-none");

  // Step 1: Wipe In
  $layer1.removeClass("animate-wipe-out").addClass("animate-wipe-in");
  $layer2.removeClass("animate-wipe-out-delayed").addClass("animate-wipe-in-delayed");

  setTimeout(() => {
    // Switch views
    if (targetPage === "explore") {
      if ($("#explore-view").length) {
        $("#home-view").addClass("hidden");
        $("#explore-view").removeClass("hidden");
        activePage = "explore";
        initBaliMap();
      } else {
        window.location.href = "exploremap.html";
        return;
      }
    } else {
      if ($("#home-view").length) {
        $("#explore-view").addClass("hidden");
        $("#home-view").removeClass("hidden");
        activePage = "home";
      } else {
        window.location.href = "index.html";
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: "instant" });

    // Update navbar background style
    updateNavbarStyle();

    // Step 2: Wipe Out
    $layer1.removeClass("animate-wipe-in").addClass("animate-wipe-out");
    $layer2.removeClass("animate-wipe-in-delayed").addClass("animate-wipe-out-delayed");

    setTimeout(() => {
      $curtain.addClass("hidden pointer-events-none");
      isTransitioning = false;

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 680);
  }, 680);
}

/* ==========================================
   NAVBAR & MEGA MENU
   ========================================== */
function updateNavbarStyle() {
  const scrollY = window.scrollY;
  const inSlider = isInsideSliderSection();
  const activeMenu = $("#header-navbar").attr("data-active-menu");

  const isTransparent = activePage === "explore" ? false : (!scrollY || inSlider) && !activeMenu;
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
  if (inSlider && activePage !== "explore") {
    $header.addClass("opacity-0 pointer-events-none -translate-y-6").removeClass("opacity-100 pointer-events-auto translate-y-0");
  } else {
    $header.removeClass("opacity-0 pointer-events-none -translate-y-6").addClass("opacity-100 pointer-events-auto translate-y-0");
  }
}

function isInsideSliderSection() {
  const sliderEl = document.querySelector("[data-slider-section]");
  if (!sliderEl) return false;
  const rect = sliderEl.getBoundingClientRect();
  return rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.2;
}

function initNavbarEvents() {
  $(window).on("scroll", () => {
    updateNavbarStyle();
  });

  // MegaMenu hover
  $("#nav-menu > div").on("mouseenter", function () {
    const menuTitle = $(this).attr("data-menu");
    if (menuTitle === "Home" || menuTitle === "Charging") {
      closeMegaMenu();
      return;
    }
    openMegaMenu(menuTitle);
  });

  $("#header-navbar").on("mouseleave", function () {
    closeMegaMenu();
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
    if (page === "home" || page === "explore") {
      navigateTo(page);
    }
  });
}

function openMegaMenu(menuId) {
  const item = menuData.find((m) => m.id === menuId);
  if (!item) return;

  $("#header-navbar").attr("data-active-menu", menuId);
  renderMegaMenu(menuId);
  $("#megamenu-container").removeClass("hidden");

  if (typeof gsap !== "undefined") {
    gsap.to("#navbar-container", { height: 470, duration: 0.1, ease: "power2.out" });
  } else {
    $("#navbar-container").css("height", "470px");
  }

  updateNavbarStyle();
}

function closeMegaMenu() {
  $("#header-navbar").removeAttr("data-active-menu");
  $("#megamenu-container").addClass("hidden");

  if (typeof gsap !== "undefined") {
    gsap.to("#navbar-container", { height: 64, duration: 0.1, ease: "power2.out" });
  } else {
    $("#navbar-container").css("height", "64px");
  }

  updateNavbarStyle();
}

function renderMegaMenu(menuId) {
  const item = menuData.find((m) => m.id === menuId);
  if (!item) return;

  const html = `
    <div class="grid grid-cols-2 gap-10">
      <div>
        <img src="${item.image}" alt="${item.title}" class="h-[320px] w-full rounded-3xl object-cover transition duration-500 hover:scale-[1.03]" />
      </div>
      <div class="flex flex-col justify-center">
        <h2 class="mb-3 text-4xl font-bold">${item.title}</h2>
        <p class="mb-10 text-gray-500 leading-7">${item.subtitle}</p>
        <div class="space-y-5">
          ${item.links
      .map(
        (link) => `
            <div class="cursor-pointer rounded-2xl p-4 transition hover:bg-gray-100">
              <h3 class="font-semibold">${link.title}</h3>
              <p class="text-sm text-gray-500">${link.desc}</p>
            </div>
          `
      )
      .join("")}
        </div>
      </div>
    </div>
  `;
  $("#megamenu-container").html(html);
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

  worldMap = L.map(container, {
    center: [20.0, 10.0],
    zoom: 2,
    scrollWheelZoom: false,
    dragging: false,
    doubleClickZoom: false,
    zoomControl: false,
    touchZoom: false,
    boxZoom: false,
    keyboard: false,
    attributionControl: false,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png").addTo(worldMap);

  continentMarkers.forEach((marker) => {
    const icon = L.divIcon({
      className: "bg-transparent",
      html: `<div class="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-emerald-400/50 text-white text-xs font-black shadow-2xl flex items-center gap-1.5 hover:scale-105 transition-transform whitespace-nowrap cursor-pointer">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span class="text-slate-300 font-medium">${marker.name}:</span>
        <span class="text-emerald-400 font-black">${marker.count}</span>
      </div>`,
      iconSize: [110, 34],
      iconAnchor: [55, 17],
    });

    L.marker(marker.coords, { icon }).addTo(worldMap);
  });
}

/* ==========================================
   LEAFLET BALI INTERACTIVE MAP
   ========================================== */
function initBaliMap() {
  const container = document.getElementById("bali-map-container");
  if (!container || typeof L === "undefined") return;

  if (baliMap) {
    baliMap.invalidateSize();
    return;
  }

  baliMap = L.map(container, {
    center: [-8.65, 115.2167],
    zoom: 11,
    scrollWheelZoom: true,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(baliMap);

  if (typeof L.markerClusterGroup !== "undefined") {
    baliClusterGroup = L.markerClusterGroup({ chunkedLoading: true });
    baliMap.addLayer(baliClusterGroup);
  }

  renderBaliStations();
  initBaliSearchAndFilter();
}

function renderBaliStations(filterType = "Semua", searchQuery = "") {
  if (!baliMap) return;

  const boltSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" width="14" height="14"><path d="M43.3 286.9l207.3-255.4c15.2-18.7 45.4-8.8 46.8 15.6l9.3 151.7h-73c-23.7 0-41 21.6-35.4 44.5L254.9 443c6.9 28.5-27.9 48.7-49.8 28.7l-159.2-146c-11.8-10.8-15.6-28-9.4-42.5l26-61.9c5.6-13.3 19-21.7 33.4-21.7H210z"/></svg>`;

  const filtered = allStations.filter((st) => {
    const matchesFilter = filterType === "Semua" || st.type === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      st.name.toLowerCase().includes(q) ||
      st.location.toLowerCase().includes(q) ||
      st.connector.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  // Render Sidebar List
  const listHtml = filtered.length
    ? filtered
      .map(
        (st) => `
      <div
        data-station-id="${st.id}"
        class="p-4 rounded-2xl bg-slate-900/90 border transition-all cursor-pointer station-card-item ${selectedStationId === st.id
            ? "border-[var(--secondary)] shadow-lg shadow-emerald-500/10 ring-1 ring-[var(--secondary)]"
            : "border-slate-700/60 hover:border-slate-500"
          }"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-extrabold text-sm text-white flex items-center gap-2">
              ${st.name}
              <span
                class="w-2 h-2 rounded-full ${st.status === "Available"
            ? "bg-emerald-400 shadow-sm shadow-emerald-400"
            : st.status === "Busy"
              ? "bg-amber-400"
              : st.status === "Maintenance"
                ? "bg-blue-400"
                : "bg-gray-500"
          }"
                title="${st.status}"
              ></span>
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              ${st.location} • <span class="text-emerald-400">${st.distance}</span>
            </p>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <div class="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
              <i class="fa-solid fa-star text-[10px]"></i>
              <span>${st.rating}</span>
            </div>
            <span class="text-[10px] font-bold text-slate-400">${st.price}</span>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-800 text-xs font-medium">
          <span class="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-[11px]">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            ${st.available}
          </span>
          <div class="flex items-center gap-2">
            <span class="text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded text-[10px]">
              ${st.connector}
            </span>
            <span class="text-[var(--secondary)] font-extrabold bg-[var(--secondary)]/10 border border-[var(--secondary)]/30 px-2 py-0.5 rounded text-[10px]">
              ⚡ ${st.power}
            </span>
          </div>
        </div>
      </div>
    `
      )
      .join("")
    : `
      <div class="text-center py-12 text-slate-400">
        <i class="fa-solid fa-location-dot text-3xl mb-2 opacity-50"></i>
        <p class="text-sm">Stasiun tidak ditemukan.</p>
      </div>
    `;

  $("#bali-stations-list").html(listHtml);
  $("#bali-filtered-count").text(`${filtered.length} hasil`);
  $("#bali-visible-count").text(`Menampilkan ${filtered.length} stasiun di Bali`);

  // Render Map Markers
  if (baliClusterGroup) {
    baliClusterGroup.clearLayers();

    filtered.forEach((st) => {
      const icon = L.divIcon({
        className: "bg-transparent",
        html: `<div class="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-white ${st.type === "Public Station" ? "bg-[var(--secondary)]" : "bg-amber-500"
          }">${boltSvg}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const popupHtml = `
        <div class="p-1 min-w-[170px]">
          <div class="flex items-center justify-between gap-2 mb-1">
            <h4 class="font-extrabold text-sm">${st.name}</h4>
            <span class="w-2 h-2 rounded-full shrink-0 ${st.status === "Available" ? "bg-emerald-500" : st.status === "Busy" ? "bg-amber-500" : "bg-gray-400"
        }" title="${st.status}"></span>
          </div>
          <p class="text-xs text-gray-600 mb-2">${st.location} • ${st.distance}</p>
          <div class="flex items-center gap-1.5 mb-2 flex-wrap">
            <span class="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">${st.connector}</span>
            <span class="text-xs font-bold text-[var(--secondary)] bg-emerald-50 px-2 py-0.5 rounded">${st.power}</span>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">${st.available}</span>
          </div>
          <button class="w-full py-1.5 rounded-lg bg-[var(--secondary)] text-white text-xs font-bold shadow hover:bg-[var(--secondary-hover)] transition">Petunjuk Arah</button>
        </div>
      `;

      const marker = L.marker(st.coordinates, { icon }).bindPopup(popupHtml);
      marker.on("click", () => {
        selectedStationId = st.id;
        $(".station-card-item").removeClass("border-[var(--secondary)] ring-1 ring-[var(--secondary)]");
        $(`[data-station-id="${st.id}"]`).addClass("border-[var(--secondary)] ring-1 ring-[var(--secondary)]");
      });

      baliClusterGroup.addLayer(marker);
    });
  }
}

function initBaliSearchAndFilter() {
  let currentFilter = "Semua";
  let currentQuery = "";

  $(document).on("click", "[data-bali-filter]", function () {
    currentFilter = $(this).attr("data-bali-filter");
    $("[data-bali-filter]").each(function () {
      if ($(this).attr("data-bali-filter") === currentFilter) {
        $(this).addClass("bg-[var(--secondary)] text-white shadow-md shadow-emerald-500/20").removeClass("bg-slate-900 text-slate-400 hover:text-white");
      } else {
        $(this).removeClass("bg-[var(--secondary)] text-white shadow-md shadow-emerald-500/20").addClass("bg-slate-900 text-slate-400 hover:text-white");
      }
    });
    renderBaliStations(currentFilter, currentQuery);
  });

  $("#bali-search-input").on("input", function () {
    currentQuery = $(this).val();
    renderBaliStations(currentFilter, currentQuery);
  });

  $(document).on("click", "[data-station-id]", function () {
    const id = parseInt($(this).attr("data-station-id"), 10);
    selectedStationId = id;
    const station = allStations.find((s) => s.id === id);

    $(".station-card-item").removeClass("border-[var(--secondary)] ring-1 ring-[var(--secondary)]");
    $(this).addClass("border-[var(--secondary)] ring-1 ring-[var(--secondary)]");

    if (station && baliMap) {
      baliMap.flyTo(station.coordinates, 14, { duration: 1.2 });
    }
  });
}

/* ==========================================
   THIRD PARTY PLUGINS (SimpleParallax, AOS, Typed, Fancybox)
   ========================================== */
function initPlugins() {
  // SimpleParallax
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

  // AnimateOnScroll (AOS)
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
  }

  // Typed.js
  if (typeof Typed !== "undefined" && document.querySelector("#typed-hero-badge")) {
    new Typed("#typed-hero-badge", {
      strings: ["Stay Charged", "Explore Without Limits", "Global EV Network"],
      typeSpeed: 60,
      backSpeed: 40,
      loop: true,
    });
  }

  // Fancybox
  if (typeof Fancybox !== "undefined") {
    Fancybox.bind("[data-fancybox]", {});
  }
}
