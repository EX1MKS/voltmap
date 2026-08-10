/**
 * VOLTMAP - Install Charge & P2P Sharing Page Logic
 * Dedicated module for installcharge.html
 */

import { renderNavbar } from "./navbar.js";
import { renderFooter } from "./footer.js";
import { initNavbarEntrance } from "./animations.js";

const $ = window.jQuery || window.$;

// P2P Calculator State
let p2pHours = 5;
let p2pKw = 22;
let isTransitioning = false;

$(document).ready(() => {
  const activePage = "install";

  // Render Navbar and Footer
  renderNavbar("#navbar-app", { activePage });
  renderFooter("#footer-app", { activePage });

  updateNavbarStyle();
  playCurtainEntrance();
  initNavigation();
  initNavbarEvents();

  // Initialize Hero Section Interactive Hover Switcher
  initHeroHoverSwitcher();

  // Initialize P2P Income Calculator
  initP2PCalculator();

  // Initialize Registration Form / Modal Events
  initHostRegistrationForm();

  // Initialize AOS if available
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true });
  }

  // Initialize Navbar Entrance Animations
  initNavbarEntrance();
});

/* ==========================================
   HERO HOVER SWITCHER LOGIC
   ========================================== */
function initHeroHoverSwitcher() {
  const $btnInstall = $("#btn-hero-install");
  const $btnShare = $("#btn-hero-share");
  const $bgLayer1 = $("#hero-bg-layer-1");
  const $bgLayer2 = $("#hero-bg-layer-2");
  const $badge = $("#hero-badge");
  const $badgeText = $("#hero-badge-text");
  const $title = $("#hero-title");
  const $subtitle = $("#hero-subtitle");
  const $cardImg = $("#hero-card-img");
  const $cardTitle = $("#hero-card-title");
  const $cardDesc = $("#hero-card-desc");

  if (!$btnInstall.length || !$btnShare.length) return;

  const modeData = {
    install: {
      badgeIcon: '<i class="fa-solid fa-house-chimney text-[#52C133]"></i>',
      badgeText: "Residential Charging Solutions",
      wordText: "HOME",
      subtitle: "Create a charging point of your own with certified fast wallbox installation for your residence.",
      bgImg: "../asset/img/images/wall.jpg",
      cardTitle: "VoltMap Home Wallbox 22kW",
      cardDesc: "Smart App Controlled • Residential Fast Charge"
    },
    share: {
      badgeIcon: '<i class="fa-solid fa-building text-[#52C133]"></i>',
      badgeText: "Business & P2P Network",
      wordText: "BUSINESS",
      subtitle: "Connect your charger to drivers worldwide and earn passive income with VoltMap P2P network.",
      bgImg: "../asset/img/images/station.jpg",
      cardTitle: "VoltMap Commercial Station",
      cardDesc: "P2P Sharing Verified • Automated Earnings"
    }
  };

  let currentMode = "install";

  function setHeroMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;
    const data = modeData[mode];

    if (mode === "install") {
      $btnInstall
        .addClass("bg-[#52C133] text-white ")
        .removeClass("bg-white text-black ");
      $btnShare
        .removeClass("bg-[#52C133] text-white ")
        .addClass("bg-white text-black ");

      $bgLayer1.removeClass("opacity-0").addClass("opacity-100");
      $bgLayer2.removeClass("opacity-100").addClass("opacity-0");
    } else {
      $btnShare
        .addClass("bg-[#52C133] text-white ")
        .removeClass("bg-white text-black ");
      $btnInstall
        .removeClass("bg-[#52C133] text-white ")
        .addClass("bg-white text-black  ");

      $bgLayer2.removeClass("opacity-0").addClass("opacity-100");
      $bgLayer1.removeClass("opacity-100").addClass("opacity-0");
    }

    // Smooth transition for text and card
    $title.add($subtitle).css("opacity", "0");
    $cardImg.css("opacity", "0.3");

    setTimeout(() => {
      if ($badge.length) {
        $badge.find("i").replaceWith(data.badgeIcon);
        $badgeText.text(data.badgeText);
      }
      $("#hero-title-word").text(data.wordText);
      $subtitle.text(data.subtitle);

      if ($cardImg.length) {
        $cardImg.attr("src", data.bgImg);
        $cardTitle.text(data.cardTitle);
        $cardDesc.text(data.cardDesc);
      }

      $title.add($subtitle).css("opacity", "1");
      $cardImg.css("opacity", "1");
    }, 200);
  }

  $btnInstall.on("mouseenter focus", () => setHeroMode("install"));
  $btnShare.on("mouseenter focus", () => setHeroMode("share"));
}

/* ==========================================
   P2P CALCULATOR WIDGET LOGIC
   ========================================== */
function initP2PCalculator() {
  const $hoursSlider = $("#p2p-hours-slider");
  const $hoursLabel = $("#p2p-hours-label");

  if ($hoursSlider.length) {
    $hoursSlider.on("input", function () {
      p2pHours = parseInt($(this).val(), 10);
      if ($hoursLabel.length) {
        $hoursLabel.text(`${p2pHours} Jam`);
      }
      updateP2PIncome();
    });
  }

  $(document).on("click", "[data-p2p-kw]", function () {
    p2pKw = parseInt($(this).attr("data-p2p-kw"), 10);
    $("[data-p2p-kw]").each(function () {
      const kw = parseInt($(this).attr("data-p2p-kw"), 10);
      if (kw === p2pKw) {
        $(this)
          .addClass("bg-[var(--secondary)] text-white border-[var(--secondary)] shadow-sm")
          .removeClass("bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100");
      } else {
        $(this)
          .removeClass("bg-[var(--secondary)] text-white border-[var(--secondary)] shadow-sm")
          .addClass("bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100");
      }
    });
    updateP2PIncome();
  });

  // Initial calculation trigger
  updateP2PIncome();
}

function updateP2PIncome() {
  const monthly = Math.round(p2pHours * p2pKw * 0.35 * 30);
  const $display = $("#p2p-income-display");
  if ($display.length) {
    $display.html(`$${monthly.toLocaleString()} <span class="text-xs font-bold text-gray-500 font-sans">/ bulan</span>`);
  }
}

/* ==========================================
   HOST REGISTRATION FORM / MODAL LOGIC
   ========================================== */
function initHostRegistrationForm() {
  $("#host-registration-form").on("submit", function (e) {
    e.preventDefault();

    const name = $("#host-name").val();
    const phone = $("#host-phone").val();
    const city = $("#host-city").val();
    const wallbox = $("#host-wallbox").val();

    if (!name || !phone || !city) {
      alert("Harap lengkapi semua bidang formulir pendaftaran.");
      return;
    }

    const $btn = $(this).find('button[type="submit"]');
    const originalText = $btn.html();

    $btn.html('<i class="fa-solid fa-circle-notch animate-spin"></i> Memproses...').prop("disabled", true);

    setTimeout(() => {
      $btn.html('<i class="fa-solid fa-check"></i> Pendaftaran Berhasil!').addClass("bg-emerald-600");

      const $modal = $("#registration-success-modal");
      if ($modal.length) {
        $modal.removeClass("hidden flex").addClass("flex");
      } else {
        alert(`Terima kasih ${name}! Tim teknisi VoltMap akan menghubungi Anda di ${phone} untuk verifikasi lokasi di ${city}.`);
      }

      $("#host-registration-form")[0].reset();

      setTimeout(() => {
        $btn.html(originalText).removeClass("bg-emerald-600").prop("disabled", false);
      }, 3000);
    }, 1200);
  });

  $("#close-modal-btn").on("click", function () {
    $("#registration-success-modal").addClass("hidden").removeClass("flex");
  });
}

/* ==========================================
   CURTAIN & NAVIGATION SYSTEM
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
  if ($curtain.length && (event.persisted || sessionStorage.getItem("voltmap_transition") === "true" || !$curtain.hasClass("hidden"))) {
    playCurtainEntrance();
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
    }, 450);
  } else {
    window.location.href = destinationUrl;
  }
}

function initNavigation() {
  $(document).on("click", "[data-nav-target]", function (e) {
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

  $(document).on("click", 'a[href="index.html"], a[href="exploremap.html"], a[href="installcharge.html"]', function (e) {
    const href = $(this).attr("href");
    const currentFile = window.location.pathname.split("/").pop();

    if (href !== currentFile && (href === "index.html" || href === "exploremap.html" || href === "installcharge.html")) {
      e.preventDefault();
      performPageTransition(href);
    }
  });
}

function updateNavbarStyle() {
  const scrollY = window.scrollY;
  const isTransparent = !scrollY || scrollY <= 50;
  const $container = $("#navbar-container");
  const $logo = $("#nav-logo");

  if (!$container.length) return;

  if (isTransparent) {
    $container
      .addClass("bg-transparent border-transparent shadow-none")
      .removeClass("bg-white/95 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.08)] border-gray-100");
    $logo.addClass("text-white").removeClass("text-[var(--primary)]");

    $(".nav-link-btn").each(function () {
      if ($(this).hasClass("text-secondary")) return;
      $(this)
        .addClass("text-white/90 hover:text-white")
        .removeClass("text-gray-700 hover:text-[var(--primary)] text-black/90 hover:text-black");
    });

    $(".nav-icon-circle")
      .addClass("bg-white/15 text-white border-white/20 hover:bg-white/25")
      .removeClass("bg-[#F3F3F3] text-gray-800 hover:bg-[#EAEAEA]");
  } else {
    $container
      .removeClass("bg-transparent border-transparent shadow-none")
      .addClass("bg-white/95 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.08)] border-gray-100");
    $logo.removeClass("text-white").addClass("text-[var(--primary)]");

    $(".nav-link-btn").each(function () {
      if ($(this).hasClass("text-secondary")) return;
      $(this)
        .removeClass("text-white/90 hover:text-white")
        .addClass("text-gray-700 hover:text-[var(--primary)]");
    });

    $(".nav-icon-circle")
      .removeClass("bg-white/15 text-white border-white/20 hover:bg-white/25")
      .addClass("bg-[#F3F3F3] text-gray-800 hover:bg-[#EAEAEA]");
  }
}

function initNavbarEvents() {
  $(window).on("scroll", () => {
    updateNavbarStyle();
  });

  $(document).on("click", "#mobile-hamburger-btn", function () {
    const $drawer = $("#mobile-drawer");
    const isOpen = $drawer.attr("data-open") === "true";

    if (isOpen) {
      $drawer
        .attr("data-open", "false")
        .addClass("pointer-events-none opacity-0 -translate-y-5")
        .removeClass("pointer-events-auto opacity-100 translate-y-0");
    } else {
      $drawer
        .attr("data-open", "true")
        .removeClass("pointer-events-none opacity-0 -translate-y-5")
        .addClass("pointer-events-auto opacity-100 translate-y-0");
    }
  });
}
